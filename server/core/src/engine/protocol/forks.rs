use crate::models::state::PlayerState;
use crate::models::protocol::{ChainType, ForkType};

const FORK_COST_PHASE_1: i64 = 1_000_000 * 10000; 
const FORK_COST_PHASE_2: i64 = 500_000 * 10000;  

pub fn execute_fork(state: &mut PlayerState, fork_type: ForkType) -> Result<String, String> {
    if !state.protocol.is_unlocked { return Err("Locked".to_string()); }

    match fork_type {
        ForkType::Genesis => {
            if state.protocol.active_chain != ChainType::HybridPoW {
                return Err("Invalid Chain for Genesis Fork".to_string());
            }
            if state.protocol.chain_resources.current_hash_rate < FORK_COST_PHASE_1 {
                return Err("Insufficient Hash Rate".to_string());
            }

            let legacy_gain = state.protocol.chain_resources.current_hash_rate / 20; 
            let speed_boost_bp = (legacy_gain / 1000) as i64; 

            state.protocol.legacy.speed_modifier += speed_boost_bp;
            state.protocol.chain_resources.current_hash_rate = 0;
            state.protocol.active_chain = ChainType::PPoS;
            state.protocol.phase_index = 2;
            
            Ok("Genesis Fork Complete. Hybrid PoW -> PPoS".to_string())
        },
        ForkType::Regulatory => {
            if state.protocol.active_chain != ChainType::PPoS {
                return Err("Invalid Chain for Regulatory Fork".to_string());
            }
            if state.protocol.chain_resources.privacy_score < FORK_COST_PHASE_2 {
                return Err("Insufficient Privacy Score".to_string());
            }

            let legacy_gain = state.protocol.chain_resources.privacy_score / 33;
            let anon_boost_bp = (legacy_gain / 500) as i64;

            state.protocol.legacy.anonymization_speed += anon_boost_bp;
            state.protocol.chain_resources.privacy_score = 0;
            state.protocol.active_chain = ChainType::PoSC;
            state.protocol.phase_index = 3;

            Ok("Regulatory Fork Complete. PPoS -> PoSC".to_string())
        },
        ForkType::Unification => {
             if state.protocol.active_chain != ChainType::PoSC {
                return Err("Invalid Chain for Unification Fork".to_string());
            }
            state.protocol.legacy.cost_reduction += 500;
            state.protocol.active_chain = ChainType::UPAL;
            state.protocol.phase_index = 4;
            Ok("Unification Fork Complete. PoSC -> UPAL".to_string())
        }
    }
}
