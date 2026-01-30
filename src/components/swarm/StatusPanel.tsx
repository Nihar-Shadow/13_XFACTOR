// Status Panel Component - Displays swarm metrics and master status V2

import { SwarmState } from '@/types/swarm';
import { calculateMetrics } from '@/lib/swarm-engine';
import { cn } from '@/lib/utils';

interface StatusPanelProps {
  swarm: SwarmState;
  masterUptime: number;
  electionCount: number;
}

export function StatusPanel({ swarm, masterUptime, electionCount }: StatusPanelProps) {
  const metrics = calculateMetrics(swarm);
  const master = swarm.drones.find(d => d.id === swarm.masterId);
  const completedTargets = swarm.targets.filter(t => t.status === 'completed').length;

  const formatUptime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="tactical-panel">
      <div className="tactical-panel-header">Swarm Status</div>
      
      <div className="p-4 space-y-4">
        {/* Master Status */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Current Master</span>
            <div className={cn(
              'status-indicator',
              master ? 'master' : 'danger'
            )} />
          </div>
          <div className="font-mono text-xl font-bold text-primary text-glow-primary">
            {swarm.masterId?.replace('drone_', 'D') || 'NO MASTER'}
          </div>
          {master && (
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>Battery: <span className={cn(
                'font-mono',
                master.battery > 50 ? 'text-success' :
                master.battery > 25 ? 'text-warning' : 'text-destructive'
              )}>{master.battery.toFixed(1)}%</span></span>
              <span>Uptime: <span className="font-mono text-foreground">{formatUptime(masterUptime)}</span></span>
            </div>
          )}
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          <MetricBox
            label="Active Agents"
            value={metrics.activeAgents}
            total={metrics.totalAgents}
            color="primary"
          />
          <MetricBox
            label="Avg Battery"
            value={`${metrics.averageBattery.toFixed(0)}%`}
            color={metrics.averageBattery > 50 ? 'success' : metrics.averageBattery > 25 ? 'warning' : 'destructive'}
          />
          <MetricBox
            label="Targets Done"
            value={completedTargets}
            total={swarm.targets.length}
            color="accent"
          />
          <MetricBox
            label="Jammed"
            value={metrics.jammedDrones}
            color={metrics.jammedDrones > 0 ? 'destructive' : 'success'}
          />
        </div>

        {/* Additional Metrics Row */}
        <div className="grid grid-cols-3 gap-2">
          <div className="p-2 bg-secondary/30 rounded border border-border text-center">
            <div className="text-[9px] text-muted-foreground uppercase">Formation</div>
            <div className="font-mono text-sm font-bold text-accent">{swarm.formation.toUpperCase()}</div>
          </div>
          <div className="p-2 bg-secondary/30 rounded border border-border text-center">
            <div className="text-[9px] text-muted-foreground uppercase">Elections</div>
            <div className="font-mono text-sm font-bold text-warning">{electionCount}</div>
          </div>
          <div className="p-2 bg-secondary/30 rounded border border-border text-center">
            <div className="text-[9px] text-muted-foreground uppercase">Jam Zones</div>
            <div className="font-mono text-sm font-bold text-destructive">{swarm.jammingZones.length}</div>
          </div>
        </div>

        {/* Formation Integrity Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Formation Integrity</span>
            <span className="font-mono text-foreground">{metrics.formationIntegrity.toFixed(0)}%</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full transition-all duration-500',
                metrics.formationIntegrity > 75 ? 'bg-success' :
                metrics.formationIntegrity > 50 ? 'bg-warning' : 'bg-destructive'
              )}
              style={{ width: `${metrics.formationIntegrity}%` }}
            />
          </div>
        </div>

        {/* Heartbeat Indicator */}
        <div className="flex items-center gap-2 p-2 bg-secondary/50 rounded border border-border">
          <div className="heartbeat-pulse">
            <svg width="16" height="16" viewBox="0 0 24 24" className="text-primary">
              <path
                fill="currentColor"
                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              />
            </svg>
          </div>
          <div className="text-xs">
            <span className="text-muted-foreground">Mesh: </span>
            <span className="font-mono text-success">P2P Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface MetricBoxProps {
  label: string;
  value: string | number;
  total?: number;
  color: 'primary' | 'success' | 'warning' | 'destructive' | 'accent';
}

function MetricBox({ label, value, total, color }: MetricBoxProps) {
  const colorClasses = {
    primary: 'text-primary',
    success: 'text-success',
    warning: 'text-warning',
    destructive: 'text-destructive',
    accent: 'text-accent',
  };

  return (
    <div className="p-2 bg-secondary/30 rounded border border-border">
      <div className="text-[10px] text-muted-foreground uppercase">{label}</div>
      <div className={cn('font-mono text-lg font-bold', colorClasses[color])}>
        {value}
        {total !== undefined && (
          <span className="text-muted-foreground text-sm">/{total}</span>
        )}
      </div>
    </div>
  );
}
