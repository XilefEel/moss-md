import { FileText } from "lucide-react";
import { useRef, useEffect } from "react";
import { cn } from "../../lib/utils";
import {
  useCurrentFilePath,
  useFileTreeActions,
} from "../../stores/useFileTreeStore";
import FileTreeContextMenu from "../context-menu/FileTreeContextMenu";
import { Entry } from "../../lib/types";
import { saveLastFilePath } from "../../lib/storage";
import { useInlineEdit } from "../../hooks/useInlineEdit";

export default function FileNode({
  entry,
  onSelectFile,
}: {
  entry: Entry;
  onSelectFile: (path: string) => void;
}) {
  const currentFile = useCurrentFilePath();
  const { setCurrentFilePath, renameEntry } = useFileTreeActions();

  const inputRef = useRef<HTMLInputElement>(null);
  const isActive = currentFile === entry.path;

  const {
    value: name,
    setValue: setName,
    isEditing,
    setIsEditing,
    handleBlur,
    handleKeyDown,
  } = useInlineEdit({
    initialValue: entry.name.replace(/\.md$/, ""),
    onSave: async (newName) => {
      const newPath = await renameEntry(entry.path, `${newName}.md`);

      if (isActive) {
        setCurrentFilePath(newPath);
        await saveLastFilePath(newPath);
      }
    },
  });

  useEffect(() => {
    if (isEditing && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 1);
    }
  }, [isEditing]);

  return (
    <FileTreeContextMenu
      entry={entry}
      onRename={() => setIsEditing(true)}
      isDirectory={false}
    >
      <button
        onClick={() => {
          if (!isEditing || isActive) onSelectFile(entry.path);
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
            isEditing &&
              "bg-zinc-50 px-1 text-zinc-800 shadow-md ring-2 ring-emerald-500 dark:bg-zinc-800 dark:text-zinc-200",
          )}
        >
          <input
            ref={inputRef}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            readOnly={!isEditing}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            className={cn(
              "w-full truncate bg-transparent focus:outline-none",
              !isEditing && "pointer-events-none",
            )}
          />
        </div>
      </button>
    </FileTreeContextMenu>
  );
}
