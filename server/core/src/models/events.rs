// STRUCTURE FROZEN: Updated server/core/src/models/events.rs

use serde::{Deserialize, Serialize};
use crate::models::state::{DistrictId, SpecializationPath, Timestamp};

/// The exhaustive list of actions that can mutate the Game State.
/// Serializes to a JSON object with a "type" field matching the TypeScript definition.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "SCREAMING_SNAKE_CASE")] // Matches TS 'type': 'TICK_OFFLINE' etc.
pub enum GameEvent {
    
    /// Server-calculated time jump (offline progress or normal tick batch).
    #[serde(rename_all = "camelCase")]
    TickOffline {
        timestamp: Timestamp,
        delta_ms: u64,
    },

    /// Manual interaction from the user (Tapping).
    #[serde(rename_all = "camelCase")]
    TapGenerate {
        timestamp: Timestamp,
        count: u32,
    },

    /// Purchasing a level upgrade for a specific district.
    #[serde(rename_all = "camelCase")]
    UpgradeDistrict {
        timestamp: Timestamp,
        district_id: DistrictId,
    },

    /// Adjusting the slider (0-100) for a district (Lvl 25+).
    #[serde(rename_all = "camelCase")]
    SetTuning {
        timestamp: Timestamp,
        district_id: DistrictId,
        value: u8,
    },

    /// Selecting a permanent path for a district (Lvl 50+).
    #[serde(rename_all = "camelCase")]
    ChooseSpec {
        timestamp: Timestamp,
        district_id: DistrictId,
        path: SpecializationPath,
    },

    /// Triggering a Soft Reset to gain Prestige currency/Meta-progression.
    #[serde(rename_all = "camelCase")]
    PrestigeReset {
        timestamp: Timestamp,
    },

    /// Activating a temporary boost (e.g., from Social actions).
    #[serde(rename_all = "camelCase")]
    BoostActivate {
        timestamp: Timestamp,
        boost_id: String,
    },

    /// Unlocks the Protocol Ascension Layer (Level 50+ Req).
    #[serde(rename_all = "camelCase")]
    ProtocolUnlock {
        timestamp: Timestamp,
    },
    
    /// Generic interaction with the active chain (e.g., "MIX_Privacy").
    #[serde(rename_all = "camelCase")]
    ProtocolInteraction {
        timestamp: Timestamp,
        action: String,
    },
    
    /// Triggers a Fork State Transform.
    #[serde(rename_all = "camelCase")]
    ProtocolFork {
        timestamp: Timestamp,
        fork_type: String, // "GENESIS" | "REGULATORY" | "UNIFICATION"
    },
}

impl GameEvent {
    /// Helper to extract the timestamp from any event variant.
    pub fn timestamp(&self) -> Timestamp {
        match self {
            GameEvent::TickOffline { timestamp, .. } => *timestamp,
            GameEvent::TapGenerate { timestamp, .. } => *timestamp,
            GameEvent::UpgradeDistrict { timestamp, .. } => *timestamp,
            GameEvent::SetTuning { timestamp, .. } => *timestamp,
            GameEvent::ChooseSpec { timestamp, .. } => *timestamp,
            GameEvent::PrestigeReset { timestamp, .. } => *timestamp,
            GameEvent::BoostActivate { timestamp, .. } => *timestamp,
            GameEvent::ProtocolUnlock { timestamp, .. } => *timestamp,
            GameEvent::ProtocolInteraction { timestamp, .. } => *timestamp,
            GameEvent::ProtocolFork { timestamp, .. } => *timestamp,
        }
    }
}