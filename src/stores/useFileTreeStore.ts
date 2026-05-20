import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { buildTree } from "../lib/utils";
import { Entry } from "../lib/types";

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
      refreshTree: state.refreshTree,
    })),
  );
