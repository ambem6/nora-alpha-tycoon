use napi::Error;

pub fn map_anyhow_to_napi(err: String) -> Error {
    Error::from_reason(format!("Core Engine Error: {}", err))
}

pub fn execute_guarded<F, R>(f: F) -> Result<R, Error> 
where
    F: FnOnce() -> Result<R, String> + std::panic::UnwindSafe,
{
    let result = std::panic::catch_unwind(f);
    
    match result {
        Ok(inner_result) => match inner_result {
            Ok(val) => Ok(val),
            Err(e) => Err(map_anyhow_to_napi(e)),
        },
        Err(_) => Err(Error::from_reason("CRITICAL: Rust Panic caught in bridge.".to_string())),
    }
}
