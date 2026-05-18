import { readTextFile } from "@tauri-apps/plugin-fs";
import { useEffect } from "react";
import { getAncestorPaths } from "../lib/utils";
import {
  getLastDir,
  getLastFilePath,
  getIsSidebarOpen,
  getViewMode,
} from "../lib/storage";

export function useRestoreSession({
  setCurrentDir,
  setFilePath,
  setContent,
  savedContentRef,
  setOpenFolders,
  setIsSidebarOpen,
  setMode,
}: {
  setCurrentDir: (dir: string) => void;
  setFilePath: (path: string | null) => void;
  setContent: (content: string) => void;
  savedContentRef: React.RefObject<string>;
  setOpenFolders: (folders: Set<string>) => void;
  setIsSidebarOpen: (isOpen: boolean) => void;
  setMode: (mode: "edit" | "view") => void;
}) {
  useEffect(() => {
    const loadSession = async () => {
      const [lastDir, lastFilePath, isSidebarOpen, viewMode] =
        await Promise.all([
          getLastDir(),
          getLastFilePath(),
          getIsSidebarOpen(),
          getViewMode(),
        ]);

      if (lastDir) setCurrentDir(lastDir);

      if (lastFilePath) {
        const text = await readTextFile(lastFilePath);
        const normalized = text.replace(/\r\n/g, "\n");

        setFilePath(lastFilePath);
        setContent(normalized);
        savedContentRef.current = normalized;
      }

      if (lastDir && lastFilePath) {
        const ancestors = await getAncestorPaths(lastFilePath, lastDir);
        setOpenFolders(new Set(ancestors));
      }

      if (isSidebarOpen !== null) setIsSidebarOpen(isSidebarOpen);

      if (viewMode !== null) setMode(viewMode);
    };

    loadSession();
  }, []);
}
