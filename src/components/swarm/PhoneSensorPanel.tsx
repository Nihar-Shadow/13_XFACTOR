// Phone Sensor Panel - Simplified accelerometer-only control for phone drone

import { useState, useEffect, useCallback } from 'react';
import { PhoneMotion } from '@/types/swarm';
import { cn } from '@/lib/utils';

interface PhoneSensorPanelProps {
  isConnected: boolean;
  onMotionUpdate: (motion: PhoneMotion) => void;
}

export function PhoneSensorPanel({ isConnected, onMotionUpdate }: PhoneSensorPanelProps) {
  const [motion, setMotion] = useState({ x: 0, y: 0, yaw: 0 });
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleMotion = useCallback((event: DeviceMotionEvent) => {
    const acc = event.accelerationIncludingGravity;
    if (!acc) return;

    // Normalize accelerometer values to -1 to 1 range
    const x = Math.max(-1, Math.min(1, (acc.x || 0) / 10)); // Forward/back tilt
    const y = Math.max(-1, Math.min(1, (acc.y || 0) / 10)); // Left/right tilt
    
    // Calculate yaw from rotation rate if available
    const rotationRate = event.rotationRate;
    const yaw = rotationRate ? Math.max(-1, Math.min(1, (rotationRate.alpha || 0) / 100)) : 0;

    const newMotion = { x, y, yaw };
    setMotion(newMotion);
    
    onMotionUpdate({
      type: 'motion',
      x,
      y,
      yaw,
      timestamp: Date.now(),
    });
  }, [onMotionUpdate]);

  useEffect(() => {
    if (!isConnected) return;

    // Request motion permission (iOS 13+)
    const requestPermission = async () => {
      if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
        try {
          const permission = await (DeviceMotionEvent as any).requestPermission();
          if (permission === 'granted') {
            setHasPermission(true);
            window.addEventListener('devicemotion', handleMotion);
          } else {
            setHasPermission(false);
            setError('Motion permission denied');
          }
        } catch (err) {
          setError('Failed to request motion permission');
          setHasPermission(false);
        }
      } else {
        // No permission needed (Android or older iOS)
        setHasPermission(true);
        window.addEventListener('devicemotion', handleMotion);
      }
    };

    requestPermission();

    return () => {
      window.removeEventListener('devicemotion', handleMotion);
    };
  }, [isConnected, handleMotion]);

  if (!isConnected) {
    return null;
  }

  return (
    <div className="tactical-panel">
      <div className="tactical-panel-header flex items-center justify-between">
        <span>📱 Motion Control</span>
        <div className={cn(
          'status-indicator',
          hasPermission ? 'active' : hasPermission === false ? 'danger' : 'warning'
        )} />
      </div>

      <div className="p-4 space-y-3">
        {error && (
          <div className="p-2 bg-destructive/20 border border-destructive/50 rounded text-xs text-destructive">
            {error}
          </div>
        )}

        {hasPermission === null && !error && (
          <div className="p-2 bg-warning/20 border border-warning/50 rounded text-xs text-warning">
            Tilt device to control drone
          </div>
        )}

        {/* Motion visualization */}
        <div className="flex justify-center">
          <div className="relative w-24 h-24 bg-secondary/30 rounded-lg border border-border">
            {/* Center crosshair */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full h-px bg-muted-foreground/30" />
              <div className="absolute h-full w-px bg-muted-foreground/30" />
            </div>
            
            {/* Motion indicator */}
            <div
              className="absolute w-4 h-4 rounded-full bg-primary transition-all duration-75"
              style={{
                left: `${50 + motion.y * 40}%`,
                top: `${50 + motion.x * 40}%`,
                transform: 'translate(-50%, -50%)',
              }}
            />
          </div>
        </div>

        {/* Motion values */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 bg-secondary/30 rounded">
            <div className="text-[10px] text-muted-foreground">FWD/BACK</div>
            <div className="font-mono text-sm">{motion.x.toFixed(2)}</div>
          </div>
          <div className="p-2 bg-secondary/30 rounded">
            <div className="text-[10px] text-muted-foreground">LEFT/RIGHT</div>
            <div className="font-mono text-sm">{motion.y.toFixed(2)}</div>
          </div>
          <div className="p-2 bg-secondary/30 rounded">
            <div className="text-[10px] text-muted-foreground">YAW</div>
            <div className="font-mono text-sm">{motion.yaw.toFixed(2)}</div>
          </div>
        </div>

        <div className="text-[10px] text-muted-foreground text-center">
          Tilt phone to move drone • Rotate to yaw
        </div>
      </div>
    </div>
  );
}
