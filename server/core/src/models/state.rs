File: server/core/src/models/state.rs
Responsibility
 * Defines the memory layout of the Game State in Rust.
 * Implements Serialize / Deserialize for passing data to/from Node.js.
 * Enforces type safety for Fixed-Point arithmetic (using i64).
<!-- end list -->
// STRUCTURE FROZEN: server/core/src/models/state.rs

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use crate::models::protocol::ProtocolState; // Import the new module

// --------------------------------------------------------
// PRIMITIVES
// --------------------------------------------------------

/// Fixed-point integer (Basis Points). 1.00 = 10000.
pub type FixedPoint = i64;

/// Milliseconds since Unix Epoch.
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

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum SpecializationPath {
    NONE,
    PATH_A,
    PATH_B,
}

// --------------------------------------------------------
// SUB-STATES
// --------------------------------------------------------

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DistrictState {
    pub level: u32,
    /// Tuning slider value (0-100). Unlocked at Lvl 25.
    pub tuning_factor: u8,
    /// Specialization choice. Unlocked at Lvl 50.
    pub specialization: SpecializationPath,
    /// Cached production rate (NP/sec in basis points)
    pub output_rate: FixedPoint,
}

impl Default for DistrictState {
    fn default() -> Self {
        Self {
            level: 0,
            tuning_factor: 50, // Default to neutral efficiency
            specialization: SpecializationPath::NONE,
            output_rate: 0,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LabState {
    pub is_unlocked: bool,
    pub active_modules: Vec<String>,
    /// Current slippage penalty factor (Basis points, 10000 = 1.0)
    pub slippage_malus: FixedPoint,
    /// Timestamp when slippage fully recovers
    pub slippage_expiry: Timestamp,
}

impl Default for LabState {
    fn default() -> Self {
        Self {
            is_unlocked: false,
            active_modules: Vec::new(),
            slippage_malus: 0,
            slippage_expiry: 0,
        }
    }
}

// --------------------------------------------------------
// MAIN PLAYER STATE (THE ATOM)
// --------------------------------------------------------

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PlayerState {
    pub user_id: String,

    /// Resource Wallet (NP, P, Z, K, PSI)
    pub resources: HashMap<ResourceId, FixedPoint>,

    /// Buildings / Infrastructure
    pub districts: HashMap<DistrictId, DistrictState>,

    /// Core Progression
    pub protocol_level: u32,
    pub prestige_count: u32,

    /// Calculated Global Multiplier (Basis Points).
    /// Derived from Referrals + Alliances + Boosts.
    pub global_multiplier: FixedPoint,

    /// Architect Lab (Endgame)
    pub lab: LabState,

    /// Metadata for Replay/Validation
    pub last_processed_tick: Timestamp,

    // --- PROTOCOL ASCENSION LAYER (PAL) ---
    // Zero Regression: Defaults to empty if missing in legacy DB rows
    #[serde(default)]
    pub protocol: ProtocolState,
}

impl PlayerState {
    pub fn new(user_id: String, now: Timestamp) -> Self {
        // Initialize Default Districts
        let mut districts = HashMap::new();
        districts.insert(DistrictId::MiningDistrict, DistrictState::default());
        districts.insert(DistrictId::PrivacyVault, DistrictState::default());
        districts.insert(DistrictId::ComplianceTower, DistrictState::default());

        // Initialize Default Resources
        let mut resources = HashMap::new();
        resources.insert(ResourceId::NP, 0);
        resources.insert(ResourceId::PSI, 0);

        Self {
            user_id,
            resources,
            districts,
            protocol_level: 0,
            prestige_count: 0,
            global_multiplier: 10000, // 1.0x
            lab: LabState::default(),
            last_processed_tick: now,
            protocol: ProtocolState::default(),
        }
    }
}