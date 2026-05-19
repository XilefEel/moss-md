import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { buildTree } from "../lib/utils";
import { Entry } from "../lib/types";

type FileTreeStore = {
  entries: Entry[];
  currentDir: string | null;
  currentFilePath: string | null;
  openFolders: Set<string>;

  setEntries: (entries: Entry[]) => void;
  setCurrentDir: (dir: string | null) => void;
  setCurrentFilePath: (path: string | null) => void;
  setOpenFolders: (folders: Set<string>) => void;

  refreshTree: () => void;
};

const useFileTreeStore = create<FileTreeStore>((set, get) => ({
  entries: [],
  currentFilePath: null,
  currentDir: null,
  openFolders: new Set(),

  setEntries: (entries) => set({ entries }),
  setCurrentFilePath: (path) => set({ currentFilePath: path }),
  setCurrentDir: (dir) => set({ currentDir: dir }),
  setOpenFolders: (folders) => set({ openFolders: folders }),

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

export const useFileTreeActions = () =>
  useFileTreeStore(
    useShallow((state) => ({
      setEntries: state.setEntries,
      setCurrentFilePath: state.setCurrentFilePath,
      setCurrentDir: state.setCurrentDir,
      setOpenFolders: state.setOpenFolders,
      refreshTree: state.refreshTree,
    })),
  );
