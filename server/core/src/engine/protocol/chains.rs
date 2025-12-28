use crate::models::state::PlayerState;
use crate::models::protocol::{ChainType};

const PRECISION: i64 = 10000;

pub fn process_tick(state: &mut PlayerState, delta_ms: u64) {
    if !state.protocol.is_unlocked { return; }

    let delta_sec = delta_ms as i64 / 1000;
    if delta_sec <= 0 { return; }

    let speed_mod = state.protocol.legacy.speed_modifier.max(PRECISION); 
    
    match state.protocol.active_chain {
        ChainType::HybridPoW => {
            let base_rate = 10 * PRECISION;
            let effective_rate = (base_rate * speed_mod) / PRECISION;
            state.protocol.chain_resources.current_hash_rate += effective_rate * delta_sec;
        },
        ChainType::PPoS => {
            let base_rate = 5 * PRECISION; 
            let effective_rate = (base_rate * speed_mod) / PRECISION;
            state.protocol.chain_resources.privacy_score += (effective_rate / 10) * delta_sec;
        },
        _ => {}
    }
}

pub fn active_interaction(state: &mut PlayerState, action_type: &str) {
    if !state.protocol.is_unlocked { return; }

    match (state.protocol.active_chain.clone(), action_type) {
        (ChainType::PPoS, "MIX_Privacy") => {
            let gain = 100 * PRECISION;
            state.protocol.chain_resources.privacy_score += gain;
        },
        _ => {}
    }
}
