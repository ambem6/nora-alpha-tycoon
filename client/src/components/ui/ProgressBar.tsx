import React from 'react';
import { THEME } from '../../config/theme';

export const ProgressBar: React.FC<{ value: number, max: number, showLabel?: boolean, color?: string }> = ({ value, max, showLabel, color = THEME.colors.primary }) => {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div style={{ width: '100%' }}>
      {showLabel && <div style={{ fontSize: '0.7rem', color: '#888', marginBottom: '2px' }}>{pct.toFixed(0)}%</div>}
      <div style={{ width: '100%', backgroundColor: '#333', height: '4px', borderRadius: '2px' }}>
        <div style={{ width: `${pct}%`, backgroundColor: color, height: '100%', transition: 'width 0.5s' }} />
      </div>
    </div>
  );
};
