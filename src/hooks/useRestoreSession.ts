import { readTextFile } from "@tauri-apps/plugin-fs";
import { useEffect } from "react";
import { getAncestorPaths } from "../lib/utils";
import {
  getLastDir,
  saveLastFilePath,
  getLastFilePath,
  getIsSidebarOpen,
  getViewMode,
  getFontSize,
} from "../lib/storage";
import { useFileTreeActions } from "../stores/useFileTreeStore";
import { useUIActions } from "../stores/useUIStore";
import { invoke } from "@tauri-apps/api/core";

export function useRestoreSession({
  setContent,
  savedContentRef,
}: {
  setContent: (content: string) => void;
  savedContentRef: React.RefObject<string>;
}) {
  const { setCurrentFilePath, setCurrentDir, setOpenFolders } =
    useFileTreeActions();

  const { setIsSidebarOpen, setMode, setFontSize } = useUIActions();

  useEffect(() => {
    const loadSession = async () => {
      const externalPath = await invoke<string | null>("opened_file");

      let lastDir: string | null = null;
      let lastFilePath: string | null = null;

      if (!externalPath) {
        [lastDir, lastFilePath] = await Promise.all([
          getLastDir(),
          getLastFilePath(),
        ]);
      }
      const [isSidebarOpen, viewMode, fontSize] = await Promise.all([
        getIsSidebarOpen(),
        getViewMode(),
        getFontSize(),
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

      if (fontSize !== null) setFontSize(fontSize);
    };

    loadSession();
  }, []);
}
