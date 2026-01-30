// Full Mesh Network Visualization - Glowing Neon Lines
// Bright neon green connections with glow effects

import { DroneState } from '@/types/swarm';
import { useMemo } from 'react';

interface MeshVisibility {
  master: boolean;
  slave: boolean;
  phone: boolean;
  jamZone: boolean;
}

interface FullMeshLinesProps {
  drones: DroneState[];
  masterId: string | null;
  meshVisibility: MeshVisibility;
}

interface MeshLink {
  from: DroneState;
  to: DroneState;
  linkId: string;
  distance: number;
  linkType: 'master' | 'slave' | 'phone' | 'jamZone';
}

// Determine link type based on drone properties
function getLinkType(from: DroneState, to: DroneState, masterId: string | null): 'master' | 'slave' | 'phone' | 'jamZone' {
  // Check if either drone is in jamming zone
  if (from.isInJammingZone || to.isInJammingZone) {
    return 'jamZone';
  }
  // Check if either drone is phone agent
  if (from.isPhoneAgent || to.isPhoneAgent) {
    return 'phone';
  }
  // Check if either drone is master
  if (from.id === masterId || to.id === masterId) {
    return 'master';
  }
  // Default to slave-to-slave connection
  return 'slave';
}

// Generate full mesh links between all active drones
function generateFullMeshLinks(drones: DroneState[], masterId: string | null): MeshLink[] {
  const activeDrones = drones.filter(d => d.health !== 'destroyed');
  const links: MeshLink[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < activeDrones.length; i++) {
    for (let j = i + 1; j < activeDrones.length; j++) {
      const from = activeDrones[i];
      const to = activeDrones[j];
      const linkId = [from.id, to.id].sort().join('-');

      if (!seen.has(linkId)) {
        seen.add(linkId);
        const dx = to.position.x - from.position.x;
        const dy = to.position.y - from.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const linkType = getLinkType(from, to, masterId);
        links.push({ from, to, linkId, distance, linkType });
      }
    }
  }

  return links;
}

// Color configuration for each link type
const linkColors = {
  master: {
    glow: 'hsl(185, 80%, 50%)',
    core: 'hsl(185, 100%, 70%)',
    glowWidth: 2,
    coreWidth: 1.5,
    filter: 'url(#masterGlow)',
  },
  slave: {
    glow: 'hsl(145, 70%, 45%)',
    core: 'hsl(145, 80%, 60%)',
    glowWidth: 1,
    coreWidth: 0.8,
    filter: 'url(#neonGlow)',
  },
  phone: {
    glow: 'hsl(45, 90%, 50%)',
    core: 'hsl(45, 100%, 65%)',
    glowWidth: 1.5,
    coreWidth: 1,
    filter: 'url(#phoneGlow)',
  },
  jamZone: {
    glow: 'hsl(0, 80%, 50%)',
    core: 'hsl(0, 100%, 65%)',
    glowWidth: 1.5,
    coreWidth: 1,
    filter: 'url(#jamGlow)',
  },
};

export function FullMeshLines({ drones, masterId, meshVisibility }: FullMeshLinesProps) {
  const meshLinks = useMemo(
    () => generateFullMeshLinks(drones, masterId),
    [drones, masterId]
  );

  // Filter links based on visibility settings
  const visibleLinks = meshLinks.filter(link => meshVisibility[link.linkType]);

  return (
    <svg 
      className="absolute inset-0 pointer-events-none" 
      style={{ zIndex: 1, width: '100%', height: '100%', overflow: 'visible' }}
    >
      <defs>
        {/* Neon glow filter for slave links */}
        <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="blur1" />
          <feGaussianBlur stdDeviation="4" result="blur2" />
          <feMerge>
            <feMergeNode in="blur2" />
            <feMergeNode in="blur1" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Stronger glow for master links */}
        <filter id="masterGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur1" />
          <feGaussianBlur stdDeviation="6" result="blur2" />
          <feGaussianBlur stdDeviation="10" result="blur3" />
          <feMerge>
            <feMergeNode in="blur3" />
            <feMergeNode in="blur2" />
            <feMergeNode in="blur1" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Phone glow filter */}
        <filter id="phoneGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.5" result="blur1" />
          <feGaussianBlur stdDeviation="5" result="blur2" />
          <feMerge>
            <feMergeNode in="blur2" />
            <feMergeNode in="blur1" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Jam zone glow filter */}
        <filter id="jamGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.5" result="blur1" />
          <feGaussianBlur stdDeviation="5" result="blur2" />
          <feMerge>
            <feMergeNode in="blur2" />
            <feMergeNode in="blur1" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Render mesh links as glowing neon lines */}
      {visibleLinks.map(({ from, to, linkId, distance, linkType }) => {
        const colors = linkColors[linkType];
        // Opacity based on distance - closer = brighter
        const maxDist = 400;
        const opacity = Math.max(0.15, Math.min(0.6, 1 - distance / maxDist));
        
        return (
          <g key={linkId}>
            {/* Base glow layer */}
            <line
              x1={from.position.x}
              y1={from.position.y}
              x2={to.position.x}
              y2={to.position.y}
              stroke={colors.glow}
              strokeWidth={colors.glowWidth}
              opacity={opacity * 0.8}
              filter={colors.filter}
            />
            {/* Bright core line */}
            <line
              x1={from.position.x}
              y1={from.position.y}
              x2={to.position.x}
              y2={to.position.y}
              stroke={colors.core}
              strokeWidth={colors.coreWidth}
              opacity={opacity}
              strokeLinecap="round"
            />
          </g>
        );
      })}
    </svg>
  );
}

// Export utility for network stats
export function calculateMeshStats(drones: DroneState[], masterId: string | null) {
  const activeDrones = drones.filter(d => d.health !== 'destroyed');
  const totalAgents = activeDrones.length;
  // Full mesh: n(n-1)/2 links
  const totalLinks = (totalAgents * (totalAgents - 1)) / 2;
  
  // Calculate average link quality
  let totalQuality = 0;
  let linkCount = 0;
  
  for (let i = 0; i < activeDrones.length; i++) {
    for (let j = i + 1; j < activeDrones.length; j++) {
      const dx = activeDrones[j].position.x - activeDrones[i].position.x;
      const dy = activeDrones[j].position.y - activeDrones[i].position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const quality = Math.max(0, Math.min(100, 100 - (distance / 500) * 50));
      totalQuality += quality;
      linkCount++;
    }
  }
  
  const networkHealth = linkCount > 0 ? totalQuality / linkCount : 0;
  
  return {
    totalAgents,
    totalLinks,
    networkHealth,
    masterId,
  };
}
