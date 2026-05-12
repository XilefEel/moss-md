import { useState } from "react";
import { Entry } from "./Sidebar";
import { FileText, FolderIcon, FolderOpen } from "lucide-react";
import { cn } from "../lib/utils";

export default function FileTree({
  entries,
  currentFile,
  onSelect,
}: {
  entries: Entry[];
  currentFile: string | null;
  onSelect: (path: string) => void;
}) {
  return (
    <div>
      {entries.map((entry) =>
        entry.isDirectory ? (
          <FolderNode
            key={entry.path}
            entry={entry}
            currentFile={currentFile}
            onSelect={onSelect}
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
}: {
  entry: Entry;
  currentFile: string | null;
  onSelect: (path: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1"
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
        "flex w-full items-center gap-1 rounded",
        isActive && "bg-zinc-100",
      )}
    >
      <FileText className="size-4 shrink-0" />
      {entry.name}
    </button>
  );
}
