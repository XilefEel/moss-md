import { invoke } from "@tauri-apps/api/core";
import { dirname, join } from "@tauri-apps/api/path";
import { create, mkdir, remove, rename } from "@tauri-apps/plugin-fs";
import { Entry, SearchResult } from "./types";

export const createFile = async (
  dirPath: string,
  name: string,
): Promise<string | null> => {
  try {
    const fileName = name.endsWith(".md") ? name : `${name}.md`;
    const filePath = await join(dirPath, fileName);
    await create(filePath);
    return filePath;
  } catch (error) {
    console.error("Error creating file:", error);
    return null;
  }
};

export const createFolder = async (
  dirPath: string,
  name: string,
): Promise<string | null> => {
  try {
    const folderPath = await join(dirPath, name);
    await mkdir(folderPath);
    return folderPath;
  } catch (error) {
    console.error("Error creating folder:", error);
    return null;
  }
};

export async function renameEntry(
  oldPath: string,
  newName: string,
): Promise<string> {
  try {
    const parent = await dirname(oldPath);
    const newPath = await join(parent, newName);
    await rename(oldPath, newPath);
    return newPath;
  } catch (error) {
    console.error("Error renaming entry:", error);
    return oldPath;
  }
}

export async function deleteEntry(
  path: string,
  isDirectory: boolean,
): Promise<void> {
  try {
    await remove(path, { recursive: isDirectory });
  } catch (error) {
    console.error("Error deleting entry:", error);
  }
}

export async function buildTree(dirPath: string) {
  return await invoke<Entry[]>("build_tree", { dirPath });
}

export async function fuzzySearch(dirPath: string, query: string) {
  return await invoke<SearchResult[]>("fuzzy_search", { dirPath, query });
}
