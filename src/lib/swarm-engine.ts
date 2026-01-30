// Sky Guardian Swarm Engine - Core Simulation Logic
// Handles drone behavior, elections, formations, P2P mesh, and threat avoidance

import { 
  DroneState, 
  SwarmState, 
  ElectionEvent, 
  FormationType, 
  Position, 
  BoidsParams,
  TaskType,
  Target,
  JammingZone,
  NeighborLink,
  Velocity
} from '@/types/swarm';

// Default Boids parameters for realistic flocking behavior
const DEFAULT_BOIDS: BoidsParams = {
  separationWeight: 1.5,
  alignmentWeight: 1.0,
  cohesionWeight: 1.0,
  separationRadius: 50,
  alignmentRadius: 100,
  cohesionRadius: 150,
  maxSpeed: 3,
  maxForce: 0.1,
};

// P2P mesh configuration
const P2P_RANGE = 200; // Max distance for peer connection
const JAMMING_SIGNAL_REDUCTION = 0.7; // 70% signal reduction in jamming zones

// Formation generation functions
export function generateFormation(
  center: Position,
  count: number,
  type: FormationType,
  spacing: number = 80
): Position[] {
  const positions: Position[] = [];

  switch (type) {
    case 'line':
      for (let i = 0; i < count; i++) {
        positions.push({
          x: center.x + (i - (count - 1) / 2) * spacing,
          y: center.y,
        });
      }
      break;

    case 'grid': {
      const cols = Math.ceil(Math.sqrt(count));
      const rows = Math.ceil(count / cols);
      let idx = 0;
      for (let r = 0; r < rows && idx < count; r++) {
        for (let c = 0; c < cols && idx < count; c++) {
          positions.push({
            x: center.x + (c - (cols - 1) / 2) * spacing,
            y: center.y + (r - (rows - 1) / 2) * spacing,
          });
          idx++;
        }
      }
      break;
    }

    case 'circle': {
      const radius = spacing * count / (2 * Math.PI);
      for (let i = 0; i < count; i++) {
        const angle = (2 * Math.PI * i) / count - Math.PI / 2;
        positions.push({
          x: center.x + radius * Math.cos(angle),
          y: center.y + radius * Math.sin(angle),
        });
      }
      break;
    }
  }

  return positions;
}

// Initialize a new drone with random or specified parameters
export function createDrone(
  id: string,
  position: Position,
  isPhoneAgent: boolean = false
): DroneState {
  return {
    id,
    position,
    velocity: { vx: 0, vy: 0 },
    battery: isPhoneAgent ? 85 : 50 + Math.random() * 50, // 50-100%
    role: 'slave',
    task: 'idle',
    health: 'healthy',
    heading: Math.random() * 360,
    lastHeartbeat: Date.now(),
    isPhoneAgent,
    neighbors: [],
    isInJammingZone: false,
    avoidanceVector: { vx: 0, vy: 0 },
  };
}

// Initialize swarm with exactly 10 drones
export function initializeSwarm(count: number, areaSize: { width: number; height: number }): SwarmState {
  const droneCount = 10; // Fixed at 10 drones for V2
  const drones: DroneState[] = [];
  
  // Randomize initial positions
  for (let i = 0; i < droneCount; i++) {
    const position: Position = {
      x: 100 + Math.random() * (areaSize.width - 200),
      y: 100 + Math.random() * (areaSize.height - 200),
    };
    const drone = createDrone(`drone_${i + 1}`, position);
    
    // First drone starts as master with high battery
    if (i === 0) {
      drone.role = 'master';
      drone.battery = 90 + Math.random() * 10; // 90-100%
    }
    drones.push(drone);
  }

  // Initialize targets (3-5 static targets)
  const targetCount = 3 + Math.floor(Math.random() * 3); // 3-5 targets
  const targets: Target[] = [];
  for (let i = 0; i < targetCount; i++) {
    targets.push({
      id: `target_${i + 1}`,
      position: {
        x: 80 + Math.random() * (areaSize.width - 160),
        y: 80 + Math.random() * (areaSize.height - 160),
      },
      priority: 1 + Math.floor(Math.random() * 5),
      type: ['observe', 'attack', 'relay'][Math.floor(Math.random() * 3)] as Target['type'],
      status: 'pending',
    });
  }

  // Initialize jamming zones (1-2 zones)
  const jammingCount = 1 + Math.floor(Math.random() * 2);
  const jammingZones: JammingZone[] = [];
  for (let i = 0; i < jammingCount; i++) {
    jammingZones.push({
      id: `jam_${i + 1}`,
      center: {
        x: 150 + Math.random() * (areaSize.width - 300),
        y: 150 + Math.random() * (areaSize.height - 300),
      },
      radius: 80 + Math.random() * 60, // 80-140px radius
      intensity: 60 + Math.random() * 40, // 60-100% intensity
    });
  }

  return {
    drones,
    masterId: drones[0].id,
    formation: 'circle',
    missionActive: false,
    electionInProgress: false,
    heartbeatInterval: 1000,
    heartbeatTimeout: 3000,
    targets,
    jammingZones,
    threatHeatmap: [],
  };
}

