import { FolderOpen, FolderIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "../../lib/utils";
import FileTree from "./FileTree";
import {
  useOpenFolders,
  useFileTreeActions,
  useCurrentFilePath,
  useNewEntry,
} from "../../stores/useFileTreeStore";
import EntryContextMenu from "../context-menu/EntryContextMenu";
import { Entry } from "../../lib/types";
import { saveLastFilePath } from "../../lib/storage";
import { useInlineEdit } from "../../hooks/useInlineEdit";
import { NewEntryInput } from "./NewEntryInput";

export default function FolderNode({
  entry,
  onSelectFile,
}: {
  entry: Entry;
  onSelectFile: (path: string) => void;
}) {
  const openFolders = useOpenFolders();
  const newEntry = useNewEntry();
  const currentFilePath = useCurrentFilePath();
  const { setCurrentFilePath, renameEntry, setOpenFolders } =
    useFileTreeActions();

  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const onSave = async (newName: string) => {
    const newPath = await renameEntry(entry.path, newName);
    if (newPath === entry.path) return false;

    const updated = new Set(openFolders);
    updated.add(newPath);
    updated.delete(entry.path);

    setOpenFolders(updated);

    if (currentFilePath?.startsWith(entry.path)) {
      const updatedPath = currentFilePath.replace(entry.path, newPath);
      setCurrentFilePath(updatedPath);
      await saveLastFilePath(updatedPath);
    }

    return true;
  };

  const {
    value: name,
    setValue: setName,
    isEditing,
    setIsEditing,
    handleBlur,
    handleKeyDown,
    failed,
  } = useInlineEdit({
    initialValue: entry.name,
    onSave,
  });

  const handleToggleFolder = () => {
    if (isEditing) return;

    const next = !isOpen;
    setIsOpen(next);
    const updated = new Set(openFolders);

    if (next) updated.add(entry.path);
    else updated.delete(entry.path);

    setOpenFolders(updated);
  };

  useEffect(() => {
    if (!isEditing || !inputRef.current) return;

    const id = setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 1);

    return () => clearTimeout(id);
  }, [isEditing]);

  useEffect(() => {
    if (openFolders.has(entry.path)) {
      setIsOpen(true);
    }
  }, [openFolders]);

  return (
    <EntryContextMenu
      entry={entry}
      onRename={() => setIsEditing(true)}
      isDirectory
    >
      <div className="mb-1">
        <button
          onClick={handleToggleFolder}
          className={cn(
            "mb-1 flex w-full items-center gap-1 truncate rounded px-2 py-0.5 text-sm transition-colors",
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

        {failed && (
          <div className="mt-1 flex gap-1 px-2">
            <span className="size-4 shrink-0" />
            <p className="px-1 text-xs text-red-500 dark:text-red-400">
              File or folder "{name}" already exists
            </p>
          </div>
        )}

        {isOpen && entry.children && (
          <div
            className={cn(
              "relative pl-6",
              "before:absolute before:top-0 before:left-4 before:h-full",
              "before:border-l before:border-zinc-200 dark:before:border-zinc-700",
            )}
          >
            {newEntry?.dirPath === entry.path && (
              <NewEntryInput type={newEntry.type} onSelectFile={onSelectFile} />
            )}

            <FileTree entries={entry.children} onSelectFile={onSelectFile} />
          </div>
        )}
      </div>
    </EntryContextMenu>
  );
}
