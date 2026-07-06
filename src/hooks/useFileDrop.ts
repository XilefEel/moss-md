import { useEffect, useState } from "react";
import { listen } from "@tauri-apps/api/event";

export function useFileDrop(onFileDropped: (path: string) => void) {
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const unlistenDrop = listen("tauri://drag-drop", async (event: any) => {
      setIsDragging(false);

      const paths = event.payload.paths as string[];
      const mdFile = paths.find((p: string) => p.endsWith(".md"));
      if (!mdFile) return;

      onFileDropped(mdFile);
    });

    const unlistenEnter = listen("tauri://drag-enter", () =>
      setIsDragging(true),
    );
    const unlistenLeave = listen("tauri://drag-leave", () =>
      setIsDragging(false),
    );

    return () => {
      unlistenDrop.then((fn) => fn());
      unlistenEnter.then((fn) => fn());
      unlistenLeave.then((fn) => fn());
    };
  }, [onFileDropped]);

  return isDragging;
}
