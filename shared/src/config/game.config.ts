export const GAME_CONFIG = {
  CORE: {
    TICKS_PER_SECOND: 1, 
    MAX_OFFLINE_SECONDS: 86400, 
    PRECISION_BASIS: 10000, 
  },
  DISTRICTS: {
    MINING: {
      ID: 'mining_district',
      NAME: 'Mining District',
      BASE_COST: 10,
      BASE_OUTPUT: 1, 
      COST_COEFFICIENT: 1.07, 
    },
    PRIVACY: {
      ID: 'privacy_vault',
      NAME: 'Privacy Vault',
      BASE_COST: 100,
      BASE_OUTPUT: 8,
      COST_COEFFICIENT: 1.08,
    },
    COMPLIANCE: {
      ID: 'compliance_tower',
      NAME: 'Compliance Tower',
      BASE_COST: 1000,
      BASE_OUTPUT: 40,
      COST_COEFFICIENT: 1.09,
    },
  },
  PROGRESSION: {
    LEVEL_CAP: 100,
    UNLOCK_LEVELS: {
      VISUAL_UPGRADE: 10,
      TUNING_SLIDER: 25,
      SPECIALIZATION: 50,
      MASTERY: 100,
    },
    PRESTIGE: {
      REQUIRED_LEVEL: 50,
      CURRENCY_RESET_FACTOR: 0, 
    }
  },
  SOCIAL: {
    REFERRAL: {
      MULTIPLIER_BONUS: 0.05, 
      CAP: 20, 
    },
    BOOSTS: {
      CHAT_EMOJI_DURATION: 120, 
      CHAT_EMOJI_MULTIPLIER: 1.10, 
    }
  },
  LAB: {
    DYNAMIC_PRICING: {
      SLIPPAGE_THRESHOLD: 0.10, 
      SLIPPAGE_PENALTY: 0.30,   
      RECOVERY_TIME_SEC: 60,
    }
  },
  PAYMENTS: {
    PACKS: {
      'psi_small': {
        ID: 'psi_small',
        NAME: 'Small PSI Pack',
        STARS_PRICE: 100,
        TON_PRICE: 1, 
        PSI_AMOUNT: 500,
      },
      'psi_large': {
        ID: 'psi_large',
        NAME: 'Large PSI Pack',
        STARS_PRICE: 500,
        TON_PRICE: 5, 
        PSI_AMOUNT: 3000,
      }
    }
  },
  SECURITY: {
    RATE_LIMITS: {
      GLOBAL: 100,
      AUTH: 10, 
      PAYMENT: 5, 
    },
    WINDOW_MS: 60000,
    TELEGRAM_AUTH_TTL: 300, 
  }
} as const;

export type DistrictId = typeof GAME_CONFIG.DISTRICTS[keyof typeof GAME_CONFIG.DISTRICTS]['ID'];
export type PackId = keyof typeof GAME_CONFIG.PAYMENTS.PACKS;
