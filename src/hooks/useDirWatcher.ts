import { useEffect, useRef } from "react";
import { watchImmediate } from "@tauri-apps/plugin-fs";

export function useDirWatcher(dirPath: string | null, onChange: () => void) {
  const unwatchRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    let cancelled = false;

    unwatchRef.current?.();
    unwatchRef.current = null;

    if (!dirPath) return;

    watchImmediate(dirPath, () => onChange(), { recursive: true }).then(
      (unwatch) => {
        if (cancelled) {
          unwatch();
        } else {
          unwatchRef.current = unwatch;
        }
      },
    );

    return () => {
      cancelled = true;
      unwatchRef.current?.();
      unwatchRef.current = null;
    };
  }, [dirPath, onChange]);
}
