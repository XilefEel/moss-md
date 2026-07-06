import { getCurrentWindow } from "@tauri-apps/api/window";
import {
  Eye,
  FolderOpen,
  Minus,
  Moon,
  PanelLeftOpen,
  PanelRightOpen,
  Pencil,
  Plus,
  Search,
  Sun,
  X,
} from "lucide-react";
import { confirm } from "@tauri-apps/plugin-dialog";

const appWindow = getCurrentWindow();

export default function Titlebar({
  mode,
  isSidebarOpen,
  isRightbarOpen,
  isDark,
  isDirty,
  onOpen,
  onToggleMode,
  onToggleSidebar,
  onToggleRightbar,
  onToggleTheme,
  onToggleSearch,
}: {
  mode: "view" | "edit";
  isSidebarOpen: boolean;
  isRightbarOpen: boolean;
  isDark: boolean;
  isDirty: boolean;
  onOpen: () => void;
  onSave: () => void;
  onToggleMode: () => void;
  onToggleSidebar: () => void;
  onToggleTheme: () => void;
  onToggleRightbar: () => void;
  onToggleSearch: () => void;
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
      className="fixed top-0 right-0 left-0 z-50 flex h-8 flex-row items-center gap-5 bg-white px-4 select-none dark:bg-zinc-900"
    >
      <div className="group flex items-center gap-2 select-none">
        <button
          onClick={handleClose}
          className="relative flex size-3.5 items-center justify-center rounded-full border border-black/10 bg-[#fc5753] transition-all hover:scale-110 active:scale-95"
        >
          <X
            strokeWidth={3}
            className="size-2 text-black/60 opacity-0 transition-opacity group-hover:opacity-100"
          />
        </button>

        <button
          onClick={() => appWindow.minimize()}
          className="relative flex size-3.5 items-center justify-center rounded-full border border-black/10 bg-[#fdbc40] transition-all hover:scale-110 active:scale-95"
        >
          <Minus
            strokeWidth={3}
            className="size-2 text-black/60 opacity-0 transition-opacity group-hover:opacity-100"
          />
        </button>

        <button
          onClick={() => appWindow.toggleMaximize()}
          className="relative flex size-3.5 items-center justify-center rounded-full border border-black/10 bg-[#36c84b] transition-all hover:scale-110 active:scale-95"
        >
          <Plus
            strokeWidth={3}
            className="size-2 text-black/60 opacity-0 transition-opacity group-hover:opacity-100"
          />
        </button>
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

        <button
          onClick={onToggleSearch}
          className="text-sm text-zinc-400 transition-colors hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
        >
          <Search className="size-4 shrink-0" />
        </button>
      </div>

      {isDirty && (
        <div className="size-1.5 rounded-full bg-green-400 dark:bg-green-500" />
      )}

      <div className="ml-auto flex items-center gap-2.5">
        <button
          onClick={onToggleTheme}
          className="text-sm text-zinc-400 transition-colors hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
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
            <Pencil className="size-4 shrink-0" />
          ) : (
            <Eye className="size-4 shrink-0" />
          )}
        </button>

        <button
          onClick={onToggleRightbar}
          className="text-sm text-zinc-400 transition-colors hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
        >
          {isRightbarOpen ? (
            <PanelLeftOpen className="size-4 shrink-0" />
          ) : (
            <PanelRightOpen className="size-4 shrink-0" />
          )}
        </button>
      </div>
    </div>
  );
}
