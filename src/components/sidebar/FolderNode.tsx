import { FolderOpen, FolderIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "../../lib/utils";
import FileTree from "./FileTree";
import { renameEntry } from "../../lib/io";
import {
  Entry,
  useOpenFolders,
  useFileTreeActions,
} from "../../stores/useFileTreeStore";
import FileTreeContextMenu from "../context-menu/FileTreeContextMenu";

export default function FolderNode({
  entry,
  onSelect,
}: {
  entry: Entry;
  onSelect: (path: string) => void;
}) {
  const openFolders = useOpenFolders();
  const { refreshTree } = useFileTreeActions();

  const [isOpen, setIsOpen] = useState(openFolders.has(entry.path));
  const [name, setName] = useState(entry.name);
  const [isRenaming, setIsRenaming] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleBlur = async () => {
    if (name && name !== entry.name) {
      await renameEntry(entry.path, name);
      refreshTree();
    }

    setIsRenaming(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") inputRef.current?.blur();
    if (e.key === "Escape") {
      setName(entry.name);
      setIsRenaming(false);
    }
  };

  useEffect(() => {
    if (isRenaming && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 1);
    }
  }, [isRenaming]);

  return (
    <FileTreeContextMenu
      entry={entry}
      onSelect={onSelect}
      onRename={() => setIsRenaming(true)}
      isDirectory
    >
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

          <div
            className={cn(
              "min-w-0 flex-1 rounded text-left",
              isRenaming &&
                "bg-zinc-50 px-1 text-zinc-800 shadow-md ring-2 ring-emerald-500 dark:bg-zinc-800 dark:text-zinc-200",
            )}
          >
            <input
              ref={inputRef}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              readOnly={!isRenaming}
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              className={cn(
                "w-full truncate bg-transparent focus:outline-none",
                !isRenaming && "pointer-events-none",
              )}
            />
          </div>
        </button>

        {isOpen && entry.children && (
          <div className="pl-5">
            <FileTree entries={entry.children} onSelect={onSelect} />
          </div>
        )}
      </div>
    </FileTreeContextMenu>
  );
}
