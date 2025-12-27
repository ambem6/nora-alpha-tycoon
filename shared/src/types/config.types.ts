export interface DistrictConfig {
  id: string;
  name: string;
  baseCost: number;       // Basis Points (1.00 = 10000)
  baseOutput: number;     // Basis Points (1.00 = 10000)
  costGrowth: number;     // Basis Points (1.07 = 10700)
}

export interface PrestigeConfig {
  unlockLevel: number;
  bonusPerPrestige: number; // Basis Points
}

export interface LabConfig {
  unlockLevel: number;
  baseExchangeRate: number; // Basis Points
}

export interface SocialConfig {
  referralBonus: number;    // Basis Points
  boostDurationSec: number;
  boostMultiplier: number;  // Basis Points
}

export interface GameConfig {
  core: {
    precisionBasis: number; // 10000
    maxOfflineSeconds: number;
  };
  districts: Record<string, DistrictConfig>;
  prestige: PrestigeConfig;
  lab: LabConfig;
  social: SocialConfig;
}
