use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use crate::models::protocol::ProtocolState;

pub type FixedPoint = i64;
pub type Timestamp = u64;

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum DistrictId {
    #[serde(rename = "mining_district")]
    MiningDistrict,
    #[serde(rename = "privacy_vault")]
    PrivacyVault,
    #[serde(rename = "compliance_tower")]
    ComplianceTower,
}

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum ResourceId {
    NP,
    P,
    Z,
    K,
    PSI,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum SpecializationPath {
    NONE,
    PATH_A,
    PATH_B,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DistrictState {
    pub level: u32,
    pub tuning_factor: u32,
    pub specialization: SpecializationPath,
    pub output_rate: FixedPoint,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct LabState {
    pub is_unlocked: bool,
    pub active_modules: Vec<String>,
    pub slippage_malus: FixedPoint,
    pub slippage_expiry: Timestamp,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PlayerState {
    pub user_id: String,
    pub resources: HashMap<ResourceId, FixedPoint>,
    pub districts: HashMap<DistrictId, DistrictState>,
    pub protocol_level: u32,
    pub prestige_count: u32,
    pub global_multiplier: FixedPoint,
    pub lab: LabState,
    #[serde(default)]
    pub protocol: ProtocolState,
    pub last_processed_tick: Timestamp,
}

impl PlayerState {
    pub fn new(user_id: String, now: Timestamp) -> Self {
        Self {
            user_id,
            resources: HashMap::new(),
            districts: HashMap::new(),
            protocol_level: 0,
            prestige_count: 0,
            global_multiplier: 10000,
            lab: LabState::default(),
            protocol: ProtocolState::default(),
            last_processed_tick: now,
        }
    }
}
