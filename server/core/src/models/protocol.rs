use serde::{Deserialize, Serialize};
use crate::models::state::{FixedPoint};

pub const PROTOCOL_UNLOCK_LEVEL: u32 = 50;

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum ChainType {
    None,       
    HybridPoW,  
    PPoS,       
    PoSC,      
    UPAL,       
}

impl Default for ChainType {
    fn default() -> Self { ChainType::None }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum ForkType {
    Genesis,    
    Regulatory, 
    Unification 
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ChainState {
    pub current_hash_rate: FixedPoint, 
    pub privacy_score: FixedPoint,     
    pub compliance_tier: u8,           
    pub accumulated_proofs: FixedPoint, 
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LegacyBeaconState {
    pub speed_modifier: FixedPoint,        
    pub anonymization_speed: FixedPoint,   
    pub cost_reduction: FixedPoint,        
    pub governance_tokens: FixedPoint,     
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GovernorState {
    pub auto_balancer_active: bool, 
    pub efficiency_rating: u8,      
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProtocolState {
    pub is_unlocked: bool,
    pub active_chain: ChainType,
    pub chain_resources: ChainState,
    pub legacy: LegacyBeaconState,
    pub governors: GovernorState,
    pub phase_index: u8, 
}
