// Connection Lines Component - Visualizes P2P mesh network topology between drones

import { DroneState } from '@/types/swarm';

interface ConnectionLinesProps {
  drones: DroneState[];
  masterId: string | null;
}

export function ConnectionLines({ drones, masterId }: ConnectionLinesProps) {
  const activeDrones = drones.filter(d => d.health !== 'destroyed');

  // Build unique set of P2P connections from neighbor data
  const connections: { from: DroneState; to: DroneState; isMasterLink: boolean; signalStrength: number; isJammed: boolean }[] = [];
  const connectionSet = new Set<string>();

  activeDrones.forEach(drone => {
    drone.neighbors.forEach(neighbor => {
      const linkId = [drone.id, neighbor.droneId].sort().join('-');
      if (!connectionSet.has(linkId)) {
        connectionSet.add(linkId);
        const toDrone = activeDrones.find(d => d.id === neighbor.droneId);
        if (toDrone) {
          const isMasterLink = drone.id === masterId || neighbor.droneId === masterId;
          connections.push({
            from: drone,
            to: toDrone,
            isMasterLink,
            signalStrength: neighbor.signalStrength,
            isJammed: neighbor.isJammed,
          });
        }
      }
    });
  });

  return (
    <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
      <defs>
        <linearGradient id="masterGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
          <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
        </linearGradient>
        <linearGradient id="peerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.4" />
          <stop offset="50%" stopColor="hsl(var(--accent))" stopOpacity="0.2" />
          <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.4" />
        </linearGradient>
        <linearGradient id="jammedGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="hsl(var(--destructive))" stopOpacity="0.5" />
          <stop offset="50%" stopColor="hsl(var(--destructive))" stopOpacity="0.2" />
          <stop offset="100%" stopColor="hsl(var(--destructive))" stopOpacity="0.5" />
        </linearGradient>
      </defs>

      {connections.map(({ from, to, isMasterLink, signalStrength, isJammed }, idx) => {
        const strokeWidth = isMasterLink ? 2.5 : 1 + (signalStrength / 100);
        const gradient = isJammed ? 'url(#jammedGradient)' : isMasterLink ? 'url(#masterGradient)' : 'url(#peerGradient)';
        
        return (
          <g key={`${from.id}-${to.id}-${idx}`}>
            <line
              x1={from.position.x}
              y1={from.position.y}
              x2={to.position.x}
              y2={to.position.y}
              stroke={gradient}
              strokeWidth={strokeWidth}
              strokeDasharray={isJammed ? '2 4' : isMasterLink ? '8 4' : '4 4'}
              className="transition-all duration-300"
              opacity={signalStrength / 100}
            >
              {isMasterLink && !isJammed && (
                <animate
                  attributeName="stroke-dashoffset"
                  from="0"
                  to="24"
                  dur="1s"
                  repeatCount="indefinite"
                />
              )}
            </line>
            
            {/* Signal strength indicator at midpoint */}
            {signalStrength < 50 && (
              <circle
                cx={(from.position.x + to.position.x) / 2}
                cy={(from.position.y + to.position.y) / 2}
                r="3"
                fill={isJammed ? 'hsl(var(--destructive))' : 'hsl(var(--warning))'}
                opacity={0.6}
                className="animate-pulse"
              />
            )}
          </g>
        );
      })}
    </svg>
  );
}
