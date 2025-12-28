use crate::models::state::PlayerState;
use crate::models::protocol::{ChainType, PROTOCOL_UNLOCK_LEVEL};

pub fn try_unlock(state: &mut PlayerState) -> Result<bool, String> {
    if state.protocol.is_unlocked {
        return Ok(false);
    }

    if state.protocol_level < PROTOCOL_UNLOCK_LEVEL {
        return Err(format!("Insufficient Level. Required: {}, Current: {}", PROTOCOL_UNLOCK_LEVEL, state.protocol_level));
    }

    state.protocol.is_unlocked = true;
    state.protocol.active_chain = ChainType::HybridPoW;
    state.protocol.phase_index = 1;

    Ok(true)
}
