// Header Component - Top navigation and branding

import { cn } from '@/lib/utils';

interface HeaderProps {
  missionActive: boolean;
}

export function Header({ missionActive }: HeaderProps) {
  return (
    <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4">
      {/* Logo and Title */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <svg width="36" height="36" viewBox="0 0 36 36" className="text-primary">
            {/* Shield background */}
            <path
              d="M18 2 L32 8 L32 18 C32 26 25 32 18 34 C11 32 4 26 4 18 L4 8 L18 2Z"
              fill="currentColor"
              opacity="0.2"
            />
            {/* Shield border */}
            <path
              d="M18 2 L32 8 L32 18 C32 26 25 32 18 34 C11 32 4 26 4 18 L4 8 L18 2Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            {/* Drone icon inside */}
            <g transform="translate(9, 10)">
              <circle cx="9" cy="8" r="2" fill="currentColor" />
              <circle cx="3" cy="3" r="2" fill="currentColor" opacity="0.7" />
              <circle cx="15" cy="3" r="2" fill="currentColor" opacity="0.7" />
              <circle cx="3" cy="13" r="2" fill="currentColor" opacity="0.7" />
              <circle cx="15" cy="13" r="2" fill="currentColor" opacity="0.7" />
              <line x1="5" y1="5" x2="7" y2="6" stroke="currentColor" strokeWidth="1" />
              <line x1="13" y1="5" x2="11" y2="6" stroke="currentColor" strokeWidth="1" />
              <line x1="5" y1="11" x2="7" y2="10" stroke="currentColor" strokeWidth="1" />
              <line x1="13" y1="11" x2="11" y2="10" stroke="currentColor" strokeWidth="1" />
            </g>
          </svg>
        </div>
        <div>
          <h1 className="text-lg font-bold text-foreground tracking-tight">
            SKY GUARDIAN <span className="text-primary">SWARM</span>
          </h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
            Distributed Autonomous Defense System
          </p>
        </div>
      </div>

      {/* Center Status */}
      <div className="flex items-center gap-6">
        <StatusIndicator
          label="MESH"
          status="active"
        />
        <StatusIndicator
          label="MISSION"
          status={missionActive ? 'active' : 'standby'}
        />
        <StatusIndicator
          label="COMMS"
          status="active"
        />
      </div>

      {/* Right side - Time and Version */}
      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className="font-mono text-sm text-foreground">
            <LiveClock />
          </div>
          <div className="text-[10px] text-muted-foreground">
            UTC LOCAL
          </div>
        </div>
        <div className="h-8 w-px bg-border" />
        <div className="text-right">
          <div className="text-xs text-muted-foreground">VERSION</div>
          <div className="font-mono text-xs text-primary">v2.4.1</div>
        </div>
      </div>
    </header>
  );
}

interface StatusIndicatorProps {
  label: string;
  status: 'active' | 'standby' | 'error';
}

function StatusIndicator({ label, status }: StatusIndicatorProps) {
  return (
    <div className="flex items-center gap-2">
      <div className={cn(
        'w-2 h-2 rounded-full',
        status === 'active' && 'bg-success animate-pulse',
        status === 'standby' && 'bg-warning',
        status === 'error' && 'bg-destructive animate-pulse'
      )} />
      <span className="text-xs text-muted-foreground uppercase">{label}</span>
    </div>
  );
}

function LiveClock() {
  // Using a simple display - in production would use useEffect for updates
  const now = new Date();
  const time = now.toLocaleTimeString('en-US', { 
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  
  return <span>{time}</span>;
}
