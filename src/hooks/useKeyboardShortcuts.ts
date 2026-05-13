import { useEffect } from "react";

export function useKeyboardShortcuts({
  handleSave,
  handleOpen,
  handleToggleMode,
  handleToggleDark,
  handleToggleSidebar,
}: {
  handleSave: () => void;
  handleOpen: () => void;
  handleToggleMode: () => void;
  handleToggleDark: () => void;
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
            handleToggleDark();
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
    handleToggleDark,
    handleToggleSidebar,
  ]);
}
