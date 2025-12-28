use crate::models::state::{PlayerState, ResourceId};

const BASE_EXCHANGE_RATE: i64 = 100;
const SLIPPAGE_SENSITIVITY: i64 = 5000;

pub fn quote_swap(amount_in: i64, _source: ResourceId, _dest: ResourceId) -> (i64, i64) {
    let pool_depth = 1_000_000;
    
    let slippage_bp = if amount_in > 0 {
        (amount_in * 10000) / pool_depth
    } else {
        0
    };

    let penalty_factor = 10000 - slippage_bp.min(9000); 
    let amount_out_gross = amount_in / BASE_EXCHANGE_RATE;
    let amount_out_net = (amount_out_gross * penalty_factor) / 10000;

    (amount_out_net, slippage_bp)
}

pub fn execute_swap(state: &mut PlayerState, amount_in: i64, source: ResourceId, dest: ResourceId) -> Result<(), String> {
    let balance = state.resources.get(&source).cloned().unwrap_or(0);
    if balance < amount_in {
        return Err("Insufficient funds".to_string());
    }

    let (amount_out, slippage) = quote_swap(amount_in, source.clone(), dest.clone());

    *state.resources.entry(source).or_insert(0) -= amount_in;
    *state.resources.entry(dest).or_insert(0) += amount_out;

    state.lab.slippage_malus = slippage;
    
    Ok(())
}
