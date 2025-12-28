import React from 'react';
import { THEME } from '../../config/theme';

export const Card: React.FC<{ children: React.ReactNode, style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{
    backgroundColor: THEME.colors.surface, border: `1px solid ${THEME.colors.border}`,
    borderRadius: THEME.borderRadius.md, padding: THEME.spacing.md, marginBottom: THEME.spacing.md, ...style
  }}>{children}</div>
);
