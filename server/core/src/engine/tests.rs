#[cfg(test)]
mod tests {
    use crate::models::state::{PlayerState, DistrictId, ResourceId};
    use crate::engine::{economy, systems};
    use crate::models::events::GameEvent;
    
    fn create_test_state() -> PlayerState {
        PlayerState::new("test_user_001".to_string(), 1000)
    }

    #[test]
    fn test_passive_generation() {
        let mut state = create_test_state();
        if let Some(d) = state.districts.get_mut(&DistrictId::MiningDistrict) {
            d.level = 1;
            economy::recalc_output(&mut state);
        }
        economy::process_tick(&mut state, 1000, &crate::models::config::GameConfig::default());
        let np = *state.resources.get(&ResourceId::NP).unwrap();
        assert!(np > 0);
    }
}
