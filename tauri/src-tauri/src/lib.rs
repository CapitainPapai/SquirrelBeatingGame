//! Squirrel Beating Game — нативная оболочка Tauri v2.
//!
//! Игра целиком остаётся веб-кодом (HTML/CSS/JS + Web Audio), а здесь только:
//!   • окно и его параметры (tauri.conf.json),
//!   • долговременное хранение прогресса в файле приложения,
//!   • точки входа для десктопа и мобильных платформ.

use std::fs::{self, File};
use std::io::Write;
use std::path::PathBuf;
use tauri::Manager;

/// Максимальный размер сейва — защита от случайной записи чего-то огромного.
const MAX_SAVE_BYTES: usize = 2 * 1024 * 1024;

fn save_path(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    let dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("не удалось получить папку данных: {e}"))?;
    fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    Ok(dir.join("save.json"))
}

/// Атомарная запись: сначала временный файл, затем rename.
#[tauri::command]
fn save_game(app: tauri::AppHandle, data: String) -> Result<(), String> {
    if data.len() > MAX_SAVE_BYTES {
        return Err("сейв слишком большой".into());
    }
    if !data.trim_start().starts_with('{') {
        return Err("сейв должен быть JSON-объектом".into());
    }
    let path = save_path(&app)?;
    let tmp = path.with_extension("json.tmp");
    {
        let mut file = File::create(&tmp).map_err(|e| e.to_string())?;
        file.write_all(data.as_bytes()).map_err(|e| e.to_string())?;
        file.sync_all().map_err(|e| e.to_string())?;
    }
    fs::rename(&tmp, &path).map_err(|e| e.to_string())?;
    Ok(())
}

/// Чтение сейва. None — файла ещё нет (первый запуск).
#[tauri::command]
fn load_game(app: tauri::AppHandle) -> Result<Option<String>, String> {
    let path = save_path(&app)?;
    match fs::read_to_string(&path) {
        Ok(text) if text.len() > 2 => Ok(Some(text)),
        Ok(_) => Ok(None),
        Err(err) if err.kind() == std::io::ErrorKind::NotFound => Ok(None),
        Err(err) => Err(err.to_string()),
    }
}

/// Удаление сейва (кнопка «Сбросить прогресс»).
#[tauri::command]
fn delete_game(app: tauri::AppHandle) -> Result<(), String> {
    let path = save_path(&app)?;
    match fs::remove_file(&path) {
        Ok(()) => Ok(()),
        Err(err) if err.kind() == std::io::ErrorKind::NotFound => Ok(()),
        Err(err) => Err(err.to_string()),
    }
}

/// Путь к файлу сейва — показываем в настройках/логах.
#[tauri::command]
fn save_location(app: tauri::AppHandle) -> Result<String, String> {
    Ok(save_path(&app)?.to_string_lossy().to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            save_game,
            load_game,
            delete_game,
            save_location
        ])
        .setup(|app| {
            // Заголовок окна и минимальная ширина уже заданы в tauri.conf.json.
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.set_title("Squirrel Beating Game");
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("ошибка при запуске приложения");
}
