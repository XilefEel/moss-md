import * as ContextMenu from "@radix-ui/react-context-menu";
import { cn } from "../../lib/utils";
import { FilePlus, FolderPlus, PencilLine, Trash2 } from "lucide-react";
import ContextMenuItem from "./ContextMenuItem";
import { useFileTreeActions } from "../../stores/useFileTreeStore";
import { confirm } from "@tauri-apps/plugin-dialog";
import { dirname } from "@tauri-apps/api/path";
import { Entry } from "../../lib/types";

export default function FileTreeContextMenu({
  children,
  entry,
  onRename,
  isDirectory,
}: {
  children: React.ReactNode;
  entry: Entry;
  onRename: () => void;
  isDirectory?: boolean;
}) {
  const { refreshTree, setCurrentFilePath, setNewEntry, deleteEntry } =
    useFileTreeActions();

  const handleNewEntry = async (type: "file" | "folder") => {
    const targetDir = isDirectory ? entry.path : await dirname(entry.path);
    setNewEntry({ dirPath: targetDir, type });
  };

  const handleDelete = async () => {
    const confirmed = await confirm(`Delete "${entry.name}"?`, {
      title: "Confirm Delete",
      kind: "warning",
    });
    if (!confirmed) return;

    setCurrentFilePath(null);
    await deleteEntry(entry.path, entry.isDirectory);
    refreshTree();
  };

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger asChild onContextMenu={(e) => e.stopPropagation()}>
        {children}
      </ContextMenu.Trigger>

      <ContextMenu.Portal>
        <ContextMenu.Content
          className={cn(
            "z-50 flex min-w-44 flex-col gap-1 overflow-hidden rounded-lg p-2 shadow-md",
            "bg-white dark:bg-zinc-800",
            "border border-zinc-200 dark:border-zinc-700",
          )}
        >
          <ContextMenuItem
            onSelect={() => handleNewEntry("file")}
            Icon={FilePlus}
            label="New File"
          />

          <ContextMenuItem
            onSelect={() => handleNewEntry("folder")}
            Icon={FolderPlus}
            label={`New ${isDirectory ? "Subfolder" : "Folder"}`}
          />

          <ContextMenu.Separator className="h-px border-t border-t-zinc-200 dark:border-t-zinc-700" />

          <ContextMenuItem
            onSelect={onRename}
            Icon={PencilLine}
            label={`Rename ${isDirectory ? "Folder" : "File"}`}
          />

          <ContextMenuItem
            onSelect={handleDelete}
            Icon={Trash2}
            label={`Delete ${isDirectory ? "Folder" : "File"}`}
            isDelete
          />
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
}
