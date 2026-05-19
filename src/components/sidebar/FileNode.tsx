import { FileText } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { renameEntry } from "../../lib/io";
import { cn } from "../../lib/utils";
import {
  Entry,
  useCurrentFile,
  useFileTreeActions,
} from "../../stores/useFileTreeStore";
import FileTreeContextMenu from "../context-menu/FileTreeContextMenu";

export default function FileNode({
  entry,
  onSelect,
}: {
  entry: Entry;
  onSelect: (path: string) => void;
}) {
  const currentFile = useCurrentFile();
  const { refreshTree } = useFileTreeActions();

  const [name, setName] = useState(entry.name.replace(/\.md$/, ""));
  const [isRenaming, setIsRenaming] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isActive = currentFile === entry.path;

  const handleBlur = async () => {
    if (name && name !== entry.name.replace(/\.md$/, "")) {
      await renameEntry(entry.path, `${name}.md`);
      refreshTree();
    }

    setIsRenaming(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") inputRef.current?.blur();
    if (e.key === "Escape") {
      setName(entry.name.replace(/\.md$/, ""));
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
      isDirectory={false}
    >
      <button
        onClick={() => {
          if (!isRenaming || isActive) onSelect(entry.path);
        }}
        className={cn(
          "mb-1 flex w-full items-center gap-1 rounded px-2 py-0.5",
          "truncate text-sm text-zinc-800 dark:text-zinc-200",
          isActive
            ? "bg-emerald-50 font-medium text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
            : "hover:bg-zinc-50 hover:text-zinc-900 dark:hover:bg-zinc-700/50 dark:hover:text-zinc-100",
        )}
      >
        <FileText className="size-4 shrink-0" />

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
    </FileTreeContextMenu>
  );
}
