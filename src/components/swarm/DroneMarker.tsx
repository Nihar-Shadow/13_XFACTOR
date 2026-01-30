// Drone Marker Component - Visual representation of a drone on the tactical map

import { DroneState } from '@/types/swarm';
import { cn } from '@/lib/utils';

interface DroneMarkerProps {
  drone: DroneState;
  isMaster: boolean;
}

export function DroneMarker({ drone, isMaster }: DroneMarkerProps) {
  const { position, heading, health, battery, isPhoneAgent, task, isInJammingZone } = drone;

  // Determine marker color based on role and health
  const getMarkerClass = () => {
    if (health === 'destroyed') return 'opacity-30';
    if (isMaster) return 'drone-marker master';
    if (isPhoneAgent) return 'drone-marker virtual';
    return 'drone-marker slave';
  };

  const getHealthColor = () => {
    if (isInJammingZone) return 'text-destructive';
    switch (health) {
      case 'destroyed': return 'text-muted-foreground';
      case 'critical': return 'text-destructive';
      case 'warning': return 'text-warning';
      default: return isMaster ? 'text-primary' : isPhoneAgent ? 'text-warning' : 'text-accent';
    }
  };

  // Battery indicator color
  const getBatteryColor = () => {
    if (battery > 50) return 'bg-success';
    if (battery > 25) return 'bg-warning';
    return 'bg-destructive';
  };

  return (
    <div
      className={cn('drone-marker', getMarkerClass())}
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      {/* Jamming interference effect */}
      {isInJammingZone && health !== 'destroyed' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-8 h-8 rounded-full border border-destructive/50 animate-ping" />
        </div>
      )}

      {/* Drone icon - rotates based on heading */}
      <div
        className="relative"
        style={{ transform: `rotate(${heading + 90}deg)` }}
      >
        {/* Main drone body */}
        <svg
          width={isMaster ? 32 : isPhoneAgent ? 28 : 24}
          height={isMaster ? 32 : isPhoneAgent ? 28 : 24}
          viewBox="0 0 24 24"
          className={cn('transition-colors', getHealthColor(), isInJammingZone && 'animate-pulse')}
        >
          {isPhoneAgent ? (
            // Phone icon for virtual agent
            <g fill="currentColor">
              <rect x="6" y="2" width="12" height="20" rx="2" opacity="0.8" />
              <circle cx="12" cy="18" r="1.5" fill="currentColor" />
              <rect x="9" y="4" width="6" height="10" fill="currentColor" opacity="0.3" />
            </g>
          ) : (
            // Drone/quadcopter icon
            <g fill="currentColor">
              {/* Center body */}
              <circle cx="12" cy="12" r="3" opacity="0.9" />
              {/* Arms */}
              <rect x="10" y="4" width="4" height="6" rx="1" opacity="0.7" />
              <rect x="10" y="14" width="4" height="6" rx="1" opacity="0.7" />
              <rect x="4" y="10" width="6" height="4" rx="1" opacity="0.7" />
              <rect x="14" y="10" width="6" height="4" rx="1" opacity="0.7" />
              {/* Rotors */}
              <circle cx="6" cy="6" r="2.5" opacity="0.5" />
              <circle cx="18" cy="6" r="2.5" opacity="0.5" />
              <circle cx="6" cy="18" r="2.5" opacity="0.5" />
              <circle cx="18" cy="18" r="2.5" opacity="0.5" />
              {/* Direction indicator */}
              <polygon points="12,0 10,4 14,4" opacity="0.9" />
            </g>
          )}
        </svg>

        {/* Master crown indicator */}
        {isMaster && health !== 'destroyed' && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <svg width="12" height="10" viewBox="0 0 12 10" className="text-primary">
              <polygon
                points="6,0 0,8 2,10 6,6 10,10 12,8"
                fill="currentColor"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Drone ID and battery */}
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center">
        <span className={cn(
          'text-[10px] font-mono font-medium whitespace-nowrap',
          health === 'destroyed' ? 'text-muted-foreground line-through' : 'text-foreground'
        )}>
          {drone.id.replace('drone_', 'D').replace('mobile_drone', 'MOB')}
        </span>
        
        {/* Battery bar */}
        {health !== 'destroyed' && (
          <div className="w-8 h-1 bg-secondary rounded-full mt-0.5 overflow-hidden">
            <div
              className={cn('h-full transition-all duration-300', getBatteryColor())}
              style={{ width: `${battery}%` }}
            />
          </div>
        )}
      </div>

      {/* Task indicator */}
      {health !== 'destroyed' && task !== 'idle' && (
        <div className="absolute -right-2 -top-2">
          <div className={cn(
            'w-3 h-3 rounded-full text-[6px] flex items-center justify-center font-bold',
            task === 'scout' && 'bg-accent text-accent-foreground',
            task === 'observer' && 'bg-primary text-primary-foreground',
            task === 'relay' && 'bg-warning text-warning-foreground',
            task === 'attack' && 'bg-destructive text-destructive-foreground'
          )}>
            {task[0].toUpperCase()}
          </div>
        </div>
      )}

      {/* Pulse ring for master */}
      {isMaster && health !== 'destroyed' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-10 h-10 rounded-full border-2 border-primary/50 animate-pulse-ring" />
        </div>
      )}

      {/* Neighbor count indicator */}
      {health !== 'destroyed' && drone.neighbors.length > 0 && (
        <div className="absolute -left-2 -top-2">
          <div className="w-3 h-3 rounded-full bg-muted text-[6px] flex items-center justify-center font-mono text-muted-foreground">
            {drone.neighbors.length}
          </div>
        </div>
      )}
    </div>
  );
}
