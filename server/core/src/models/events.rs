use serde::{Deserialize, Serialize};
use crate::models::state::{DistrictId, SpecializationPath};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", content = "payload")]
pub enum GameEvent {
    #[serde(rename = "TICK_OFFLINE")]
    TickOffline { timestamp: u64, delta_ms: u64 },
    
    #[serde(rename = "TAP_GENERATE")]
    TapGenerate { timestamp: u64, count: u32 },
    
    #[serde(rename = "UPGRADE_DISTRICT")]
    UpgradeDistrict { timestamp: u64, district_id: DistrictId },
    
    #[serde(rename = "SET_TUNING")]
    SetTuning { timestamp: u64, district_id: DistrictId, value: u32 },
    
    #[serde(rename = "CHOOSE_SPEC")]
    ChooseSpec { timestamp: u64, district_id: DistrictId, path: SpecializationPath },
    
    #[serde(rename = "PRESTIGE_RESET")]
    PrestigeReset { timestamp: u64 },
    
    #[serde(rename = "BOOST_ACTIVATE")]
    BoostActivate { timestamp: u64, boost_id: String },
    
    #[serde(rename = "PROTOCOL_UNLOCK")]
    ProtocolUnlock { timestamp: u64 },

    #[serde(rename = "PROTOCOL_INTERACTION")]
    ProtocolInteraction { timestamp: u64, action: String },

    #[serde(rename = "PROTOCOL_FORK")]
    ProtocolFork { timestamp: u64, fork_type: String },
}

impl GameEvent {
    pub fn timestamp(&self) -> u64 {
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
