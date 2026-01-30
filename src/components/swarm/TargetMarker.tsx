// Target Marker Component - Displays mission targets on the tactical map

import { Target } from '@/types/swarm';
import { cn } from '@/lib/utils';

interface TargetMarkerProps {
  target: Target;
}

export function TargetMarker({ target }: TargetMarkerProps) {
  const { position, priority, type, status } = target;

  const getTypeColor = () => {
    switch (type) {
      case 'attack': return 'text-destructive';
      case 'observe': return 'text-primary';
      case 'relay': return 'text-accent';
      default: return 'text-warning';
    }
  };

  const getStatusOpacity = () => {
    switch (status) {
      case 'completed': return 'opacity-30';
      case 'assigned': return 'opacity-100';
      default: return 'opacity-70';
    }
  };

  return (
    <div
      className={cn('absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none', getStatusOpacity())}
      style={{ left: position.x, top: position.y }}
    >
      {/* Target crosshair */}
      <div className="relative">
        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          className={cn('transition-colors', getTypeColor())}
        >
          {/* Outer ring */}
          <circle
            cx="16"
            cy="16"
            r="14"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="4 2"
            className={status === 'assigned' ? 'animate-spin' : ''}
            style={{ animationDuration: '8s' }}
          />
          {/* Inner ring */}
          <circle
            cx="16"
            cy="16"
            r="8"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          {/* Crosshairs */}
          <line x1="16" y1="0" x2="16" y2="6" stroke="currentColor" strokeWidth="2" />
          <line x1="16" y1="26" x2="16" y2="32" stroke="currentColor" strokeWidth="2" />
          <line x1="0" y1="16" x2="6" y2="16" stroke="currentColor" strokeWidth="2" />
          <line x1="26" y1="16" x2="32" y2="16" stroke="currentColor" strokeWidth="2" />
          {/* Center dot */}
          <circle cx="16" cy="16" r="2" fill="currentColor" />
        </svg>

        {/* Priority badge */}
        <div className={cn(
          'absolute -top-2 -right-2 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold',
          'bg-warning text-warning-foreground'
        )}>
          {priority}
        </div>

        {/* Type label */}
        <div className={cn(
          'absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] font-mono uppercase whitespace-nowrap',
          getTypeColor()
        )}>
          {type}
        </div>

        {/* Status indicator */}
        {status === 'completed' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 20 20" className="text-success">
              <path
                d="M4 10 L8 14 L16 6"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
