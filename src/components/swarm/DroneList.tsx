// Drone List Component - Detailed list of all drones in the swarm

import { DroneState } from '@/types/swarm';
import { cn } from '@/lib/utils';

interface DroneListProps {
  drones: DroneState[];
  masterId: string | null;
}

export function DroneList({ drones, masterId }: DroneListProps) {
  const sortedDrones = [...drones].sort((a, b) => {
    // Master first, then by ID
    if (a.id === masterId) return -1;
    if (b.id === masterId) return 1;
    return a.id.localeCompare(b.id);
  });

  return (
    <div className="tactical-panel h-full flex flex-col">
      <div className="tactical-panel-header">Agent Roster</div>
      
      <div className="flex-1 overflow-auto tactical-scroll">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-card">
            <tr className="text-left text-muted-foreground border-b border-border">
              <th className="px-3 py-2 font-medium">ID</th>
              <th className="px-3 py-2 font-medium">Role</th>
              <th className="px-3 py-2 font-medium">Task</th>
              <th className="px-3 py-2 font-medium">Battery</th>
              <th className="px-3 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {sortedDrones.map(drone => (
              <DroneRow key={drone.id} drone={drone} isMaster={drone.id === masterId} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface DroneRowProps {
  drone: DroneState;
  isMaster: boolean;
}

function DroneRow({ drone, isMaster }: DroneRowProps) {
  const getRoleColor = () => {
    if (drone.health === 'destroyed') return 'text-muted-foreground';
    if (isMaster) return 'text-primary';
    if (drone.isPhoneAgent) return 'text-warning';
    return 'text-accent';
  };

  const getTaskColor = () => {
    switch (drone.task) {
      case 'scout': return 'bg-accent/20 text-accent';
      case 'observer': return 'bg-primary/20 text-primary';
      case 'relay': return 'bg-warning/20 text-warning';
      default: return 'bg-secondary text-muted-foreground';
    }
  };

  const getHealthColor = () => {
    switch (drone.health) {
      case 'healthy': return 'text-success';
      case 'warning': return 'text-warning';
      case 'critical': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getBatteryColor = () => {
    if (drone.battery > 50) return 'bg-success';
    if (drone.battery > 25) return 'bg-warning';
    return 'bg-destructive';
  };

  return (
    <tr className={cn(
      'border-b border-border/50 transition-colors',
      isMaster && 'bg-primary/5',
      drone.health === 'destroyed' && 'opacity-50'
    )}>
      <td className="px-3 py-2">
        <div className="flex items-center gap-2">
          {isMaster && (
            <span className="text-primary text-[10px]">★</span>
          )}
          {drone.isPhoneAgent && (
            <span className="text-warning text-[10px]">📱</span>
          )}
          <span className={cn('font-mono font-medium', getRoleColor())}>
            {drone.id}
          </span>
        </div>
      </td>
      <td className="px-3 py-2">
        <span className={cn('uppercase text-[10px] font-medium', getRoleColor())}>
          {isMaster ? 'MASTER' : drone.isPhoneAgent ? 'VIRTUAL' : 'SLAVE'}
        </span>
      </td>
      <td className="px-3 py-2">
        <span className={cn(
          'px-1.5 py-0.5 rounded text-[10px] uppercase font-medium',
          getTaskColor()
        )}>
          {drone.task}
        </span>
      </td>
      <td className="px-3 py-2">
        <div className="flex items-center gap-2">
          <div className="w-12 h-1.5 bg-secondary rounded-full overflow-hidden">
            <div
              className={cn('h-full transition-all', getBatteryColor())}
              style={{ width: `${drone.battery}%` }}
            />
          </div>
          <span className="font-mono text-[10px] w-8">
            {drone.battery.toFixed(0)}%
          </span>
        </div>
      </td>
      <td className="px-3 py-2">
        <div className="flex items-center gap-1.5">
          <div className={cn(
            'w-1.5 h-1.5 rounded-full',
            drone.health === 'healthy' && 'bg-success',
            drone.health === 'warning' && 'bg-warning',
            drone.health === 'critical' && 'bg-destructive animate-pulse',
            drone.health === 'destroyed' && 'bg-muted-foreground'
          )} />
          <span className={cn('uppercase text-[10px]', getHealthColor())}>
            {drone.health}
          </span>
        </div>
      </td>
    </tr>
  );
}
