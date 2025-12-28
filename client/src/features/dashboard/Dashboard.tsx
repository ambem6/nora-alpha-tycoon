import React from 'react';
import { useGameStore } from '../../stores/game.store';
import { GAME_CONFIG } from '../../../../shared/src/config/loader';
import { DistrictId } from '../../../../shared/src/types/game.types';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { THEME } from '../../config/theme';

export const Dashboard = () => {
  const { gameState, tap, upgradeDistrict } = useGameStore();
  if (!gameState) return null;

  return (
    <div style={{ padding: THEME.spacing.md, paddingBottom: '80px' }}>
      <div style={{ display: 'flex', justifyContent: 'center', padding: THEME.spacing.xl, marginBottom: THEME.spacing.md }}>
        <button onClick={tap} style={{
          width: '200px', height: '200px', borderRadius: '50%', border: `4px solid ${THEME.colors.primary}`,
          background: `radial-gradient(circle, ${THEME.colors.primaryDim} 0%, #000 70%)`, color: THEME.colors.primary,
          fontSize: '2rem', fontWeight: 'bold', cursor: 'pointer', boxShadow: `0 0 30px ${THEME.colors.primaryDim}`
        }}>⛏️</button>
      </div>
      <div style={{ marginBottom: THEME.spacing.sm, color: THEME.colors.text.muted, fontSize: '0.7rem' }}>INFRASTRUCTURE</div>
      {Object.values(GAME_CONFIG.districts).map((config) => {
        const dState = gameState.districts[config.id as DistrictId];
        if (!dState) return null;
        const growth = config.costGrowth / 10000;
        const cost = Math.floor(config.baseCost * Math.pow(growth, dState.level));
        const canAfford = Number(gameState.resources.NP) >= cost;
        return (
          <Card key={config.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div><div style={{ fontWeight: 'bold' }}>{config.name}</div><div style={{ color: THEME.colors.text.muted, fontSize: '0.8rem' }}>Lvl {dState.level}</div></div>
            <Button disabled={!canAfford} onClick={() => upgradeDistrict(config.id as DistrictId)}>Buy {(cost / 10000).toLocaleString(undefined, { maximumFractionDigits: 0 })}</Button>
          </Card>
        );
      })}
    </div>
  );
};
