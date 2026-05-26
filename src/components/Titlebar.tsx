import { getCurrentWindow } from "@tauri-apps/api/window";
import {
  FolderOpen,
  Moon,
  PanelLeftOpen,
  PanelRightOpen,
  Sun,
} from "lucide-react";
import { confirm } from "@tauri-apps/plugin-dialog";

const appWindow = getCurrentWindow();

export default function Titlebar({
  mode,
  isSidebarOpen,
  isDark,
  isDirty,
  onOpen,
  onToggleMode,
  onToggleSidebar,
  onToggleTheme,
}: {
  mode: "view" | "edit";
  isSidebarOpen: boolean;
  isDark: boolean;
  isDirty: boolean;
  onOpen: () => void;
  onSave: () => void;
  onToggleMode: () => void;
  onToggleSidebar: () => void;
  onToggleTheme: () => void;
}) {
  const handleClose = async () => {
    if (!isDirty) {
      appWindow.close();
      return;
    }

    const confirmed = await confirm(
      "You have unsaved changes. Are you sure you want to close?",
      { title: "Unsaved Changes", kind: "warning" },
    );

    if (confirmed) {
      appWindow.close();
    }
  };

  return (
    <div
      data-tauri-drag-region
      className="fixed top-0 right-0 left-0 z-99 flex h-8 flex-row items-center gap-4 bg-white px-4 select-none dark:bg-zinc-900"
    >
      <div className="flex flex-row items-center gap-2.5">
        <button
          onClick={handleClose}
          className="size-3.5 rounded-full bg-red-400 transition-colors hover:bg-red-500"
        />
        <button
          onClick={() => appWindow.minimize()}
          className="size-3.5 rounded-full bg-yellow-400 transition-colors hover:bg-yellow-500"
        />
        <button
          onClick={() => appWindow.toggleMaximize()}
          className="size-3.5 rounded-full bg-green-400 transition-colors hover:bg-green-500"
        />
      </div>

      <div className="flex items-center gap-2.5">
        <button
          onClick={onToggleSidebar}
          className="ml-auto text-sm text-zinc-400 transition-colors hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
        >
          {isSidebarOpen ? (
            <PanelRightOpen className="size-4 shrink-0" />
          ) : (
            <PanelLeftOpen className="size-4 shrink-0" />
          )}
        </button>
        <button
          onClick={onOpen}
          className="text-sm text-zinc-400 transition-colors hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
        >
          <FolderOpen className="size-4 shrink-0" />
        </button>
      </div>

      {isDirty && (
        <div className="size-1.5 rounded-full bg-green-400 dark:bg-green-500" />
      )}

      <button
        onClick={onToggleTheme}
        className="ml-auto text-sm text-zinc-400 transition-colors hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
      >
        {isDark ? (
          <Sun className="size-4 shrink-0" />
        ) : (
          <Moon className="size-4 shrink-0" />
        )}
      </button>

      <button
        onClick={onToggleMode}
        className="text-sm text-zinc-400 transition-colors hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
      >
        {mode === "view" ? (
          <PanelRightOpen className="size-4 shrink-0" />
        ) : (
          <PanelLeftOpen className="size-4 shrink-0" />
        )}
      </button>
    </div>
  );
}
