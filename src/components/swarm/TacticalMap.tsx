// Tactical Map Component - Main visualization area for the drone swarm V2

import { DroneState, Target, JammingZone } from '@/types/swarm';
import { DroneMarker } from './DroneMarker';
import { ConnectionLines } from './ConnectionLines';
import { FullMeshLines } from './FullMeshLines';
import { TargetMarker } from './TargetMarker';
import { JammingZoneDisplay } from './JammingZoneDisplay';
import { cn } from '@/lib/utils';

interface MeshVisibility {
  master: boolean;
  slave: boolean;
  phone: boolean;
  jamZone: boolean;
}

interface TacticalMapProps {
  drones: DroneState[];
  masterId: string | null;
  areaSize: { width: number; height: number };
  missionActive: boolean;
  targets: Target[];
  jammingZones: JammingZone[];
  meshVisibility: MeshVisibility;
}

export function TacticalMap({ drones, masterId, areaSize, missionActive, targets, jammingZones, meshVisibility }: TacticalMapProps) {
  const activeDrones = drones.filter(d => d.health !== 'destroyed');
  const jammedCount = activeDrones.filter(d => d.isInJammingZone).length;
  const completedTargets = targets.filter(t => t.status === 'completed').length;

  return (
    <div className="tactical-panel h-full flex flex-col">
      <div className="tactical-panel-header flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn(
            'status-indicator',
            missionActive ? 'active' : 'warning'
          )} />
          <span>Tactical Overview</span>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="text-primary">{activeDrones.length} ACTIVE</span>
          <span className="text-warning">{targets.length - completedTargets} TARGETS</span>
          {jammedCount > 0 && (
            <span className="text-destructive animate-pulse">{jammedCount} JAMMED</span>
          )}
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden">
        {/* Background grid */}
        <div className="absolute inset-0 tactical-grid opacity-50" />

        {/* Radar sweep effect */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
          <div
            className="radar-sweep rounded-full opacity-30"
            style={{
              width: Math.max(areaSize.width, areaSize.height) * 1.5,
              height: Math.max(areaSize.width, areaSize.height) * 1.5,
            }}
          />
        </div>

        {/* Jamming zones (rendered first, behind everything) */}
        <div className="absolute inset-0" style={{ zIndex: 1 }}>
          {jammingZones.map(zone => (
            <JammingZoneDisplay key={zone.id} zone={zone} />
          ))}
        </div>

        {/* Full mesh network visualization - Glowing neon lines between drones */}
        <FullMeshLines drones={drones} masterId={masterId} meshVisibility={meshVisibility} />

        {/* Connection lines showing P2P neighbors with signal quality */}
        <div style={{ zIndex: 2 }}>
          <ConnectionLines drones={drones} masterId={masterId} />
        </div>

        {/* Target markers */}
        <div className="absolute inset-0" style={{ zIndex: 5 }}>
          {targets.map(target => (
            <TargetMarker key={target.id} target={target} />
          ))}
        </div>

        {/* Drone markers */}
        <div className="absolute inset-0" style={{ zIndex: 10 }}>
          {drones.map(drone => (
            <DroneMarker
              key={drone.id}
              drone={drone}
              isMaster={drone.id === masterId}
            />
          ))}
        </div>

        {/* Coordinate overlay */}
        <div className="absolute bottom-2 left-2 text-[10px] font-mono text-muted-foreground">
          GRID: {areaSize.width}x{areaSize.height}m
        </div>

        {/* Compass */}
        <div className="absolute top-4 right-4 w-12 h-12 rounded-full border border-border flex items-center justify-center">
          <div className="text-primary font-mono text-xs font-bold">N</div>
          <div className="absolute bottom-0 text-muted-foreground text-[8px]">S</div>
          <div className="absolute left-0 text-muted-foreground text-[8px]">W</div>
          <div className="absolute right-0 text-muted-foreground text-[8px]">E</div>
        </div>

        {/* Legend */}
        <div className="absolute top-4 left-4 bg-card/80 backdrop-blur-sm rounded p-2 text-[9px] font-mono space-y-1 border border-border">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span>Master</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-accent" />
            <span>Slave</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-warning" />
            <span>Phone</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-destructive" />
            <span>Jam Zone</span>
          </div>
        </div>

        {/* Mission status overlay */}
        {!missionActive && (
          <div className="absolute inset-0 bg-background/60 flex items-center justify-center z-20">
            <div className="text-warning font-mono text-lg animate-pulse">
              ⏸ MISSION STANDBY
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
