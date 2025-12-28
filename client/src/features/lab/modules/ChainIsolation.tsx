import React, { useState } from 'react';
import { useGameStore } from '../../../stores/game.store';
import { ResourceId } from '../../../../../shared/src/types/game.types';

export const ChainIsolation = () => {
  const { gameState } = useGameStore();
  const [amount, setAmount] = useState<string>('');
  if (!gameState) return null;
  
  const formatRes = (id: ResourceId) => (Number(gameState.resources[id] || 0) / 10000).toLocaleString(undefined, { maximumFractionDigits: 2 });
  const currentP = Number(gameState.resources['P'] || 0) / 10000;
  const inputVal = parseFloat(amount) || 0;
  const isHighSlippage = (currentP > 0 ? (inputVal / currentP) : 0) > 0.10;

  return (
    <div style={{ padding: '16px', background: '#0d0d0d', borderRadius: '8px', border: '1px solid #333' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid #222', paddingBottom: '8px' }}>
        <span style={{ color: '#00ffcc', fontWeight: 'bold', fontSize: '0.9rem' }}>Module 01: Chain Isolation</span>
      </div>
      <div style={{ marginBottom: '12px', padding: '8px', background: '#151515', borderRadius: '6px' }}><div>Ⓟ PoW Chain</div><div style={{ fontFamily: 'monospace', fontSize: '1.1rem' }}>{formatRes('P')}</div></div>
      <div style={{ marginBottom: '12px', padding: '8px', background: '#151515', borderRadius: '6px' }}><div>Ⓩ Privacy Chain</div><div style={{ fontFamily: 'monospace', fontSize: '1.1rem' }}>{formatRes('Z')}</div></div>
      <div style={{ padding: '12px', background: '#1a1a1a', borderRadius: '8px', border: '1px dashed #444' }}>
        <span style={{ display: 'block', color: '#888', fontSize: '0.7rem', marginBottom: '8px' }}>BRIDGE (ONE-WAY)</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input type="number" placeholder="Amount Ⓟ" value={amount} onChange={(e) => setAmount(e.target.value)} style={{ flex: 1, padding: '8px', background: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
          <div style={{ padding: '8px', background: '#222', borderRadius: '4px', minWidth: '60px', textAlign: 'center', color: '#888' }}>{(inputVal * 0.01).toFixed(2)} Ⓩ</div>
        </div>
        {isHighSlippage && <div style={{ color: '#ff4444', fontSize: '0.7rem', marginTop: '4px' }}>⚠️ HIGH SLIPPAGE</div>}
        <button style={{ width: '100%', padding: '10px', background: '#333', color: '#fff', border: 'none', borderRadius: '4px', marginTop: '8px', fontWeight: 'bold' }}>EXECUTE ATOMIC SWAP</button>
      </div>
    </div>
  );
};
