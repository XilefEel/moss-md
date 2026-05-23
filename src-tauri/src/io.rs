use serde::Serialize;
use std::fs;
use std::path::Path;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Entry {
    pub name: String,
    pub path: String,
    pub is_directory: bool,
    pub children: Option<Vec<Entry>>,
}

#[tauri::command]
pub fn build_tree(dir_path: &str) -> Result<Vec<Entry>, String> {
    read_dir(Path::new(dir_path)).map_err(|e| e.to_string())
}

fn read_dir(dir: &Path) -> std::io::Result<Vec<Entry>> {
    let mut entries = Vec::new();

    for entry in fs::read_dir(dir)? {
        let entry = entry?;
        let path = entry.path();

        let name = entry.file_name().to_string_lossy().into_owned();
        let path_str = path.to_string_lossy().into_owned();
        let is_dir = path.is_dir();

        if name.starts_with('.') {
            continue;
        }

        if !is_dir && path.extension().and_then(|e| e.to_str()) != Some("md") {
            continue;
        }

        entries.push(Entry {
            name,
            path: path_str,
            is_directory: is_dir,
            children: if is_dir { Some(read_dir(&path)?) } else { None },
        });
    }

    entries.sort_by(|a, b| {
        b.is_directory
            .cmp(&a.is_directory)
            .then(a.name.to_lowercase().cmp(&b.name.to_lowercase()))
    });

    Ok(entries)
}