// Calculate P2P neighbor connections for a drone
export function calculateNeighbors(
  drone: DroneState,
  allDrones: DroneState[],
  jammingZones: JammingZone[]
): NeighborLink[] {
  const neighbors: NeighborLink[] = [];
  
  for (const other of allDrones) {
    if (other.id === drone.id || other.health === 'destroyed') continue;
    
    const dx = other.position.x - drone.position.x;
    const dy = other.position.y - drone.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance <= P2P_RANGE) {
      // Calculate signal strength based on distance
      let signalStrength = 100 * (1 - distance / P2P_RANGE);
      
      // Check if link passes through jamming zone
      let isJammed = false;
      for (const zone of jammingZones) {
        if (isLineIntersectingCircle(drone.position, other.position, zone.center, zone.radius)) {
          signalStrength *= (1 - JAMMING_SIGNAL_REDUCTION * (zone.intensity / 100));
          isJammed = true;
        }
      }
      
      // Add latency simulation (increases with distance and jamming)
      const baseLatency = 10 + distance / 10;
      const latency = isJammed ? baseLatency * 3 : baseLatency;
      
      neighbors.push({
        droneId: other.id,
        distance,
        signalStrength: Math.max(0, signalStrength),
        latency,
        isJammed,
      });
    }
  }
  
  return neighbors.sort((a, b) => a.distance - b.distance);
}

// Check if a line segment intersects a circle
function isLineIntersectingCircle(p1: Position, p2: Position, center: Position, radius: number): boolean {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const fx = p1.x - center.x;
  const fy = p1.y - center.y;
  
  const a = dx * dx + dy * dy;
  const b = 2 * (fx * dx + fy * dy);
  const c = fx * fx + fy * fy - radius * radius;
  
  const discriminant = b * b - 4 * a * c;
  if (discriminant < 0) return false;
  
  const t1 = (-b - Math.sqrt(discriminant)) / (2 * a);
  const t2 = (-b + Math.sqrt(discriminant)) / (2 * a);
  
  return (t1 >= 0 && t1 <= 1) || (t2 >= 0 && t2 <= 1);
}

// Check if drone is inside a jamming zone
export function isInJammingZone(drone: DroneState, jammingZones: JammingZone[]): boolean {
  for (const zone of jammingZones) {
    const dx = drone.position.x - zone.center.x;
    const dy = drone.position.y - zone.center.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < zone.radius) {
      return true;
    }
  }
  return false;
}

// Calculate avoidance vector for jamming zones
export function calculateAvoidanceVector(
  drone: DroneState,
  jammingZones: JammingZone[],
  strength: number = 2.0
): Velocity {
  let avoidX = 0;
  let avoidY = 0;
  
  for (const zone of jammingZones) {
    const dx = drone.position.x - zone.center.x;
    const dy = drone.position.y - zone.center.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Calculate avoidance if within 1.5x radius
    const avoidanceRadius = zone.radius * 1.5;
    if (distance < avoidanceRadius && distance > 0) {
      const avoidanceStrength = strength * (1 - distance / avoidanceRadius) * (zone.intensity / 100);
      avoidX += (dx / distance) * avoidanceStrength;
      avoidY += (dy / distance) * avoidanceStrength;
    }
  }
  
  return { vx: avoidX, vy: avoidY };
}

