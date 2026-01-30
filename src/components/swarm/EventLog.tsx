// Event Log Component - Displays election events and swarm decisions

import { ElectionEvent } from '@/types/swarm';
import { cn } from '@/lib/utils';

interface EventLogProps {
  events: ElectionEvent[];
}

export function EventLog({ events }: EventLogProps) {
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getEventIcon = (type: ElectionEvent['type']) => {
    switch (type) {
      case 'master_lost': return '⚠️';
      case 'election_start': return '🗳️';
      case 'vote': return '✋';
      case 'election_complete': return '✅';
      case 'master_announce': return '📢';
      default: return '📝';
    }
  };

  const getEventColor = (type: ElectionEvent['type']) => {
    switch (type) {
      case 'master_lost': return 'text-destructive';
      case 'election_start': return 'text-warning';
      case 'vote': return 'text-accent';
      case 'election_complete': return 'text-success';
      case 'master_announce': return 'text-primary';
      default: return 'text-foreground';
    }
  };

  return (
    <div className="tactical-panel h-full flex flex-col">
      <div className="tactical-panel-header flex items-center justify-between">
        <span>Event Log</span>
        <span className="text-[10px] text-primary font-mono">{events.length} events</span>
      </div>
      
      <div className="flex-1 overflow-auto tactical-scroll p-2 space-y-1">
        {events.length === 0 ? (
          <div className="text-center text-muted-foreground text-xs py-4">
            No events recorded
          </div>
        ) : (
          events.map((event, idx) => (
            <div
              key={`${event.timestamp}-${idx}`}
              className={cn(
                'p-2 rounded bg-secondary/30 border border-border/50',
                'animate-fade-in'
              )}
            >
              <div className="flex items-start gap-2">
                <span className="text-sm">{getEventIcon(event.type)}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      'text-[10px] uppercase font-semibold',
                      getEventColor(event.type)
                    )}>
                      {event.type.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {formatTime(event.timestamp)}
                    </span>
                  </div>
                  <p className="text-xs text-foreground/80 mt-0.5">
                    {event.details}
                  </p>
                  {event.reason && (
                    <p className="text-[10px] text-muted-foreground mt-0.5 italic">
                      Reason: {event.reason}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
