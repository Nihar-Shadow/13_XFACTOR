// Sky Guardian Swarm Simulation Hook V2
// Manages real-time swarm state, P2P mesh, targets, jamming zones, and elections

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  DroneState,
  SwarmState,
  ElectionEvent,
  FormationType,
  Position,
  PhoneMotion,
  Target,
} from '@/types/swarm';
import {
  initializeSwarm,
  generateFormation,
  electNewMaster,
  shouldTransferLeadership,
  calculateBoidsMovement,
  allocateTasks,
  drainBattery,
  calculateHealth,
  createDrone,
  calculateNeighbors,
  isInJammingZone,
  calculateAvoidanceVector,
} from '@/lib/swarm-engine';

const AREA_SIZE = { width: 800, height: 600 };
const SIMULATION_TICK = 50; // 20 FPS
const HEARTBEAT_INTERVAL = 1000;
const HEARTBEAT_TIMEOUT = 3000;

export function useSwarmSimulation(initialDroneCount: number = 10) {
  const [swarm, setSwarm] = useState<SwarmState>(() =>
    initializeSwarm(initialDroneCount, AREA_SIZE)
  );
  const [events, setEvents] = useState<ElectionEvent[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [phoneConnected, setPhoneConnected] = useState(false);
  const [meshVisibility, setMeshVisibility] = useState({
    master: true,
    slave: true,
    phone: true,
    jamZone: true,
  });
  
  const lastHeartbeatRef = useRef<number>(Date.now());
  const masterStartTimeRef = useRef<number>(Date.now());
  const electionCountRef = useRef<number>(0);
  const phoneMotionRef = useRef<PhoneMotion | null>(null);

  // Add event to the log
  const addEvent = useCallback((event: ElectionEvent) => {
    setEvents(prev => [event, ...prev].slice(0, 50));
  }, []);

  // Handle master failure and trigger election
  const triggerElection = useCallback(() => {
    setSwarm(prev => {
      if (prev.electionInProgress) return prev;

      addEvent({
        timestamp: Date.now(),
        type: 'master_lost',
        details: `Master ${prev.masterId} lost - initiating election`,
      });

      const candidates = prev.drones.filter(d => d.health !== 'destroyed');
      const newMaster = electNewMaster(candidates, addEvent);

      if (newMaster) {
        electionCountRef.current++;
        masterStartTimeRef.current = Date.now();

        addEvent({
          timestamp: Date.now(),
          type: 'master_announce',
          details: `${newMaster.id} broadcasting I_AM_MASTER to swarm`,
          winnerId: newMaster.id,
        });

        const updatedDrones = prev.drones.map(d => ({
          ...d,
          role: d.id === newMaster.id ? 'master' as const : 
                d.role === 'master' ? 'slave' as const : d.role,
          lastHeartbeat: Date.now(),
        }));

        const { drones: taskedDrones, targets } = allocateTasks(updatedDrones, newMaster.id, prev.targets);

        return {
          ...prev,
          drones: taskedDrones,
          targets,
          masterId: newMaster.id,
          electionInProgress: false,
        };
      }

      return { ...prev, masterId: null, electionInProgress: false };
    });
  }, [addEvent]);

  // Kill the current master (simulates destruction)
  const killMaster = useCallback(() => {
    setSwarm(prev => {
      if (!prev.masterId) return prev;

      const updatedDrones = prev.drones.map(d =>
        d.id === prev.masterId
          ? { ...d, health: 'destroyed' as const, battery: 0, role: 'slave' as const }
          : d
      );

      return { ...prev, drones: updatedDrones, masterId: null };
    });

    setTimeout(triggerElection, 500);
  }, [triggerElection]);

  // Change formation
  const changeFormation = useCallback((formation: FormationType) => {
    setSwarm(prev => ({ ...prev, formation }));
    addEvent({
      timestamp: Date.now(),
      type: 'master_announce',
      details: `Formation changed to ${formation.toUpperCase()}`,
    });
  }, [addEvent]);

  // Toggle mission state
  const toggleMission = useCallback(() => {
    setSwarm(prev => {
      const newState = !prev.missionActive;
      addEvent({
        timestamp: Date.now(),
        type: 'master_announce',
        details: newState ? 'Mission STARTED' : 'Mission STOPPED',
      });
      
      if (newState) {
        // Allocate tasks when mission starts
        const { drones, targets } = allocateTasks(prev.drones, prev.masterId!, prev.targets);
        return { ...prev, missionActive: newState, drones, targets };
      }
      
      return { ...prev, missionActive: newState };
    });
  }, [addEvent]);

  // Connect phone as virtual drone agent (simplified)
  const connectPhone = useCallback(() => {
    setPhoneConnected(true);
    setSwarm(prev => {
      const phoneDrone = createDrone('mobile_drone', { x: AREA_SIZE.width / 2, y: AREA_SIZE.height - 100 }, true);
      phoneDrone.role = 'slave';
      phoneDrone.task = 'relay';
      
      addEvent({
        timestamp: Date.now(),
        type: 'master_announce',
        details: 'Mobile drone joined swarm (accelerometer control)',
      });

      return {
        ...prev,
        drones: [...prev.drones, phoneDrone],
      };
    });
  }, [addEvent]);

  // Update phone motion from accelerometer (simplified)
  const updatePhoneMotion = useCallback((motion: PhoneMotion) => {
    phoneMotionRef.current = motion;
  }, []);

  // Disconnect phone
  const disconnectPhone = useCallback(() => {
    setPhoneConnected(false);
    phoneMotionRef.current = null;
    setSwarm(prev => ({
      ...prev,
      drones: prev.drones.filter(d => !d.isPhoneAgent),
    }));
    addEvent({
      timestamp: Date.now(),
      type: 'master_announce',
      details: 'Mobile drone disconnected from swarm',
    });
  }, [addEvent]);

  // Main simulation loop
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      const now = Date.now();

      setSwarm(prev => {
        // Generate target positions based on formation
        const center: Position = { x: AREA_SIZE.width / 2, y: AREA_SIZE.height / 2 };
        const activeDrones = prev.drones.filter(d => d.health !== 'destroyed' && !d.isPhoneAgent);
        const targetPositions = generateFormation(center, activeDrones.length, prev.formation, 80);

        // Update each drone
        const updatedDrones = prev.drones.map((drone, idx) => {
          if (drone.health === 'destroyed') return drone;

          // Calculate P2P neighbors
          const neighbors = calculateNeighbors(drone, prev.drones, prev.jammingZones);
          
          // Check if in jamming zone
          const inJammingZone = isInJammingZone(drone, prev.jammingZones);
          
          // Calculate avoidance vector
          const avoidanceVector = calculateAvoidanceVector(drone, prev.jammingZones);

          // Phone agent - controlled by accelerometer
          if (drone.isPhoneAgent) {
            const motion = phoneMotionRef.current;
            let newVelocity = { vx: 0, vy: 0 };
            let newHeading = drone.heading;
            
            if (motion) {
              // Convert tilt to velocity: forward/back = y, left/right = x
              const speed = 3;
              newVelocity = {
                vx: motion.y * speed, // left/right tilt
                vy: -motion.x * speed, // forward/back tilt (inverted for screen coords)
              };
              // Apply yaw rotation
              newHeading = (drone.heading + motion.yaw * 5) % 360;
            }

            const newPosition: Position = {
              x: Math.max(20, Math.min(AREA_SIZE.width - 20, drone.position.x + newVelocity.vx)),
              y: Math.max(20, Math.min(AREA_SIZE.height - 20, drone.position.y + newVelocity.vy)),
            };

            return {
              ...drone,
              position: newPosition,
              velocity: newVelocity,
              heading: newHeading,
              battery: drainBattery(drone, SIMULATION_TICK),
              health: calculateHealth(drone.battery),
              neighbors,
              isInJammingZone: inJammingZone,
              avoidanceVector,
            };
          }

          // Find target position for this drone
          const activeIdx = activeDrones.findIndex(d => d.id === drone.id);
          let target = targetPositions[activeIdx] || drone.position;
          
          // If drone has assigned target, navigate toward it
          if (drone.assignedTargetId) {
            const assignedTarget = prev.targets.find(t => t.id === drone.assignedTargetId);
            if (assignedTarget) {
              target = assignedTarget.position;
            }
          }

          // Calculate new velocity using Boids algorithm with jamming avoidance
          const newVelocity = calculateBoidsMovement(drone, prev.drones, target, prev.jammingZones);

          // Update position
          const newPosition: Position = {
            x: Math.max(20, Math.min(AREA_SIZE.width - 20, drone.position.x + newVelocity.vx)),
            y: Math.max(20, Math.min(AREA_SIZE.height - 20, drone.position.y + newVelocity.vy)),
          };

          // Calculate heading from velocity
          const heading = Math.atan2(newVelocity.vy, newVelocity.vx) * (180 / Math.PI);

          // Drain battery
          const newBattery = drainBattery({ ...drone, velocity: newVelocity, isInJammingZone: inJammingZone }, SIMULATION_TICK);
          const newHealth = calculateHealth(newBattery);

          return {
            ...drone,
            position: newPosition,
            velocity: newVelocity,
            heading,
            battery: newBattery,
            health: newHealth,
            lastHeartbeat: drone.role === 'master' ? now : drone.lastHeartbeat,
            neighbors,
            isInJammingZone: inJammingZone,
            avoidanceVector,
          };
        });

        // Check target completion
        const updatedTargets = prev.targets.map(target => {
          if (target.status !== 'assigned') return target;
          
          const assignedDrone = updatedDrones.find(d => d.id === target.assignedDroneId);
          if (!assignedDrone) return target;
          
          const dx = assignedDrone.position.x - target.position.x;
          const dy = assignedDrone.position.y - target.position.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 30) {
            return { ...target, status: 'completed' as const };
          }
          return target;
        });

        // Check master heartbeat and trigger election if needed
        const master = updatedDrones.find(d => d.id === prev.masterId);
        
        if (master) {
          if (shouldTransferLeadership(master)) {
            setTimeout(() => {
              addEvent({
                timestamp: Date.now(),
                type: 'master_lost',
                details: `Master ${master.id} battery critical (${master.battery.toFixed(1)}%) - initiating leadership transfer`,
              });
              triggerElection();
            }, 100);
          }
          lastHeartbeatRef.current = now;
        } else if (prev.masterId && !prev.electionInProgress) {
          if (now - lastHeartbeatRef.current > HEARTBEAT_TIMEOUT) {
            setTimeout(triggerElection, 100);
          }
        }

        return { ...prev, drones: updatedDrones, targets: updatedTargets };
      });
    }, SIMULATION_TICK);

    return () => clearInterval(interval);
  }, [isPaused, triggerElection, addEvent]);

  // Heartbeat broadcasting simulation
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setSwarm(prev => {
        if (!prev.masterId) return prev;

        const updatedDrones = prev.drones.map(d => ({
          ...d,
          lastHeartbeat: d.id === prev.masterId ? Date.now() : d.lastHeartbeat,
        }));

        return { ...prev, drones: updatedDrones };
      });
    }, HEARTBEAT_INTERVAL);

    return () => clearInterval(interval);
  }, [isPaused]);

  return {
    swarm,
    events,
    isPaused,
    phoneConnected,
    meshVisibility,
    masterUptime: Date.now() - masterStartTimeRef.current,
    electionCount: electionCountRef.current,
    areaSize: AREA_SIZE,
    actions: {
      killMaster,
      changeFormation,
      toggleMission,
      togglePause: () => setIsPaused(p => !p),
      connectPhone,
      disconnectPhone,
      updatePhoneMotion,
      toggleMeshVisibility: (key: 'master' | 'slave' | 'phone' | 'jamZone') => 
        setMeshVisibility(prev => ({ ...prev, [key]: !prev[key] })),
    },
  };
}
