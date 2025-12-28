import React, { useEffect, useState } from 'react';
import { useGameStore } from './stores/game.store';
import { useGameLoop } from './hooks/useGameLoop';
import { ApiService } from './services/api.service';
import { Dashboard } from './features/dashboard/Dashboard';
import { LabView } from './features/lab/LabView';

const styles = {
  container: {
    display: 'flex', flexDirection: 'column' as const, height: '100vh',
    backgroundColor: '#0a0a0a', color: '#e0e0e0', fontFamily: 'Inter, sans-serif', overflow: 'hidden',
  },
  loading: {
    display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '1.2rem', color: '#00ffcc',
  },
  header: {
    padding: '16px', borderBottom: '1px solid #333', background: '#111',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10,
  },
  resourceBox: { display: 'flex', flexDirection: 'column' as const },
  main: { flex: 1, overflowY: 'auto' as const, position: 'relative' as const },
  nav: { display: 'flex', borderTop: '1px solid #333', background: '#111' },
  navItem: { flex: 1, padding: '16px', textAlign: 'center' as const, cursor: 'pointer', color: '#666' },
  navItemActive: { color: '#00ffcc', fontWeight: 'bold' }
};

export default function App() {
  useGameLoop();
  const { init, gameState, isLoading } = useGameStore();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'lab'>('dashboard');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const boot = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const referrerId = params.get('startapp') || undefined;
        await ApiService.login(referrerId);
        const response = await ApiService.sync([]);
        init(response.state);
      } catch (err: any) {
        console.error('Boot failed:', err);
        setError(err.message || 'Failed to connect to protocol.');
      }
    };
    boot();
  }, []);

  if (error) return <div style={styles.loading}><p>⚠️ Protocol Error: {error}</p></div>;
  if (isLoading || !gameState) return <div style={styles.loading}><div className="spinner">🔄 Initializing Uplink...</div></div>;

  const npFormatted = Math.floor(Number(gameState.resources.NP) / 10000).toLocaleString();
  const psiFormatted = Math.floor(Number(gameState.resources.PSI) / 10000).toLocaleString();

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.resourceBox}>
          <span style={{ fontSize: '0.8rem', color: '#888' }}>NORA POINTS</span>
          <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#fff' }}>{npFormatted}</span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '0.8rem', color: '#888' }}>POTENTIAL (ψ)</span>
          <div style={{ color: '#a0a', fontWeight: 'bold' }}>{psiFormatted}</div>
        </div>
      </header>

      <main style={styles.main}>
        {activeTab === 'dashboard' ? <Dashboard /> : <LabView />}
      </main>

      <nav style={styles.nav}>
        <div style={{ ...styles.navItem, ...(activeTab === 'dashboard' ? styles.navItemActive : {}) }} onClick={() => setActiveTab('dashboard')}>
          DASHBOARD
        </div>
        <div style={{ ...styles.navItem, ...(activeTab === 'lab' ? styles.navItemActive : {}) }} onClick={() => setActiveTab('lab')}>
          PROTOCOL LAB
          {gameState.protocolLevel < 50 && <span style={{ fontSize: '0.6rem', marginLeft: '4px' }}>🔒</span>}
        </div>
      </nav>
    </div>
  );
}
