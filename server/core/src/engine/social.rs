use crate::models::state::PlayerState;
use std::time::{SystemTime, UNIX_EPOCH};

const BASE_MULTIPLIER: i64 = 10000;
const REFERRAL_BONUS_BP: i64 = 500;
const PRESTIGE_BONUS_BP: i64 = 5000;
const BOOST_BONUS_BP: i64 = 1000;
const MAX_MULTIPLIER_CAP: i64 = 100000;

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Boost {
    pub id: String,
    pub multiplier_bp: i64,
    pub activated_at: u64,
    pub expires_at: u64,
    pub source: BoostSource,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum BoostSource {
    Referral,
    Alliance,
    ChatEmoji,
    SpecialEvent(String),
    Payment,
}

pub fn recalc_modifiers(state: &mut PlayerState) {
    let mut total_mult = BASE_MULTIPLIER;
    let prestige_bonus = state.prestige_count as i64 * PRESTIGE_BONUS_BP;
    total_mult += prestige_bonus;
    
    if state.lab.is_unlocked {
        total_mult += 1000;
    }

    total_mult = total_mult.min(MAX_MULTIPLIER_CAP);
    total_mult = total_mult.max(BASE_MULTIPLIER);

    state.global_multiplier = total_mult;
}

pub fn apply_boost(state: &mut PlayerState, boost_id: String, source: BoostSource) -> Result<(), String> {
    let immediate_boost = BOOST_BONUS_BP;
    state.global_multiplier += immediate_boost;
    state.global_multiplier = state.global_multiplier.min(MAX_MULTIPLIER_CAP);
    Ok(())
}
