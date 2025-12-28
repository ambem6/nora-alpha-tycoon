use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DistrictConfig {
    pub id: String,
    pub name: String,
    pub base_cost: i64,
    pub base_output: i64,
    pub cost_growth: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PrestigeConfig {
    pub unlock_level: u32,
    pub bonus_per_prestige: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LabConfig {
    pub unlock_level: u32,
    pub base_exchange_rate: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SocialConfig {
    pub referral_bonus: i64,
    pub boost_duration_sec: u64,
    pub boost_multiplier: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CoreConfig {
    pub precision_basis: i64,
    pub max_offline_seconds: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct GameConfig {
    pub core: CoreConfig,
    pub districts: HashMap<String, DistrictConfig>,
    pub prestige: PrestigeConfig,
    pub lab: LabConfig,
    pub social: SocialConfig,
}

impl Default for CoreConfig {
    fn default() -> Self {
        CoreConfig { precision_basis: 10000, max_offline_seconds: 86400 }
    }
}
