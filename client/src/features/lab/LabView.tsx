import React from 'react';
import { useGameStore } from '../../stores/game.store';
import { ChainIsolation } from './modules/ChainIsolation';
import { ProtocolView } from '../protocol/ProtocolView';
import { GAME_CONFIG } from '../../../../shared/src/config/loader';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { THEME } from '../../config/theme';

export const LabView = () => {
  const { gameState } = useGameStore();
  const [view, setView] = React.useState<'MODULES' | 'PROTOCOL'>('MODULES');
  if (!gameState) return null;
  const unlock = GAME_CONFIG.prestige.unlockLevel;

  if (view === 'PROTOCOL') return <div style={{ padding: THEME.spacing.md }}><Button onClick={() => setView('MODULES')} variant="outline" style={{ marginBottom: THEME.spacing.md }}>← Back to Lab</Button><ProtocolView /></div>;

  if (gameState.protocolLevel < unlock) return (
    <div style={{ height: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: THEME.spacing.lg }}>
      <Card style={{ width: '100%', textAlign: 'center', padding: THEME.spacing.xl }}>
        <div style={{ fontSize: '3rem', marginBottom: THEME.spacing.md }}>🔒</div>
        <div style={{ fontWeight: 'bold' }}>RESTRICTED AREA</div>
        <div style={{ color: THEME.colors.text.muted, margin: '16px 0' }}>Required Level: {unlock}</div>
        <ProgressBar value={gameState.protocolLevel} max={unlock} showLabel />
      </Card>
    </div>
  );

  return (
    <div style={{ padding: THEME.spacing.md }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: THEME.spacing.lg, borderBottom: `1px solid ${THEME.colors.border}`, paddingBottom: THEME.spacing.md }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>PROTOCOL LAB</div>
        {gameState.protocolLevel >= 50 && <Button onClick={() => setView('PROTOCOL')} variant="outline" style={{ borderColor: '#00ffcc', color: '#00ffcc', backgroundColor: 'rgba(0, 255, 204, 0.1)' }}>▲ ASCENSION</Button>}
      </header>
      <ChainIsolation />
    </div>
  );
};
