// Точка входа для десктопа. На мобилках используется app_lib::run() (lib.rs).
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    app_lib::run()
}
