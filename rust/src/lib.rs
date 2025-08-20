// use claw_ql::builder_pattern::BuilderPattern;
// use claw_ql::macros::Collection;
// use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

// // #[allow]
// #[derive(Collection, Clone, Debug, PartialEq, Serialize, Deserialize)]
// pub struct Posts {
//     pub title: String,
//     pub created_at: String,
//     pub body: String,
//     pub tags: Vec<String>,
// }

/// Divides `lhs` by `rhs`.
///
/// ## Errors
/// Propagates errors if `rhs` is 0.
#[wasm_bindgen]
pub fn div(lhs: i32, rhs: i32) -> i32 {
    // `?` is here to simply coerce `CalcError` into `JsError` via `Display`
    lhs + rhs
}

// pub fn list(rhs: i32) -> i32 {
//     let mut schema = BuilderPattern::default()
//         // .build_component(JsonClient::builder(pool.clone()))
//         .start_mut();
//
//     2
// }
