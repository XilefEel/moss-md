import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import {
  saveIsSidebarOpen,
  saveIsRightbarOpen,
  saveViewMode,
  saveFontSize,
} from "../lib/storage";
import { FontSize } from "../lib/types";

type Mode = "view" | "edit" | null;

type UIStore = {
  mode: Mode;
  isSidebarOpen: boolean | null;
  isRightbarOpen: boolean | null;
  isDirty: boolean;
  fontSize: FontSize;

  setMode: (mode: Mode) => void;
  setIsSidebarOpen: (open: boolean) => void;
  setIsRightbarOpen: (open: boolean) => void;
  setIsDirty: (isDirty: boolean) => void;
  setFontSize: (size: FontSize) => void;

  toggleMode: () => void;
  toggleSidebar: () => void;
  toggleRightbar: () => void;
};

const useUIStore = create<UIStore>((set, get) => ({
  mode: null,
  isSidebarOpen: null,
  isRightbarOpen: null,
  isDirty: false,
  fontSize: "md",

  setMode: (mode) => set({ mode }),

  setIsSidebarOpen: (open) => set({ isSidebarOpen: open }),

  setIsRightbarOpen: (open) => set({ isRightbarOpen: open }),

  setIsDirty: (isDirty) => set({ isDirty }),

  toggleMode: () => {
    const next = get().mode === "view" ? "edit" : "view";
    set({ mode: next });
    saveViewMode(next);
  },

  toggleSidebar: () => {
    const next = !get().isSidebarOpen;
    set({ isSidebarOpen: next });
    saveIsSidebarOpen(next);
  },

  toggleRightbar: () => {
    const next = !get().isRightbarOpen;
    set({ isRightbarOpen: next });
    saveIsRightbarOpen(next);
  },

  setFontSize: (size) => {
    set({ fontSize: size });
    saveFontSize(size);
  },
}));

export const useMode = () => useUIStore((state) => state.mode);

export const useIsSidebarOpen = () =>
  useUIStore((state) => state.isSidebarOpen);

export const useIsRightbarOpen = () =>
  useUIStore((state) => state.isRightbarOpen);

export const useIsDirty = () => useUIStore((state) => state.isDirty);

export const useFontSize = () => useUIStore((state) => state.fontSize);

export const useUIActions = () =>
  useUIStore(
    useShallow((state) => ({
      setMode: state.setMode,
      setIsSidebarOpen: state.setIsSidebarOpen,
      setIsRightbarOpen: state.setIsRightbarOpen,
      setIsDirty: state.setIsDirty,
      setFontSize: state.setFontSize,

      toggleMode: state.toggleMode,
      toggleSidebar: state.toggleSidebar,
      toggleRightbar: state.toggleRightbar,
    })),
  );

export default useUIStore;
