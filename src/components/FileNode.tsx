import { FileText } from "lucide-react";
import { Entry } from "./Sidebar";
import { cn } from "../lib/utils";

export default function FileNode({
  entry,
  currentFile,
  onSelect,
}: {
  entry: Entry;
  currentFile: string | null;
  onSelect: (path: string) => void;
}) {
  const isActive = currentFile === entry.path;

  return (
    <button
      onClick={() => onSelect(entry.path)}
      className={cn(
        "mb-1 flex w-full items-center gap-1 rounded px-2 py-0.5",
        "truncate text-sm text-zinc-800 dark:text-zinc-200",
        isActive
          ? "bg-emerald-50 font-medium text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
          : "hover:bg-zinc-50 hover:text-zinc-900 dark:hover:bg-zinc-700/50 dark:hover:text-zinc-100",
      )}
    >
      <FileText className="size-4 shrink-0" />
      {entry.name.replace(/\.md$/, "")}
    </button>
  );
}
