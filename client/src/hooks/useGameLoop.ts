import { useEffect, useRef } from 'react';
import { useGameStore } from '../stores/game.store';
import { ApiService } from '../services/api.service';

const SYNC_INTERVAL_MS = 5000;

export function useGameLoop() {
  const { tick, eventQueue, clearQueue, init, setSyncStatus, isSyncing } = useGameStore();
  const lastFrameTime = useRef<number>(Date.now());
  const lastSyncTime = useRef<number>(Date.now());
  const requestId = useRef<number>();

  const loop = () => {
    const now = Date.now();
    const delta = Math.min(now - lastFrameTime.current, 1000); 

    if (delta > 0) {
      tick(delta);
      lastFrameTime.current = now;
    }

    if (now - lastSyncTime.current > SYNC_INTERVAL_MS && !isSyncing) {
      triggerSync();
    }
    requestId.current = requestAnimationFrame(loop);
  };

  const triggerSync = async () => {
    const eventsToSend = [...eventQueue];
    setSyncStatus(true);
    lastSyncTime.current = Date.now();
    try {
      const response = await ApiService.sync(eventsToSend);
      if (eventsToSend.length > 0) clearQueue();
      init(response.state);
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setSyncStatus(false);
    }
  };

  useEffect(() => {
    lastFrameTime.current = Date.now();
    requestId.current = requestAnimationFrame(loop);
    return () => { if (requestId.current) cancelAnimationFrame(requestId.current); };
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (requestId.current) cancelAnimationFrame(requestId.current);
      } else {
        lastFrameTime.current = Date.now();
        requestId.current = requestAnimationFrame(loop);
        triggerSync(); 
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [eventQueue]);
}