// Leader Election Algorithm
// Criteria: Highest battery wins, tiebreaker is lowest ID
export function electNewMaster(
  candidates: DroneState[],
  onEvent: (event: ElectionEvent) => void
): DroneState | null {
  // Filter out destroyed or critical drones
  const eligibleCandidates = candidates.filter(
    d => d.health !== 'destroyed' && d.health !== 'critical' && d.battery > 10
  );

  if (eligibleCandidates.length === 0) {
    onEvent({
      timestamp: Date.now(),
      type: 'election_complete',
      details: 'No eligible candidates - swarm has no leader',
    });
    return null;
  }

  // Log election start
  onEvent({
    timestamp: Date.now(),
    type: 'election_start',
    details: `Election started with ${eligibleCandidates.length} candidates`,
  });

  // Sort by battery (desc), then by ID (asc) for tiebreaker
  eligibleCandidates.sort((a, b) => {
    if (b.battery !== a.battery) {
      return b.battery - a.battery;
    }
    return a.id.localeCompare(b.id);
  });

  // Log voting for top candidates
  eligibleCandidates.slice(0, 3).forEach((candidate, i) => {
    onEvent({
      timestamp: Date.now(),
      type: 'vote',
      details: `Candidate ${i + 1}: ${candidate.id} (Battery: ${candidate.battery.toFixed(1)}%)`,
      candidateId: candidate.id,
    });
  });

  const winner = eligibleCandidates[0];

  onEvent({
    timestamp: Date.now(),
    type: 'election_complete',
    details: `Election complete: ${winner.id} elected as new master`,
    winnerId: winner.id,
    reason: `Highest battery (${winner.battery.toFixed(1)}%)`,
  });

  return winner;
}

// Check if master should proactively transfer leadership (battery < 20%)
export function shouldTransferLeadership(master: DroneState): boolean {
  return master.battery < 20 && master.health !== 'destroyed';
}

// Boids-based movement calculation with jamming avoidance
export function calculateBoidsMovement(
  drone: DroneState,
  neighbors: DroneState[],
  targetPosition: Position,
  jammingZones: JammingZone[] = [],
  params: BoidsParams = DEFAULT_BOIDS
): { vx: number; vy: number } {
  let separationX = 0, separationY = 0;
  let alignmentX = 0, alignmentY = 0;
  let cohesionX = 0, cohesionY = 0;
  let sepCount = 0, alignCount = 0, cohCount = 0;

  for (const other of neighbors) {
    if (other.id === drone.id || other.health === 'destroyed') continue;

    const dx = drone.position.x - other.position.x;
    const dy = drone.position.y - other.position.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Separation - steer away from nearby drones
    if (dist < params.separationRadius && dist > 0) {
      separationX += dx / dist;
      separationY += dy / dist;
      sepCount++;
    }

    // Alignment - match velocity with nearby drones
    if (dist < params.alignmentRadius) {
      alignmentX += other.velocity.vx;
      alignmentY += other.velocity.vy;
      alignCount++;
    }

    // Cohesion - steer toward center of nearby drones
    if (dist < params.cohesionRadius) {
      cohesionX += other.position.x;
      cohesionY += other.position.y;
      cohCount++;
    }
  }

  // Normalize and weight forces
  let fx = 0, fy = 0;

  if (sepCount > 0) {
    fx += (separationX / sepCount) * params.separationWeight;
    fy += (separationY / sepCount) * params.separationWeight;
  }

  if (alignCount > 0) {
    fx += (alignmentX / alignCount) * params.alignmentWeight * 0.1;
    fy += (alignmentY / alignCount) * params.alignmentWeight * 0.1;
  }

  if (cohCount > 0) {
    const centerX = cohesionX / cohCount;
    const centerY = cohesionY / cohCount;
    fx += (centerX - drone.position.x) * params.cohesionWeight * 0.01;
    fy += (centerY - drone.position.y) * params.cohesionWeight * 0.01;
  }

  // Add force toward target position
  const toTargetX = targetPosition.x - drone.position.x;
  const toTargetY = targetPosition.y - drone.position.y;
  const targetDist = Math.sqrt(toTargetX * toTargetX + toTargetY * toTargetY);
  
  if (targetDist > 5) {
    fx += (toTargetX / targetDist) * 0.5;
    fy += (toTargetY / targetDist) * 0.5;
  }

  // Add jamming zone avoidance
  const avoidance = calculateAvoidanceVector(drone, jammingZones);
  fx += avoidance.vx;
  fy += avoidance.vy;

  // Apply velocity with limits
  let newVx = drone.velocity.vx + fx * params.maxForce;
  let newVy = drone.velocity.vy + fy * params.maxForce;

  // Limit speed
  const speed = Math.sqrt(newVx * newVx + newVy * newVy);
  if (speed > params.maxSpeed) {
    newVx = (newVx / speed) * params.maxSpeed;
    newVy = (newVy / speed) * params.maxSpeed;
  }

  return { vx: newVx, vy: newVy };
}

