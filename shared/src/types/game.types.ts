// --------------------------------------------------------
// PRIMITIVES (MAPPED TO RUST)
// --------------------------------------------------------
export type FixedPoint = number;
export type Timestamp = number;
export type DistrictId = 'mining_district' | 'privacy_vault' | 'compliance_tower';
export type ResourceId = 'NP' | 'P' | 'Z' | 'K' | 'PSI';

// --------------------------------------------------------
// GAME STATE (THE ATOM)
// --------------------------------------------------------

export interface DistrictState {
  level: number;
  tuningFactor: number;
  specialization: 'NONE' | 'PATH_A' | 'PATH_B';
  outputRate: FixedPoint;
}

export interface PlayerState {
  userId: string;
  resources: Record<ResourceId, FixedPoint>;
  districts: Record<DistrictId, DistrictState>;
  protocolLevel: number;
  prestigeCount: number;
  globalMultiplier: FixedPoint;
  lab: {
    isUnlocked: boolean;
    activeModules: string[];
    slippageMalus: FixedPoint;
    slippageExpiry: Timestamp;
  };
  lastProcessedTick: Timestamp;
}

// --------------------------------------------------------
// EVENT SOURCING (INPUTS)
// --------------------------------------------------------

export type GameEventType = 
  | 'TICK_OFFLINE'
  | 'TAP_GENERATE'
  | 'UPGRADE_DISTRICT'
  | 'SET_TUNING'
  | 'CHOOSE_SPEC'
  | 'PRESTIGE_RESET'
  | 'BOOST_ACTIVATE';

export interface BaseEvent {
  type: GameEventType;
  timestamp: Timestamp;
}

export interface TickEvent extends BaseEvent {
  type: 'TICK_OFFLINE';
  deltaMs: number;
}

export interface TapEvent extends BaseEvent {
  type: 'TAP_GENERATE';
  count: number;
}

export interface UpgradeEvent extends BaseEvent {
  type: 'UPGRADE_DISTRICT';
  districtId: DistrictId;
}

export interface TuningEvent extends BaseEvent {
  type: 'SET_TUNING';
  districtId: DistrictId;
  value: number;
}

export interface SpecializeEvent extends BaseEvent {
  type: 'CHOOSE_SPEC';
  districtId: DistrictId;
  path: 'PATH_A' | 'PATH_B';
}

export interface PrestigeEvent extends BaseEvent {
  type: 'PRESTIGE_RESET';
}

export interface BoostEvent extends BaseEvent {
  type: 'BOOST_ACTIVATE';
  boostId: string;
}

export type GameEvent = 
  | TickEvent 
  | TapEvent 
  | UpgradeEvent 
  | TuningEvent 
  | SpecializeEvent 
  | PrestigeEvent
  | BoostEvent;

// --------------------------------------------------------
// BRIDGE RESPONSES
// --------------------------------------------------------

export interface EngineResult {
  newState: PlayerState;
  eventsProcessed: number;
  stateDiff?: Partial<PlayerState>; 
  error?: string;
}
