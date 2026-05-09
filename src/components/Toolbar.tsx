export default function Toolbar({
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
  return (
    <div className="flex flex-row items-center gap-2 border-b border-zinc-200 px-4 py-2 dark:border-zinc-700">
      <button
        onClick={onOpen}
        className="rounded px-3 py-1 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
      >
        Open
      </button>

      <button
        onClick={onSave}
        className="rounded px-3 py-1 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
      >
        Save
      </button>

      <button
        onClick={onToggle}
        className="ml-auto rounded px-3 py-1 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
      >
        {mode === "view" ? "Edit" : "Preview"}
      </button>
    </div>
  );
}
