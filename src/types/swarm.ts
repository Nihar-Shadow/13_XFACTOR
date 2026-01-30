// Sky Guardian Swarm - Core Type Definitions

export type DroneRole = 'master' | 'slave' | 'virtual';
export type TaskType = 'scout' | 'observer' | 'relay' | 'attack' | 'idle';
export type FormationType = 'line' | 'grid' | 'circle';
export type DroneHealth = 'healthy' | 'warning' | 'critical' | 'destroyed';

export interface Position {
  x: number;
  y: number;
  z?: number;
}

export interface Velocity {
  vx: number;
  vy: number;
  vz?: number;
}

// P2P Mesh Network - Neighbor connection info
export interface NeighborLink {
  droneId: string;
  distance: number;
  signalStrength: number; // 0-100
  latency: number; // ms
  isJammed: boolean;
}

export interface DroneState {
  id: string;
  position: Position;
  velocity: Velocity;
  battery: number;
  role: DroneRole;
  task: TaskType;
  health: DroneHealth;
  heading: number; // degrees
  lastHeartbeat: number;
  isPhoneAgent?: boolean;
  // P2P mesh networking
  neighbors: NeighborLink[];
  isInJammingZone: boolean;
  assignedTargetId?: string;
  avoidanceVector: Velocity;
}

// Target for drone missions
export interface Target {
  id: string;
  position: Position;
  priority: number; // 1-5, higher is more important
  type: 'observe' | 'attack' | 'relay';
  status: 'pending' | 'assigned' | 'completed';
  assignedDroneId?: string;
}

// Electronic jamming zone
export interface JammingZone {
  id: string;
  center: Position;
  radius: number;
  intensity: number; // 0-100, affects signal degradation
}

export interface SwarmState {
  drones: DroneState[];
  masterId: string | null;
  formation: FormationType;
  missionActive: boolean;
  electionInProgress: boolean;
  heartbeatInterval: number;
  heartbeatTimeout: number;
  // V2 additions
  targets: Target[];
  jammingZones: JammingZone[];
  threatHeatmap: number[][]; // Grid of threat levels
}

export interface ElectionEvent {
  timestamp: number;
  type: 'master_lost' | 'election_start' | 'vote' | 'election_complete' | 'master_announce' | 'jamming_detected' | 'target_assigned' | 'avoidance_active';
  details: string;
  candidateId?: string;
  winnerId?: string;
  reason?: string;
}

export interface HeartbeatMessage {
  masterId: string;
  timestamp: number;
  swarmSize: number;
  formation: FormationType;
}

export interface PhonePose {
  latitude: number;
  longitude: number;
  heading: number;
  speed: number;
  accuracy: number;
  timestamp: number;
}

// Simplified phone motion (accelerometer-only)
export interface PhoneMotion {
  type: 'motion';
  x: number; // forward/back tilt (-1 to 1)
  y: number; // left/right tilt (-1 to 1)
  yaw: number; // rotation (-1 to 1)
  timestamp: number;
}

export interface SwarmMetrics {
  totalAgents: number;
  activeAgents: number;
  averageBattery: number;
  formationIntegrity: number; // 0-100%
  masterUptime: number; // seconds
  electionsTriggered: number;
  targetsCompleted: number;
  jammedDrones: number;
}

// Boids algorithm parameters
export interface BoidsParams {
  separationWeight: number;
  alignmentWeight: number;
  cohesionWeight: number;
  separationRadius: number;
  alignmentRadius: number;
  cohesionRadius: number;
  maxSpeed: number;
  maxForce: number;
}
