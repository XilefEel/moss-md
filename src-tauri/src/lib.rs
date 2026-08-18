mod io;
use io::{build_tree, fuzzy_search};
use std::sync::Mutex;
use tauri::{Emitter, Manager};

struct OpenedFile(Mutex<Option<String>>);

fn extract_md_path(args: &[String]) -> Option<String> {
    args.iter()
        .skip(1)
        .find(|a| a.ends_with(".md") || a.ends_with(".markdown"))
        .cloned()
}

#[tauri::command]
fn opened_file(app: tauri::AppHandle) -> Option<String> {
    app.state::<OpenedFile>().0.lock().unwrap().clone()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
#[allow(unused_variables)]
pub fn run() {
    let initial_path = extract_md_path(&std::env::args().collect::<Vec<_>>());

    tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(|app, args, _cwd| {
            if let Some(path) = extract_md_path(&args) {
                app.state::<OpenedFile>()
                    .0
                    .lock()
                    .unwrap()
                    .replace(path.clone());
                app.emit("opened-file", path).ok();
            }
            if let Some(w) = app.get_webview_window("main") {
                let _ = w.set_focus();
            }
        }))
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .manage(OpenedFile(Mutex::new(initial_path)))
        .invoke_handler(tauri::generate_handler![
            build_tree,
            fuzzy_search,
            opened_file
        ])
        .build(tauri::generate_context!())
        .expect("error while building tauri application")
        .run(|app, event| {
            #[cfg(target_os = "macos")]
            if let tauri::RunEvent::Opened { urls } = event {
                if let Some(url) = urls.first() {
                    if let Ok(path) = url.to_file_path() {
                        let path_str = path.to_string_lossy().to_string();
                        app.state::<OpenedFile>()
                            .0
                            .lock()
                            .unwrap()
                            .replace(path_str.clone());
                        app.emit("opened-file", path_str).ok();
                    }
                }
            }
        });
}
