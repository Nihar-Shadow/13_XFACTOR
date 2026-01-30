// Control Panel Component - Mission controls and actions..

import { FormationType } from '@/types/swarm';
import { cn } from '@/lib/utils';

interface MeshVisibility {
  master: boolean;
  slave: boolean;
  phone: boolean;
  jamZone: boolean;
}

interface ControlPanelProps {
  missionActive: boolean;
  isPaused: boolean;
  currentFormation: FormationType;
  phoneConnected: boolean;
  meshVisibility: MeshVisibility;
  onKillMaster: () => void;
  onChangeFormation: (formation: FormationType) => void;
  onToggleMission: () => void;
  onTogglePause: () => void;
  onConnectPhone: () => void;
  onDisconnectPhone: () => void;
  onToggleMeshVisibility: (key: 'master' | 'slave' | 'phone' | 'jamZone') => void;
}

export function ControlPanel({
  missionActive,
  isPaused,
  currentFormation,
  phoneConnected,
  meshVisibility,
  onKillMaster,
  onChangeFormation,
  onToggleMission,
  onTogglePause,
  onConnectPhone,
  onDisconnectPhone,
  onToggleMeshVisibility,
}: ControlPanelProps) {
  const formations: FormationType[] = ['line', 'grid', 'circle'];

  return (
    <div className="tactical-panel">
      <div className="tactical-panel-header">Mission Control</div>
      
      <div className="p-4 space-y-4">
        {/* Mission Controls */}
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground uppercase">Mission</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onToggleMission}
              className={cn(
                'btn-tactical',
                missionActive && 'bg-success/20 border-success text-success hover:bg-success/30'
              )}
            >
              {missionActive ? '⏹ STOP' : '▶ START'}
            </button>
            <button
              onClick={onTogglePause}
              className={cn(
                'btn-tactical',
                isPaused && 'bg-warning/20 border-warning text-warning hover:bg-warning/30'
              )}
            >
              {isPaused ? '▶ RESUME' : '⏸ PAUSE'}
            </button>
          </div>
        </div>

        {/* Formation Selection */}
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground uppercase">Formation</label>
          <div className="grid grid-cols-3 gap-2">
            {formations.map(formation => (
              <button
                key={formation}
                onClick={() => onChangeFormation(formation)}
                className={cn(
                  'btn-tactical text-center',
                  currentFormation === formation && 'primary'
                )}
              >
                <FormationIcon formation={formation} />
                <span className="block text-[10px] mt-1 uppercase">{formation}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Mesh Visibility Toggles */}
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground uppercase">Network Mesh</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onToggleMeshVisibility('master')}
              className={cn(
                'btn-tactical text-xs py-1.5',
                meshVisibility.master && 'bg-primary/20 border-primary text-primary hover:bg-primary/30'
              )}
            >
              👑 Master
            </button>
            <button
              onClick={() => onToggleMeshVisibility('slave')}
              className={cn(
                'btn-tactical text-xs py-1.5',
                meshVisibility.slave && 'bg-accent/20 border-accent text-accent hover:bg-accent/30'
              )}
            >
              🤖 Slave
            </button>
            <button
              onClick={() => onToggleMeshVisibility('phone')}
              className={cn(
                'btn-tactical text-xs py-1.5',
                meshVisibility.phone && 'bg-warning/20 border-warning text-warning hover:bg-warning/30'
              )}
            >
              📱 Phone
            </button>
            <button
              onClick={() => onToggleMeshVisibility('jamZone')}
              className={cn(
                'btn-tactical text-xs py-1.5',
                meshVisibility.jamZone && 'bg-destructive/20 border-destructive text-destructive hover:bg-destructive/30'
              )}
            >
              ⚠️ Jam Zone
            </button>
          </div>
          <p className="text-[10px] text-muted-foreground">
            Toggle mesh visualization for each agent type.
          </p>
        </div>

        {/* Danger Zone */}
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground uppercase">Danger Zone</label>
          <button
            onClick={onKillMaster}
            className="btn-tactical danger w-full"
          >
            💥 KILL MASTER
          </button>
          <p className="text-[10px] text-muted-foreground">
            Simulates master drone destruction to trigger automatic leader election.
          </p>
        </div>

        {/* Phone Integration */}
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground uppercase">Phone Agent</label>
          {phoneConnected ? (
            <button
              onClick={onDisconnectPhone}
              className="btn-tactical w-full bg-warning/20 border-warning text-warning hover:bg-warning/30"
            >
              📱 DISCONNECT PHONE
            </button>
          ) : (
            <button
              onClick={onConnectPhone}
              className="btn-tactical primary w-full"
            >
              📱 CONNECT AS DRONE
            </button>
          )}
          <p className="text-[10px] text-muted-foreground">
            {phoneConnected 
              ? 'Phone is connected as virtual drone agent in the swarm.'
              : 'Join swarm as a virtual drone using phone sensors.'}
          </p>
        </div>
      </div>
    </div>
  );
}

function FormationIcon({ formation }: { formation: FormationType }) {
  const iconSize = 24;
  
  switch (formation) {
    case 'line':
      return (
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" className="mx-auto text-current">
          <circle cx="4" cy="12" r="2" fill="currentColor" />
          <circle cx="12" cy="12" r="2" fill="currentColor" />
          <circle cx="20" cy="12" r="2" fill="currentColor" />
          <line x1="6" y1="12" x2="10" y2="12" stroke="currentColor" strokeDasharray="2 1" />
          <line x1="14" y1="12" x2="18" y2="12" stroke="currentColor" strokeDasharray="2 1" />
        </svg>
      );
    case 'grid':
      return (
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" className="mx-auto text-current">
          <circle cx="6" cy="6" r="2" fill="currentColor" />
          <circle cx="18" cy="6" r="2" fill="currentColor" />
          <circle cx="6" cy="18" r="2" fill="currentColor" />
          <circle cx="18" cy="18" r="2" fill="currentColor" />
          <circle cx="12" cy="12" r="2" fill="currentColor" opacity="0.5" />
        </svg>
      );
    case 'circle':
      return (
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" className="mx-auto text-current">
          <circle cx="12" cy="4" r="2" fill="currentColor" />
          <circle cx="19" cy="9" r="2" fill="currentColor" />
          <circle cx="19" cy="15" r="2" fill="currentColor" />
          <circle cx="12" cy="20" r="2" fill="currentColor" />
          <circle cx="5" cy="15" r="2" fill="currentColor" />
          <circle cx="5" cy="9" r="2" fill="currentColor" />
          <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeDasharray="3 2" opacity="0.3" />
        </svg>
      );
  }
}