// Task allocation with target assignment
export function allocateTasks(
  drones: DroneState[],
  masterId: string,
  targets: Target[]
): { drones: DroneState[]; targets: Target[] } {
  const updatedDrones = [...drones];
  const updatedTargets = [...targets];
  
  // Sort targets by priority (highest first)
  const pendingTargets = updatedTargets
    .filter(t => t.status === 'pending')
    .sort((a, b) => b.priority - a.priority);
  
  // Get available drones (not master, not phone, healthy)
  const availableDrones = updatedDrones.filter(
    d => d.id !== masterId && !d.isPhoneAgent && d.health !== 'destroyed' && d.task === 'idle'
  );
  
  // Assign drones to targets
  for (const target of pendingTargets) {
    if (availableDrones.length === 0) break;
    
    // Find closest available drone
    let closestDrone: DroneState | null = null;
    let closestDistance = Infinity;
    
    for (const drone of availableDrones) {
      const dx = drone.position.x - target.position.x;
      const dy = drone.position.y - target.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < closestDistance) {
        closestDistance = distance;
        closestDrone = drone;
      }
    }
    
    if (closestDrone) {
      // Assign drone to target
      const droneIdx = updatedDrones.findIndex(d => d.id === closestDrone!.id);
      const targetIdx = updatedTargets.findIndex(t => t.id === target.id);
      
      updatedDrones[droneIdx] = {
        ...updatedDrones[droneIdx],
        task: target.type === 'attack' ? 'attack' : target.type === 'observe' ? 'observer' : 'relay',
        assignedTargetId: target.id,
      };
      
      updatedTargets[targetIdx] = {
        ...updatedTargets[targetIdx],
        status: 'assigned',
        assignedDroneId: closestDrone.id,
      };
      
      // Remove from available list
      const availIdx = availableDrones.findIndex(d => d.id === closestDrone!.id);
      availableDrones.splice(availIdx, 1);
    }
  }
  
  // Assign remaining drones to standard roles
  updatedDrones.forEach((drone, i) => {
    if (drone.id === masterId) {
      updatedDrones[i] = { ...drone, task: 'observer' };
    } else if (drone.task === 'idle' && drone.health !== 'destroyed' && !drone.isPhoneAgent) {
      const tasks: TaskType[] = ['scout', 'observer', 'relay'];
      updatedDrones[i] = { ...drone, task: tasks[i % 3] };
    }
  });
  
  return { drones: updatedDrones, targets: updatedTargets };
}

// Calculate swarm metrics
export function calculateMetrics(swarm: SwarmState): {
  totalAgents: number;
  activeAgents: number;
  averageBattery: number;
  formationIntegrity: number;
  jammedDrones: number;
  targetsCompleted: number;
} {
  const activeDrones = swarm.drones.filter(d => d.health !== 'destroyed');
  const totalBattery = activeDrones.reduce((sum, d) => sum + d.battery, 0);
  const jammedDrones = activeDrones.filter(d => d.isInJammingZone).length;
  const targetsCompleted = swarm.targets.filter(t => t.status === 'completed').length;

  return {
    totalAgents: swarm.drones.length,
    activeAgents: activeDrones.length,
    averageBattery: activeDrones.length > 0 ? totalBattery / activeDrones.length : 0,
    formationIntegrity: (activeDrones.length / swarm.drones.length) * 100,
    jammedDrones,
    targetsCompleted,
  };
}

// Drain battery over time (simulation)
export function drainBattery(drone: DroneState, deltaMs: number): number {
  const drainRate = drone.role === 'master' ? 0.002 : 0.001; // Master uses more battery
  const movementDrain = Math.sqrt(
    drone.velocity.vx * drone.velocity.vx + 
    drone.velocity.vy * drone.velocity.vy
  ) * 0.0005;
  
  // Extra drain in jamming zone
  const jammingDrain = drone.isInJammingZone ? 0.001 : 0;
  
  return Math.max(0, drone.battery - (drainRate + movementDrain + jammingDrain) * (deltaMs / 1000));
}

// Determine drone health based on battery
export function calculateHealth(battery: number): DroneState['health'] {
  if (battery <= 0) return 'destroyed';
  if (battery < 15) return 'critical';
  if (battery < 30) return 'warning';
  return 'healthy';
}
