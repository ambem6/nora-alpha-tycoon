use crate::models::state::PlayerState;
use crate::models::events::GameEvent;
use crate::models::config::GameConfig;
use crate::engine::{economy, prestige, social, protocol};
use crate::models::protocol::ForkType;

pub fn process_event(mut state: PlayerState, event: GameEvent, config: &GameConfig) -> PlayerState {
    let event_timestamp = event.timestamp();
    if event_timestamp < state.last_processed_tick {
        eprintln!("[WARN] Event timestamp ({}) < last processed tick ({})", 
                 event_timestamp, state.last_processed_tick);
    }
    state.last_processed_tick = state.last_processed_tick.max(event_timestamp);
    
    // 1. Passive Ticks
    if let GameEvent::TickOffline { delta_ms, .. } = event {
        economy::process_tick(&mut state, delta_ms, config);
        protocol::chains::process_tick(&mut state, delta_ms);
    }

    match event {
        GameEvent::TickOffline { .. } => {},
        GameEvent::TapGenerate { count, .. } => {
            economy::process_tap(&mut state, count, config);
        },
        GameEvent::UpgradeDistrict { district_id, .. } => {
            economy::process_upgrade(&mut state, district_id, config);
        },
        GameEvent::SetTuning { district_id, value, .. } => {
            if let Some(district) = state.districts.get_mut(&district_id) {
                if district.level >= 25 {
                    district.tuning_factor = value.clamp(0, 100);
                    economy::recalc_output(&mut state, config);
                }
            }
        },
        GameEvent::ChooseSpec { district_id, path, .. } => {
            if let Some(district) = state.districts.get_mut(&district_id) {
                if district.level >= 50 {
                    district.specialization = path;
                    economy::recalc_output(&mut state, config);
                }
            }
        },
        GameEvent::PrestigeReset { .. } => {
            if let Ok(_) = prestige::perform_reset(&mut state) {
                social::recalc_modifiers(&mut state);
                economy::recalc_output(&mut state, config);
            }
        },
        GameEvent::BoostActivate { boost_id, .. } => {
            let _ = social::apply_boost(&mut state, boost_id, social::BoostSource::ChatEmoji);
        },
        
        // Protocol Events
        GameEvent::ProtocolUnlock { .. } => {
            let _ = protocol::ascension::try_unlock(&mut state);
        },
        GameEvent::ProtocolInteraction { action, .. } => {
            protocol::chains::active_interaction(&mut state, &action);
        },
        GameEvent::ProtocolFork { fork_type, .. } => {
            let internal_type = match fork_type.as_str() {
                "GENESIS" => Some(ForkType::Genesis),
                "REGULATORY" => Some(ForkType::Regulatory),
                "UNIFICATION" => Some(ForkType::Unification),
                _ => None
            };
            if let Some(ft) = internal_type {
                let _ = protocol::forks::execute_fork(&mut state, ft);
            }
        },
        _ => {} 
    }
    state
}
