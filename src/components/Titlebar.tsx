import { getCurrentWindow } from "@tauri-apps/api/window";
import { Eye, Pencil } from "lucide-react";

export default function Titlebar({
  mode,
  onOpen,
  onSave,
  onToggle,
}: {
  mode: "view" | "edit";
  onOpen: () => void;
  onSave: () => void;
  onToggle: () => void;
}) {
  const appWindow = getCurrentWindow();

  return (
    <div
      data-tauri-drag-region
      className="fixed top-0 right-0 left-0 z-99 flex h-8 flex-row items-center gap-4 bg-white/30 px-4 backdrop-blur-sm select-none"
    >
      <div className="flex flex-row items-center gap-2.5">
        <button
          onClick={() => appWindow.close()}
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
          onClick={onOpen}
          className="text-sm text-zinc-400 transition-colors hover:text-zinc-600"
        >
          Open
        </button>

        <button
          onClick={onSave}
          className="text-sm text-zinc-400 transition-colors hover:text-zinc-600"
        >
          Save
        </button>
      </div>

      <button
        onClick={onToggle}
        className="ml-auto text-sm text-zinc-400 transition-colors hover:text-zinc-600"
      >
        {mode === "view" ? (
          <Pencil className="size-4 shrink-0" />
        ) : (
          <Eye className="size-4 shrink-0" />
        )}
      </button>
    </div>
  );
}
