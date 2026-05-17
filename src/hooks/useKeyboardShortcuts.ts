import { useEffect } from "react";

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
      if (e.ctrlKey || e.metaKey) {
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
