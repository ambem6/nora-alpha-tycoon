use crate::models::state::{PlayerState, ResourceId, SpecializationPath};

const PRESTIGE_UNLOCK_LEVEL: u32 = 50;

pub fn perform_reset(state: &mut PlayerState) -> Result<bool, String> {
    if state.protocol_level < PRESTIGE_UNLOCK_LEVEL {
        return Err("Protocol Level 50 required for prestige.".to_string());
    }

    if state.prestige_count == 0 {
        state.lab.is_unlocked = true;
    }

    state.prestige_count += 1;

    state.resources.insert(ResourceId::NP, 0);
    state.resources.insert(ResourceId::P, 0);
    state.resources.insert(ResourceId::Z, 0);
    state.resources.insert(ResourceId::K, 0);
    
    for district in state.districts.values_mut() {
        district.level = 0;
        district.output_rate = 0;
        district.specialization = SpecializationPath::NONE;
        district.tuning_factor = 50;
    }

    state.protocol_level = 0;

    Ok(true)
}
