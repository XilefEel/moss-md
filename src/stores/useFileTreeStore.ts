import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { Entry } from "../lib/types";
import * as io from "../lib/io";
import { dirname, join } from "@tauri-apps/api/path";
import {
  insertIntoTree,
  renameInTree,
  buildPathSet,
  removeFromTree,
} from "../lib/fileTree";

type FileTreeStore = {
  entries: Entry[];
  pathSet: Set<string>;
  currentDir: string | null;
  currentFilePath: string | null;
  openFolders: Set<string>;
  newEntry: { dirPath: string; type: "file" | "folder" } | null;

  setEntries: (entries: Entry[]) => void;
  setCurrentDir: (dir: string | null) => void;
  setCurrentFilePath: (path: string | null) => void;
  setOpenFolders: (folders: Set<string>) => void;
  setNewEntry: (
    entry: { dirPath: string; type: "file" | "folder" } | null,
  ) => void;

  createFile: (dirPath: string, name: string) => Promise<string | null>;
  createFolder: (dirPath: string, name: string) => Promise<string | null>;
  renameEntry: (oldPath: string, newName: string) => Promise<string>;
  deleteEntry: (path: string, isDirectory: boolean) => Promise<void>;

  refreshTree: () => void;
};

const useFileTreeStore = create<FileTreeStore>((set, get) => ({
  entries: [],
  pathSet: new Set(),

  currentFilePath: null,
  currentDir: null,

  openFolders: new Set(),
  newEntry: null,

  setEntries: (entries) => set({ entries }),
  setCurrentFilePath: (path) => set({ currentFilePath: path }),
  setCurrentDir: (dir) => set({ currentDir: dir }),
  setOpenFolders: (folders) => set({ openFolders: folders }),
  setNewEntry: (entry) => set({ newEntry: entry }),

  createFile: async (dirPath, name) => {
    const fileName = name.endsWith(".md") ? name : `${name}.md`;
    const filePath = await join(dirPath, fileName);

    if (get().pathSet.has(filePath)) return null;

    const success = await io.createFile(filePath);
    if (!success) return null;

    const newFile: Entry = {
      name: fileName,
      path: filePath,
      isDirectory: false,
      children: [],
    };

    set((state) => {
      const newPathSet = new Set(state.pathSet);
      newPathSet.add(filePath);

      return {
        entries: insertIntoTree(
          state.entries,
          state.currentDir!,
          dirPath,
          newFile,
        ),
        pathSet: newPathSet,
        currentFilePath: filePath,
      };
    });

    return filePath;
  },

  createFolder: async (dirPath, name) => {
    const folderPath = await join(dirPath, name);

    if (get().pathSet.has(folderPath)) return null;

    const success = await io.createFolder(folderPath);
    if (!success) return null;

    const newFolder: Entry = {
      name,
      path: folderPath,
      isDirectory: true,
      children: [],
    };

    set((state) => {
      const newPathSet = new Set(state.pathSet);
      newPathSet.add(folderPath);

      return {
        entries: insertIntoTree(
          state.entries,
          state.currentDir!,
          dirPath,
          newFolder,
        ),
        pathSet: newPathSet,
      };
    });

    return folderPath;
  },

  renameEntry: async (oldPath, newName) => {
    const parent = await dirname(oldPath);
    const newPath = await join(parent, newName);

    if (get().pathSet.has(newPath)) return oldPath;

    const success = await io.renameEntry(oldPath, newPath);
    if (!success) return oldPath;

    set((state) => {
      const updatedEntries = renameInTree(
        state.entries,
        oldPath,
        newPath,
        newName,
      );
      return {
        entries: updatedEntries,
        pathSet: buildPathSet(updatedEntries),
      };
    });

    return newPath;
  },

  deleteEntry: async (path, isDirectory) => {
    await io.deleteEntry(path, isDirectory);

    set((state) => {
      const newEntries = removeFromTree(state.entries, path);
      if (!isDirectory) {
        const newPathSet = new Set(state.pathSet);
        newPathSet.delete(path);

        return {
          entries: newEntries,
          pathSet: newPathSet,
        };
      }
      return {
        entries: newEntries,
        pathSet: buildPathSet(newEntries),
      };
    });
  },

  refreshTree: async () => {
    const currentDir = get().currentDir;
    if (!currentDir) return;

    const tree = await io.buildTree(currentDir);
    set({ entries: tree, pathSet: buildPathSet(tree) });
  },
}));

export const useEntries = () => useFileTreeStore((state) => state.entries);

export const useCurrentFilePath = () =>
  useFileTreeStore((state) => state.currentFilePath);

export const useCurrentDir = () =>
  useFileTreeStore((state) => state.currentDir);

export const useOpenFolders = () =>
  useFileTreeStore((state) => state.openFolders);

export const useNewEntry = () => useFileTreeStore((state) => state.newEntry);

export const useFileTreeActions = () =>
  useFileTreeStore(
    useShallow((state) => ({
      setEntries: state.setEntries,
      setCurrentFilePath: state.setCurrentFilePath,
      setCurrentDir: state.setCurrentDir,
      setOpenFolders: state.setOpenFolders,
      setNewEntry: state.setNewEntry,

      createFile: state.createFile,
      createFolder: state.createFolder,
      renameEntry: state.renameEntry,
      deleteEntry: state.deleteEntry,

      refreshTree: state.refreshTree,
    })),
  );
