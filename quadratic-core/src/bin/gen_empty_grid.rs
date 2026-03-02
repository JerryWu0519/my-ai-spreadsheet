use quadratic_core::grid::file::export;
use std::fs;

fn main() {
    let grid = quadratic_core::grid::Grid::new();
    let bytes = export(grid).expect("export failed");
    let out = concat!(env!("CARGO_MANIFEST_DIR"), "/../quadratic-client/public/empty.grid");
    fs::write(out, &bytes).expect("write failed");
    println!("Wrote {} bytes to {}", bytes.len(), out);
}
