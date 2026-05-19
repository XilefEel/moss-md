import { FolderOpen, FolderIcon } from "lucide-react";
import { useState } from "react";
import { cn } from "../lib/utils";
import FileTree from "./FileTree";
import EntryContextMenu from "./EntryContextMenu";
import { Entry, useOpenFolders } from "../stores/useFileTreeStore";

export default function FolderNode({
  entry,
  onSelect,
}: {
  entry: Entry;
  onSelect: (path: string) => void;
}) {
  const openFolders = useOpenFolders();

  const [isOpen, setIsOpen] = useState(openFolders.has(entry.path));

  return (
    <EntryContextMenu entry={entry} onSelect={onSelect} isDirectory>
      <div className="mb-1">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "mb-1 flex w-full items-center gap-1 truncate rounded px-2 py-0.5 text-sm",
            "hover:bg-zinc-50 dark:hover:bg-zinc-700/50",
            "text-zinc-800 hover:text-zinc-900 dark:text-zinc-200 dark:hover:text-zinc-100",
          )}
        >
          {isOpen ? (
            <FolderOpen className="size-4 shrink-0" />
          ) : (
            <FolderIcon className="size-4 shrink-0" />
          )}
          <span>{entry.name}</span>
        </button>

        {isOpen && entry.children && (
          <div className="pl-5">
            <FileTree entries={entry.children} onSelect={onSelect} />
          </div>
        )}
      </div>
    </EntryContextMenu>
  );
}
