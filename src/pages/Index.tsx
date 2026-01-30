// Sky Guardian Swarm - Main Dashboard
// Tactical command center for drone swarm management V2

import { useSwarmSimulation } from '@/hooks/useSwarmSimulation';
import { Header } from '@/components/swarm/Header';
import { TacticalMap } from '@/components/swarm/TacticalMap';
import { StatusPanel } from '@/components/swarm/StatusPanel';
import { ControlPanel } from '@/components/swarm/ControlPanel';
import { DroneList } from '@/components/swarm/DroneList';
import { EventLog } from '@/components/swarm/EventLog';
import { PhoneSensorPanel } from '@/components/swarm/PhoneSensorPanel';
import { NetworkPanel } from '@/components/swarm/NetworkPanel';

const Index = () => {
  const {
    swarm,
    events,
    isPaused,
    phoneConnected,
    meshVisibility,
    masterUptime,
    electionCount,
    areaSize,
    actions,
  } = useSwarmSimulation(10);

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <Header missionActive={swarm.missionActive} />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Status & Controls */}
        <aside className="w-72 border-r border-border flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto tactical-scroll p-3 space-y-3">
            <StatusPanel
              swarm={swarm}
              masterUptime={masterUptime}
              electionCount={electionCount}
            />
            <ControlPanel
              missionActive={swarm.missionActive}
              isPaused={isPaused}
              currentFormation={swarm.formation}
              phoneConnected={phoneConnected}
              meshVisibility={meshVisibility}
              onKillMaster={actions.killMaster}
              onChangeFormation={actions.changeFormation}
              onToggleMission={actions.toggleMission}
              onTogglePause={actions.togglePause}
              onConnectPhone={actions.connectPhone}
              onDisconnectPhone={actions.disconnectPhone}
              onToggleMeshVisibility={actions.toggleMeshVisibility}
            />
            <PhoneSensorPanel
              isConnected={phoneConnected}
              onMotionUpdate={actions.updatePhoneMotion}
            />
            <NetworkPanel drones={swarm.drones} masterId={swarm.masterId} />
          </div>
        </aside>

        {/* Center - Tactical Map */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 p-3">
            <TacticalMap
              drones={swarm.drones}
              masterId={swarm.masterId}
              areaSize={areaSize}
              missionActive={swarm.missionActive}
              targets={swarm.targets}
              jammingZones={swarm.jammingZones}
              meshVisibility={meshVisibility}
            />
          </div>
        </main>

        {/* Right Sidebar - Drone List & Events */}
        <aside className="w-80 border-l border-border flex flex-col overflow-hidden">
          <div className="h-1/2 p-3 pb-1.5">
            <DroneList drones={swarm.drones} masterId={swarm.masterId} />
          </div>
          <div className="h-1/2 p-3 pt-1.5">
            <EventLog events={events} />
          </div>
        </aside>
      </div>

      {/* Footer Status Bar */}
      <footer className="h-8 border-t border-border bg-card flex items-center justify-between px-4 text-xs">
        <div className="flex items-center gap-4 text-muted-foreground">
          <span>Heartbeat: <span className="text-success font-mono">1000ms</span></span>
          <span>Timeout: <span className="text-warning font-mono">3000ms</span></span>
          <span>Tick Rate: <span className="text-primary font-mono">20 FPS</span></span>
        </div>
        <div className="flex items-center gap-4 text-muted-foreground">
          <span>Targets: <span className="text-accent font-mono">{swarm.targets.length}</span></span>
          <span>Jam Zones: <span className="text-destructive font-mono">{swarm.jammingZones.length}</span></span>
          <span>Protocol: <span className="text-foreground">MAVLink v2.0</span></span>
          <span>Mesh: <span className="text-success">P2P ACTIVE</span></span>
          <span className="font-mono text-primary">SKY GUARDIAN SWARM v2</span>
        </div>
      </footer>
    </div>
  );
};

export default Index;
