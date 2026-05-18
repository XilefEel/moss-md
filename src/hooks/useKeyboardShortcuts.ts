import { useEffect } from "react";

type BlockedShortcut = {
  key: string;
  needsShift: boolean;
};

const BLOCKED_SHORTCUTS: BlockedShortcut[] = [
  { key: "p", needsShift: false },
  { key: "f", needsShift: false },
  { key: "g", needsShift: false },
  { key: "j", needsShift: false },
  { key: "p", needsShift: true },
  { key: "g", needsShift: true },
];

export function useKeyboardShortcuts({
  handleSave,
  handleOpen,
  toggleTheme,
  handleToggleMode,
  handleToggleSidebar,
}: {
  handleSave: () => void;
  handleOpen: () => void;
  toggleTheme: () => void;
  handleToggleMode: () => void;
  handleToggleSidebar: () => void;
}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;

      if (e.ctrlKey || e.metaKey) {
        if (
          BLOCKED_SHORTCUTS.some(
            (shortcut) =>
              shortcut.key === e.key.toLowerCase() &&
              shortcut.needsShift === e.shiftKey,
          )
        ) {
          e.preventDefault();
          return;
        }

        switch (e.key) {
          case "s":
            e.preventDefault();
            handleSave();
            break;
          case "o":
            e.preventDefault();
            handleOpen();
            break;
          case "e":
            e.preventDefault();
            handleToggleMode();
            break;
          case "d":
            e.preventDefault();
            toggleTheme();
            break;
          case "b":
            e.preventDefault();
            handleToggleSidebar();
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    handleSave,
    handleOpen,
    handleToggleMode,
    toggleTheme,
    handleToggleSidebar,
  ]);
}
