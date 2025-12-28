use crate::models::state::{PlayerState, DistrictId, ResourceId, SpecializationPath};
use crate::models::config::GameConfig;

pub fn process_tick(state: &mut PlayerState, delta_ms: u64, config: &GameConfig) {
    let max_ms = config.core.max_offline_seconds * 1000;
    let safe_delta = delta_ms.min(max_ms);

    let total_output_rate = calculate_global_rate(state, config);
    let generated = (total_output_rate * safe_delta as i64) / 1000;
    *state.resources.entry(ResourceId::NP).or_insert(0) += generated;
}

pub fn process_tap(state: &mut PlayerState, count: u32, config: &GameConfig) {
    let safe_count = count.min(20) as i64;
    let base_power = 1 * config.core.precision_basis; 
    let click_power = (base_power * state.global_multiplier) / config.core.precision_basis;
    *state.resources.entry(ResourceId::NP).or_insert(0) += click_power * safe_count;
}

pub fn process_upgrade(state: &mut PlayerState, district_id: DistrictId, config: &GameConfig) {
    let config_key = match district_id {
        DistrictId::MiningDistrict => "mining_district",
        DistrictId::PrivacyVault => "privacy_vault",
        DistrictId::ComplianceTower => "compliance_tower",
    };
    let district_config = config.districts.get(config_key).expect("Config missing");

    let level = state.districts.get(&district_id).map(|d| d.level).unwrap_or(0);
    let cost = calculate_cost(district_config.base_cost, district_config.cost_growth, level, config.core.precision_basis);
    let balance = state.resources.entry(ResourceId::NP).or_insert(0);
    
    if *balance >= cost {
        *balance -= cost;
        if let Some(district) = state.districts.get_mut(&district_id) {
            district.level += 1;
        }
        recalc_output(state, config);
    }
}

pub fn recalc_output(state: &mut PlayerState, config: &GameConfig) {
    let ids: Vec<DistrictId> = state.districts.keys().cloned().collect();
    for id in ids {
        let (level, tuning, specialization) = {
            let d = state.districts.get(&id).unwrap();
            (d.level, d.tuning_factor, d.specialization.clone())
        };
        let config_key = match id {
            DistrictId::MiningDistrict => "mining_district",
            DistrictId::PrivacyVault => "privacy_vault",
            DistrictId::ComplianceTower => "compliance_tower",
        };
        let d_conf = config.districts.get(config_key).unwrap();
        let mut raw_production = d_conf.base_output * level as i64;
        let precision = config.core.precision_basis;

        if level >= 25 {
            let tuning_delta = tuning as i64 - 50;
            let tuning_mod = precision + (tuning_delta * (precision / 100));
            raw_production = (raw_production * tuning_mod) / precision;
        }
        if level >= 50 && specialization == SpecializationPath::PATH_A {
            raw_production = (raw_production * 12500) / precision;
        }
        if level >= 50 && specialization == SpecializationPath::PATH_B {
            raw_production = (raw_production * 11500) / precision;
        }
        if let Some(d) = state.districts.get_mut(&id) {
            d.output_rate = raw_production;
        }
    }
}

fn calculate_global_rate(state: &PlayerState, config: &GameConfig) -> i64 {
    let mut total = 0;
    for district in state.districts.values() { total += district.output_rate; }
    (total * state.global_multiplier) / config.core.precision_basis
}

fn calculate_cost(base: i64, growth_bp: i64, level: u32, precision: i64) -> i64 {
    if level == 0 { return base; }
    let mut current_cost = base;
    for _ in 0..level { current_cost = (current_cost * growth_bp) / precision; }
    current_cost
}
