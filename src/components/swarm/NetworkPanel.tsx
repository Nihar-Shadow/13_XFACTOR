// Network Panel Component - Displays swarm mesh network statistics
// Shows total agents, active links, master ID, and network health

import { DroneState } from '@/types/swarm';
import { calculateMeshStats } from './FullMeshLines';
import { cn } from '@/lib/utils';

interface NetworkPanelProps {
  drones: DroneState[];
  masterId: string | null;
}

export function NetworkPanel({ drones, masterId }: NetworkPanelProps) {
  const stats = calculateMeshStats(drones, masterId);

  return (
    <div className="tactical-panel">
      <div className="tactical-panel-header flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
        <span>Swarm Network</span>
      </div>

      <div className="p-3 space-y-3">
        {/* Network Stats Grid */}
        <div className="grid grid-cols-2 gap-2">
          {/* Total Agents */}
          <div className="p-2 bg-secondary/30 rounded border border-border">
            <div className="text-[9px] text-muted-foreground uppercase tracking-wide">
              Agents Connected
            </div>
            <div className="font-mono text-lg font-bold text-success">
              {stats.totalAgents}
            </div>
          </div>

          {/* Total Links */}
          <div className="p-2 bg-secondary/30 rounded border border-border">
            <div className="text-[9px] text-muted-foreground uppercase tracking-wide">
              Active Links
            </div>
            <div className="font-mono text-lg font-bold text-success">
              {stats.totalLinks}
            </div>
          </div>
        </div>

        {/* Current Master */}
        <div className="p-2 bg-secondary/30 rounded border border-border">
          <div className="flex items-center justify-between">
            <div className="text-[9px] text-muted-foreground uppercase tracking-wide">
              Current Master
            </div>
            <div className="status-indicator master" />
          </div>
          <div className="font-mono text-sm font-bold text-primary mt-1">
            {stats.masterId?.replace('drone_', 'DRONE-') || 'NO MASTER'}
          </div>
        </div>

        {/* Network Health Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Network Health</span>
            <span className={cn(
              'font-mono font-bold',
              stats.networkHealth > 75 ? 'text-success' :
              stats.networkHealth > 50 ? 'text-warning' : 'text-destructive'
            )}>
              {stats.networkHealth.toFixed(0)}%
            </span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full transition-all duration-500',
                stats.networkHealth > 75 ? 'bg-success' :
                stats.networkHealth > 50 ? 'bg-warning' : 'bg-destructive'
              )}
              style={{ width: `${stats.networkHealth}%` }}
            />
          </div>
        </div>

        {/* Mesh Topology Indicator */}
        <div className="flex items-center gap-2 p-2 bg-success/10 rounded border border-success/30">
          <svg width="16" height="16" viewBox="0 0 24 24" className="text-success">
            <path
              fill="currentColor"
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
            />
          </svg>
          <div className="text-xs">
            <span className="text-success font-mono font-bold">FULL MESH</span>
            <span className="text-muted-foreground ml-1">P2P Active</span>
          </div>
        </div>

        {/* Visual Legend */}
        <div className="text-[9px] text-muted-foreground space-y-1 pt-1 border-t border-border">
          <div className="flex items-center gap-2">
            <div className="w-6 h-0 border-t border-dashed border-success" />
            <span>Peer Link</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-0 border-t-2 border-dashed border-primary" />
            <span>Master Link</span>
          </div>
        </div>
      </div>
    </div>
  );
}
