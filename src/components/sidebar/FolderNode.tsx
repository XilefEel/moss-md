import { FolderOpen, FolderIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "../../lib/utils";
import FileTree from "./FileTree";
import { renameEntry } from "../../lib/io";
import {
  useOpenFolders,
  useFileTreeActions,
  useCurrentFilePath,
} from "../../stores/useFileTreeStore";
import FileTreeContextMenu from "../context-menu/FileTreeContextMenu";
import { Entry } from "../../lib/types";
import { saveLastFilePath } from "../../lib/storage";
import { useInlineEdit } from "../../hooks/useInlineEdit";

export default function FolderNode({
  entry,
  onSelectFile,
}: {
  entry: Entry;
  onSelectFile: (path: string) => void;
}) {
  const openFolders = useOpenFolders();
  const { refreshTree, setCurrentFilePath } = useFileTreeActions();
  const currentFilePath = useCurrentFilePath();

  const [isOpen, setIsOpen] = useState(openFolders.has(entry.path));
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    value: name,
    setValue: setName,
    isEditing,
    setIsEditing,
    handleBlur,
    handleKeyDown,
  } = useInlineEdit({
    initialValue: entry.name,
    onSave: async (newName) => {
      const newPath = await renameEntry(entry.path, newName);
      refreshTree();

      if (currentFilePath?.startsWith(entry.path)) {
        const updatedPath = currentFilePath.replace(entry.path, newPath);
        setCurrentFilePath(updatedPath);
        await saveLastFilePath(updatedPath);
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
      onSelectFile={onSelectFile}
      onRename={() => setIsEditing(true)}
      isDirectory
    >
      <div className="mb-1">
        <button
          onClick={() => {
            if (!isEditing) setIsOpen(!isOpen);
          }}
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

        {isOpen && entry.children && (
          <div className="pl-5">
            <FileTree entries={entry.children} onSelectFile={onSelectFile} />
          </div>
        )}
      </div>
    </FileTreeContextMenu>
  );
}
