import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { Entry } from "../lib/types";
import * as io from "../lib/io";

const sortEntries = (entries: Entry[]): Entry[] => {
  return entries.toSorted((a, b) => {
    if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1;
    return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
  });
};

const insertIntoTree = (
  entries: Entry[],
  rootDir: string,
  dirPath: string,
  newEntry: Entry,
): Entry[] => {
  if (dirPath === rootDir) {
    return sortEntries([...entries, newEntry]);
  }

  return entries.map((e) => {
    if (e.path === dirPath) {
      return { ...e, children: sortEntries([...(e.children ?? []), newEntry]) };
    }
    if (e.isDirectory && dirPath.startsWith(e.path) && e.children) {
      return {
        ...e,
        children: insertIntoTree(e.children, rootDir, dirPath, newEntry),
      };
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
        children: sortEntries(
          renameInTree(e.children, oldPath, newPath, newName),
        ),
      };
    }
    return e;
  });
};

const removeFromTree = (entries: Entry[], path: string): Entry[] => {
  const result: Entry[] = [];

  for (const e of entries) {
    if (e.path === path) continue;

    result.push(
      e.isDirectory && path.startsWith(e.path) && e.children
        ? { ...e, children: removeFromTree(e.children, path) }
        : e,
    );
  }

  return result;
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
    const fileName = name.endsWith(".md") ? name : `${name}.md`;

    const filePath = await io.createFile(dirPath, fileName);

    const newFile: Entry = {
      name: fileName,
      path: filePath,
      isDirectory: false,
      children: [],
    };

    set((state) => ({
      entries: insertIntoTree(
        state.entries,
        state.currentDir!,
        dirPath,
        newFile,
      ),
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
      entries: insertIntoTree(
        state.entries,
        state.currentDir!,
        dirPath,
        newFolder,
      ),
    }));

    return folderPath;
  },

  renameEntry: async (oldPath, newName) => {
    const newPath = await io.renameEntry(oldPath, newName);

    set((state) => ({
      entries: sortEntries(
        renameInTree(state.entries, oldPath, newPath, newName),
      ),
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

    const tree = await io.buildTree(currentDir);
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
