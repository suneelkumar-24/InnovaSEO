'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { SavedNicheItem, LivePulseStatus } from '@/lib/providers/types';

interface LivePulseContextType {
  savedNiches: SavedNicheItem[];
  isRecalculating: boolean;
  autoSyncEnabled: boolean;
  intervalSeconds: number;
  pulseCountdown: number;
  lastPulseTime: Date | null;
  status: LivePulseStatus | null;
  toggleAutoSync: (enabled?: boolean) => void;
  setIntervalSeconds: (sec: number) => void;
  triggerRecalculateNow: (targetId?: string) => Promise<any>;
  refreshSaved: () => Promise<void>;
  flashNicheIds: string[];
}

const LivePulseContext = createContext<LivePulseContextType | undefined>(undefined);

export function LivePulseProvider({ children }: { children: React.ReactNode }) {
  const [savedNiches, setSavedNiches] = useState<SavedNicheItem[]>([]);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(false);
  const [intervalSeconds, setIntervalSecondsState] = useState(60);
  const [pulseCountdown, setPulseCountdown] = useState(60);
  const [lastPulseTime, setLastPulseTime] = useState<Date | null>(null);
  const [status, setStatus] = useState<LivePulseStatus | null>(null);
  const [flashNicheIds, setFlashNicheIds] = useState<string[]>([]);

  const isRecalculatingRef = useRef(false);
  const countdownRef = useRef(60);

  // Initial fetch on mount
  const refreshSaved = async () => {
    try {
      const res = await fetch('/api/engine/live-pulse').catch(() => null);
      if (!res || !res.ok) {
        return;
      }
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) return;
      const data = await res.json();
      if (data.success) {
        if (data.saved) setSavedNiches(data.saved);
        if (data.status) setStatus(data.status);
        setLastPulseTime(new Date());
      }
    } catch {
      // Gracefully handle network transitions
    }
  };

  useEffect(() => {
    refreshSaved();
  }, []);

  // Trigger background recalculation
  const triggerRecalculateNow = async (targetId?: string) => {
    if (isRecalculatingRef.current) return;
    isRecalculatingRef.current = true;
    setIsRecalculating(true);

    try {
      const res = await fetch('/api/engine/live-pulse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(targetId ? { targetId } : {}),
      }).catch(() => null);
      if (!res || !res.ok) {
        return;
      }
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) return;
      const data = await res.json();
      if (data.success) {
        if (data.saved) {
          setSavedNiches(data.saved);
        }
        if (data.status) {
          setStatus(data.status);
        }
        setLastPulseTime(new Date());
        countdownRef.current = intervalSeconds;
        setPulseCountdown(intervalSeconds);

        // Flash IDs that shifted
        if (data.results) {
          const shifted = data.results
            .filter((r: any) => r.delta !== 0)
            .map((r: any) => r.nicheId);
          setFlashNicheIds(shifted);
          setTimeout(() => setFlashNicheIds([]), 3500);
        }
      }
    } catch {
      // Gracefully handle network transitions
    } finally {
      isRecalculatingRef.current = false;
      setIsRecalculating(false);
    }
  };

  // Background ticker and countdown timer
  useEffect(() => {
    if (!autoSyncEnabled) return;

    countdownRef.current = intervalSeconds;
    setPulseCountdown(intervalSeconds);

    const timer = setInterval(() => {
      // Only tick if document is visible
      if (typeof document !== 'undefined' && document.hidden) return;

      countdownRef.current -= 1;
      if (countdownRef.current <= 0) {
        countdownRef.current = intervalSeconds;
        setPulseCountdown(intervalSeconds);
        triggerRecalculateNow();
      } else {
        setPulseCountdown(countdownRef.current);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [autoSyncEnabled, intervalSeconds]);

  const toggleAutoSync = (enabled?: boolean) => {
    setAutoSyncEnabled((prev) => (enabled !== undefined ? enabled : !prev));
  };

  const setIntervalSeconds = (sec: number) => {
    setIntervalSecondsState(sec);
    countdownRef.current = sec;
    setPulseCountdown(sec);
  };

  return (
    <LivePulseContext.Provider
      value={{
        savedNiches,
        isRecalculating,
        autoSyncEnabled,
        intervalSeconds,
        pulseCountdown,
        lastPulseTime,
        status,
        toggleAutoSync,
        setIntervalSeconds,
        triggerRecalculateNow,
        refreshSaved,
        flashNicheIds,
      }}
    >
      {children}
    </LivePulseContext.Provider>
  );
}

export function useLivePulse() {
  const context = useContext(LivePulseContext);
  if (!context) {
    throw new Error('useLivePulse must be used within a LivePulseProvider');
  }
  return context;
}
