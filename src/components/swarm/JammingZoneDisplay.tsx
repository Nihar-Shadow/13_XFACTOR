// Jamming Zone Component - Displays electronic warfare zones on the tactical map

import { JammingZone } from '@/types/swarm';

interface JammingZoneDisplayProps {
  zone: JammingZone;
}

export function JammingZoneDisplay({ zone }: JammingZoneDisplayProps) {
  const { center, radius, intensity } = zone;

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: center.x - radius,
        top: center.y - radius,
        width: radius * 2,
        height: radius * 2,
      }}
    >
      {/* Outer warning ring */}
      <svg
        width={radius * 2}
        height={radius * 2}
        className="absolute inset-0"
      >
        <defs>
          <radialGradient id={`jamGradient-${zone.id}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="hsl(var(--destructive))" stopOpacity={0.4 * (intensity / 100)} />
            <stop offset="70%" stopColor="hsl(var(--destructive))" stopOpacity={0.2 * (intensity / 100)} />
            <stop offset="100%" stopColor="hsl(var(--destructive))" stopOpacity="0" />
          </radialGradient>
          <filter id={`jamNoise-${zone.id}`}>
            <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" />
          </filter>
        </defs>
        
        {/* Jamming field background */}
        <circle
          cx={radius}
          cy={radius}
          r={radius}
          fill={`url(#jamGradient-${zone.id})`}
          className="animate-pulse"
          style={{ animationDuration: '2s' }}
        />
        
        {/* Warning border */}
        <circle
          cx={radius}
          cy={radius}
          r={radius - 2}
          fill="none"
          stroke="hsl(var(--destructive))"
          strokeWidth="2"
          strokeDasharray="8 4"
          opacity={0.6}
          className="animate-spin"
          style={{ 
            animationDuration: '10s',
            transformOrigin: 'center',
          }}
        />
        
        {/* Inner danger zone */}
        <circle
          cx={radius}
          cy={radius}
          r={radius * 0.6}
          fill="none"
          stroke="hsl(var(--destructive))"
          strokeWidth="1"
          strokeDasharray="4 4"
          opacity={0.4}
        />
      </svg>

      {/* Warning icon in center */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex flex-col items-center gap-1">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            className="text-destructive animate-pulse"
          >
            {/* Radio interference symbol */}
            <path
              d="M12 2 L12 6 M12 18 L12 22 M2 12 L6 12 M18 12 L22 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
            <path
              d="M7 7 L9 9 M15 15 L17 17 M7 17 L9 15 M15 9 L17 7"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <span className="text-[8px] font-mono font-bold text-destructive uppercase tracking-wider">
            JAM
          </span>
        </div>
      </div>

      {/* Intensity indicator */}
      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[8px] font-mono text-destructive">
        {intensity.toFixed(0)}%
      </div>
    </div>
  );
}
