import { useEffect } from "react";
import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";

export function useExternalFileOpen(handleOpenFile: (path: string) => void) {
  useEffect(() => {
    let unlisten: (() => void) | undefined;

    (async () => {
      const initialPath = await invoke<string | null>("opened_file");
      if (initialPath) {
        handleOpenFile(initialPath);
        await invoke("clear_opened_file");
      }

      unlisten = await listen<string>("opened-file", (event) => {
        handleOpenFile(event.payload);
      });
    })();

    return () => unlisten?.();
  }, [handleOpenFile]);
}
