#![deny(clippy::all)]
use napi::bindgen_prelude::*;
use napi_derive::napi;
use serde_json;
mod api; mod engine; mod models;
use models::state::PlayerState;
use models::events::GameEvent;
use models::config::GameConfig;

#[napi]
pub fn init_engine() {
    std::panic::set_hook(Box::new(|info| { eprintln!("RUST CORE PANIC: {:?}", info); }));
}

#[napi]
pub fn apply_event(state_json: String, event_json: String, config_json: String) -> Result<String> {
    let state: PlayerState = serde_json::from_str(&state_json).map_err(|e| Error::from_reason(format!("State: {}", e)))?;
    let event: GameEvent = serde_json::from_str(&event_json).map_err(|e| Error::from_reason(format!("Event: {}", e)))?;
    let config: GameConfig = serde_json::from_str(&config_json).map_err(|e| Error::from_reason(format!("Config: {}", e)))?;

    let result = std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| {
        engine::systems::process_event(state, event, &config)
    }));

    match result {
        Ok(new_state) => serde_json::to_string(&new_state).map_err(|e| Error::from_reason(format!("Serialize: {}", e))),
        Err(_) => Err(Error::from_reason("Engine Panic".to_string()))
    }
}

#[napi]
pub fn reduce_batch(state_json: String, events_json: String, config_json: String) -> Result<String> {
    let mut state: PlayerState = serde_json::from_str(&state_json).map_err(|e| Error::from_reason(format!("State: {}", e)))?;
    let events: Vec<GameEvent> = serde_json::from_str(&events_json).map_err(|e| Error::from_reason(format!("Events: {}", e)))?;
    let config: GameConfig = serde_json::from_str(&config_json).map_err(|e| Error::from_reason(format!("Config: {}", e)))?;

    let result = std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| {
        for event in events { state = engine::systems::process_event(state, event, &config); }
        state
    }));

    match result {
        Ok(final_state) => serde_json::to_string(&final_state).map_err(|e| Error::from_reason(format!("Serialize: {}", e))),
        Err(_) => Err(Error::from_reason("Engine Panic".to_string()))
    }
}
