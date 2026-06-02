import { invoke } from "@tauri-apps/api/core";
import { create, mkdir, remove, rename } from "@tauri-apps/plugin-fs";
import { Entry, SearchResult } from "./types";

export const createFile = async (filePath: string): Promise<boolean> => {
  try {
    await create(filePath);
    return true;
  } catch (error) {
    console.error("Error creating file:", error);
    return false;
  }
};

export const createFolder = async (folderPath: string): Promise<boolean> => {
  try {
    await mkdir(folderPath);
    return true;
  } catch (error) {
    console.error("Error creating folder:", error);
    return false;
  }
};

export const renameEntry = async (
  oldPath: string,
  newPath: string,
): Promise<boolean> => {
  try {
    await rename(oldPath, newPath);
    return true;
  } catch (error) {
    console.error("Error renaming entry:", error);
    return false;
  }
};
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
