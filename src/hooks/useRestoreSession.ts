import { readTextFile } from "@tauri-apps/plugin-fs";
import { useEffect } from "react";
import { getAncestorPaths } from "../lib/utils";
import {
  getLastDir,
  saveLastFilePath,
  getLastFilePath,
  getIsSidebarOpen,
  getViewMode,
} from "../lib/storage";
import { useFileTreeActions } from "../stores/useFileTreeStore";

export function useRestoreSession({
  setContent,
  savedContentRef,
  setIsSidebarOpen,
  setMode,
}: {
  setContent: (content: string) => void;
  savedContentRef: React.RefObject<string>;
  setIsSidebarOpen: (isOpen: boolean) => void;
  setMode: (mode: "edit" | "view") => void;
}) {
  const { setCurrentFilePath, setCurrentDir, setOpenFolders } =
    useFileTreeActions();

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
        try {
          const text = await readTextFile(lastFilePath);
          const normalized = text.replace(/\r\n/g, "\n");

          setCurrentFilePath(lastFilePath);
          setContent(normalized);
          savedContentRef.current = normalized;
        } catch (error) {
          saveLastFilePath("");
          setCurrentFilePath(null);
          setContent("");
          savedContentRef.current = "";
        }
      }

      if (lastDir && lastFilePath) {
        try {
          const ancestors = await getAncestorPaths(lastFilePath, lastDir);
          setOpenFolders(new Set(ancestors));
        } catch (error) {
          setOpenFolders(new Set());
        }
      }

      if (isSidebarOpen !== null) setIsSidebarOpen(isSidebarOpen);

      if (viewMode !== null) setMode(viewMode);
    };

    loadSession();
  }, []);
}
