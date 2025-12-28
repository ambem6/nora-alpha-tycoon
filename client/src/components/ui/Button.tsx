import React from 'react';
import styled from 'styled-components';
import { THEME } from '../../config/theme';

export const Button = styled.button<{ variant?: 'primary' | 'outline' }>`
  padding: ${THEME.spacing.sm} ${THEME.spacing.md};
  border-radius: ${THEME.borderRadius.md};
  border: ${props => props.variant === 'outline' ? `1px solid ${THEME.colors.primary}` : 'none'};
  background-color: ${props => props.variant === 'primary' ? THEME.colors.primary : 'transparent'};
  color: ${props => props.variant === 'primary' ? '#000' : THEME.colors.primary};
  cursor: pointer; font-weight: bold; transition: all 0.2s ease;
  
  &:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2); }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;
