import { useEffect, useRef } from "react";
import { watchImmediate } from "@tauri-apps/plugin-fs";

export function useDirWatcher(
  dirPath: string | null,
  onChange: () => void,
  delay: number = 300,
) {
  const unwatchRef = useRef<(() => void) | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;

    unwatchRef.current?.();
    unwatchRef.current = null;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (!dirPath) return;

    watchImmediate(
      dirPath,
      () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        timeoutRef.current = setTimeout(onChange, delay);
      },
      { recursive: true },
    )
      .then((unwatch) => {
        if (cancelled) unwatch();
        else unwatchRef.current = unwatch;
      })
      .catch((err) => {
        console.error("Failed to watch directory:", err);
      });

    return () => {
      cancelled = true;
      unwatchRef.current?.();
      unwatchRef.current = null;

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [dirPath, onChange, delay]);
}
