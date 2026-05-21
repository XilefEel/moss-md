import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { buildTree } from "../lib/utils";
import { Entry } from "../lib/types";
import * as io from "../lib/io";

const insertIntoTree = (
  entries: Entry[],
  dirPath: string,
  newEntry: Entry,
): Entry[] => {
  return entries.map((e) => {
    if (e.path === dirPath) {
      return { ...e, children: [...(e.children ?? []), newEntry] };
    }
    if (e.isDirectory && dirPath.startsWith(e.path) && e.children) {
      return { ...e, children: insertIntoTree(e.children, dirPath, newEntry) };
    }
    return e;
  });
};

const renameInTree = (
  entries: Entry[],
  oldPath: string,
  newPath: string,
  newName: string,
): Entry[] => {
  return entries.map((e) => {
    if (e.path === oldPath) {
      return { ...e, name: newName, path: newPath };
    }
    if (e.isDirectory && oldPath.startsWith(e.path) && e.children) {
      return {
        ...e,
        children: renameInTree(e.children, oldPath, newPath, newName),
      };
    }
    return e;
  });
};

const removeFromTree = (entries: Entry[], path: string): Entry[] => {
  return entries
    .filter((e) => e.path !== path)
    .map((e) =>
      e.children ? { ...e, children: removeFromTree(e.children, path) } : e,
    );
};

type FileTreeStore = {
  entries: Entry[];
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

  createFile: (dirPath: string, name: string) => Promise<string>;
  createFolder: (dirPath: string, name: string) => Promise<string>;
  renameEntry: (oldPath: string, newName: string) => Promise<string>;
  deleteEntry: (path: string, isDirectory: boolean) => Promise<void>;

  refreshTree: () => void;
};

const useFileTreeStore = create<FileTreeStore>((set, get) => ({
  entries: [],
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
    const filePath = await io.createFile(dirPath, name);

    const newFile: Entry = {
      name: name.endsWith(".md") ? name : `${name}.md`,
      path: filePath,
      isDirectory: false,
      children: [],
    };

    set((state) => ({
      entries: insertIntoTree(state.entries, dirPath, newFile),
    }));

    return filePath;
  },

  createFolder: async (dirPath, name) => {
    const folderPath = await io.createFolder(dirPath, name);

    const newFolder: Entry = {
      name,
      path: folderPath,
      isDirectory: true,
      children: [],
    };

    set((state) => ({
      entries: insertIntoTree(state.entries, dirPath, newFolder),
    }));

    return folderPath;
  },
  renameEntry: async (oldPath, newName) => {
    const newPath = await io.renameEntry(oldPath, newName);

    set((state) => ({
      entries: renameInTree(get().entries, oldPath, newPath, newName),
      currentFilePath:
        state.currentFilePath === oldPath ? newPath : state.currentFilePath,
    }));

    return newPath;
  },

  deleteEntry: async (path, isDirectory) => {
    await io.deleteEntry(path, isDirectory);

    set((state) => ({
      entries: removeFromTree(state.entries, path),
      currentFilePath:
        state.currentFilePath === path ? null : state.currentFilePath,
    }));
  },

  refreshTree: async () => {
    const currentDir = get().currentDir;
    if (!currentDir) return;

    const tree = await buildTree(currentDir);
    set({ entries: tree });
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
