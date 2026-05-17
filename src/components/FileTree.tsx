import { useState } from "react";
import { Entry } from "./Sidebar";
import { FileText, FolderIcon, FolderOpen } from "lucide-react";
import { cn } from "../lib/utils";

export default function FileTree({
  entries,
  currentFile,
  onSelect,
  openFolders,
}: {
  entries: Entry[];
  currentFile: string | null;
  onSelect: (path: string) => void;
  openFolders: Set<string>;
}) {
  return (
    <div className="select-none">
      {entries.map((entry) =>
        entry.isDirectory ? (
          <FolderNode
            key={entry.path}
            entry={entry}
            currentFile={currentFile}
            onSelect={onSelect}
            openFolders={openFolders}
          />
        ) : (
          <FileNode
            key={entry.path}
            entry={entry}
            currentFile={currentFile}
            onSelect={onSelect}
          />
        ),
      )}
    </div>
  );
}

function FolderNode({
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

function FileNode({
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
