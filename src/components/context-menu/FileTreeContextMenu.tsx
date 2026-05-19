import * as ContextMenu from "@radix-ui/react-context-menu";
import { cn } from "../../lib/utils";
import { FilePlus, FolderPlus, PencilLine, Trash2 } from "lucide-react";
import ContextMenuItem from "./ContextMenuItem";
import { useFileTreeActions } from "../../stores/useFileTreeStore";
import { createFile, createFolder, deleteEntry } from "../../lib/io";
import { confirm } from "@tauri-apps/plugin-dialog";
import { dirname } from "@tauri-apps/api/path";
import { Entry } from "../../lib/types";

export default function FileTreeContextMenu({
  children,
  entry,
  onSelectFile,
  onRename,
  isDirectory,
}: {
  children: React.ReactNode;
  entry: Entry;
  onSelectFile: (path: string) => void;
  onRename: () => void;
  isDirectory?: boolean;
}) {
  const { refreshTree, setCurrentFilePath } = useFileTreeActions();

  const handleNewFile = async () => {
    const name = prompt("File name:");
    if (!name) return;

    const targetDir = isDirectory ? entry.path : await dirname(entry.path);
    const filePath = await createFile(targetDir, name);

    setCurrentFilePath(filePath);
    onSelectFile(filePath);
    refreshTree();
  };

  const handleNewFolder = async () => {
    const name = prompt("Folder name:");
    if (!name) return;

    const targetDir = isDirectory ? entry.path : await dirname(entry.path);
    const folderPath = await createFolder(targetDir, name);

    setCurrentFilePath(folderPath);
    refreshTree();
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
            "z-50 flex min-w-44 flex-col overflow-hidden rounded-lg p-1.5 shadow-md",
            "bg-white dark:bg-zinc-800",
            "border border-zinc-200 dark:border-zinc-700",
          )}
        >
          <ContextMenuItem
            onSelect={handleNewFile}
            Icon={FilePlus}
            label="New File"
          />

          <ContextMenuItem
            onSelect={handleNewFolder}
            Icon={FolderPlus}
            label="New Folder"
          />

          <ContextMenu.Separator className="my-1 h-px border-t border-t-zinc-200 dark:border-t-zinc-700" />

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
