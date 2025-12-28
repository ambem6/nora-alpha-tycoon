import { GAME_CONFIG } from '../../../../shared/src/config/game.config';

export const formatCurrency = (amount: bigint | number, decimals = 2): string => {
  const val = Number(amount) / GAME_CONFIG.CORE.PRECISION_BASIS;
  if (val >= 1_000_000) return (val / 1_000_000).toFixed(decimals) + 'M';
  if (val >= 1_000) return (val / 1_000).toFixed(decimals) + 'k';
  return val.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
};

export const formatTime = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};
