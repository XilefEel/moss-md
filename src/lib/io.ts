import { invoke } from "@tauri-apps/api/core";
import { dirname, join } from "@tauri-apps/api/path";
import { create, mkdir, remove, rename } from "@tauri-apps/plugin-fs";
import { Entry, SearchResult } from "./types";

export const createFile = async (
  dirPath: string,
  name: string,
): Promise<string> => {
  const fileName = name.endsWith(".md") ? name : `${name}.md`;
  const filePath = await join(dirPath, fileName);

  await create(filePath);
  return filePath;
};

export const createFolder = async (
  dirPath: string,
  name: string,
): Promise<string> => {
  const newDirPath = await join(dirPath, name);

  await mkdir(newDirPath);
  return newDirPath;
};

export async function renameEntry(
  oldPath: string,
  newName: string,
): Promise<string> {
  const parent = await dirname(oldPath);
  const newPath = await join(parent, newName);

  await rename(oldPath, newPath);
  return newPath;
}

export async function deleteEntry(
  path: string,
  isDirectory: boolean,
): Promise<void> {
  await remove(path, { recursive: isDirectory });
}

export async function buildTree(dirPath: string) {
  return await invoke<Entry[]>("build_tree", { dirPath });
}

export async function fuzzySearch(dirPath: string, query: string) {
  return await invoke<SearchResult[]>("fuzzy_search", { dirPath, query });
}
