use fuzzy_matcher::skim::SkimMatcherV2;
use fuzzy_matcher::FuzzyMatcher;
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
    pub created_at: Option<u64>,
    pub modified_at: Option<u64>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SearchResult {
    pub path: String,
    pub name: String,
    pub score: i64,
    pub matches: Vec<usize>,
}

fn read_dir(dir: &Path) -> std::io::Result<Vec<Entry>> {
    let mut entries = Vec::new();

    for entry in fs::read_dir(dir)? {
        let entry = match entry {
            Ok(e) => e,
            Err(_) => continue,
        };

        let path = entry.path();

        let name = entry.file_name().to_string_lossy().into_owned();
        let path_str = path.to_string_lossy().into_owned();
        let is_dir = entry.file_type()?.is_dir();

        let metadata = entry.metadata()?;
        let created_at = metadata
            .created()
            .ok()
            .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
            .map(|d| d.as_millis() as u64);
        let modified_at = metadata
            .modified()
            .ok()
            .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
            .map(|d| d.as_millis() as u64);

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
            created_at,
            modified_at,
        });
    }

    entries.sort_by(|a, b| {
        b.is_directory
            .cmp(&a.is_directory)
            .then(a.name.to_lowercase().cmp(&b.name.to_lowercase()))
    });

    Ok(entries)
}

fn fuzzy_search_files(dir_path: &Path, query: &str) -> std::io::Result<Vec<SearchResult>> {
    let matcher = SkimMatcherV2::default();
    let mut results = Vec::new();

    for entry in walkdir::WalkDir::new(dir_path)
        .into_iter()
        .filter_map(|e| e.ok())
        .filter(|e| {
            e.path().is_file() && e.path().extension().and_then(|ext| ext.to_str()) == Some("md")
        })
    {
        let path = entry.path();
        let name = path.file_name().unwrap().to_string_lossy().into_owned();

        if let Some((score, matches)) = matcher.fuzzy_indices(&name, query) {
            results.push(SearchResult {
                path: path.to_string_lossy().into_owned(),
                name,
                score,
                matches,
            });
        }
    }

    results.sort_by(|a, b| b.score.cmp(&a.score));
    Ok(results)
}

#[tauri::command]
pub fn build_tree(dir_path: &str) -> Result<Vec<Entry>, String> {
    read_dir(Path::new(dir_path)).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn fuzzy_search(dir_path: &str, query: &str) -> Result<Vec<SearchResult>, String> {
    fuzzy_search_files(Path::new(dir_path), query).map_err(|e| e.to_string())
}
