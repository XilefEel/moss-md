import { FolderOpen, FolderIcon } from "lucide-react";
import { useState } from "react";
import { cn } from "../lib/utils";
import FileTree from "./FileTree";
import { Entry } from "./Sidebar";
import BaseContextMenu from "./BaseContextMenu";

export default function FolderNode({
  entry,
  currentFile,
  onSelect,
  openFolders,
}: {
  entry: Entry;
  currentFile: string | null;
  onSelect: (path: string) => void;
  openFolders: Set<string>;
}) {
  const [isOpen, setIsOpen] = useState(openFolders.has(entry.path));

  return (
    <div className="mb-1">
      <BaseContextMenu
        onNewFile={() => console.log("New File", entry.path)}
        onNewFolder={() => console.log("New Folder", entry.path)}
        onRename={() => console.log("Rename", entry.path)}
        onDelete={() => console.log("Delete", entry.path)}
        isDirectory
      >
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
          {entry.name}
        </button>
      </BaseContextMenu>

      {isOpen && entry.children && (
        <div className="pl-5">
          <FileTree
            entries={entry.children}
            currentFile={currentFile}
            onSelect={onSelect}
            openFolders={openFolders}
          />
        </div>
      )}
    </div>
  );
}
