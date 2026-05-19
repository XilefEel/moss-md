import * as ContextMenu from "@radix-ui/react-context-menu";
import { cn } from "../lib/utils";
import { FilePlus, FolderPlus, Pencil, Trash2 } from "lucide-react";
import ContextMenuItem from "./ContextMenuItem";

export default function BaseContextMenu({
  children,
  onNewFile,
  onNewFolder,
  onRename,
  onDelete,
  isDirectory,
}: {
  children: React.ReactNode;
  onNewFile: () => void;
  onNewFolder?: () => void;
  onRename: () => void;
  onDelete: () => void;
  isDirectory?: boolean;
}) {
  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger asChild onContextMenu={(e) => e.stopPropagation()}>
        {children}
      </ContextMenu.Trigger>

      <ContextMenu.Portal>
        <ContextMenu.Content
          className={cn(
            "z-50 flex min-w-40 flex-col overflow-hidden rounded-lg p-1.5 shadow-md",
            "bg-white dark:bg-zinc-800",
            "border border-zinc-200 dark:border-zinc-700",
          )}
        >
          <ContextMenuItem onSelect={onNewFile}>
            <FilePlus className="size-4 shrink-0" />
            <span>New File</span>
          </ContextMenuItem>

          {isDirectory && (
            <ContextMenuItem onSelect={onNewFolder}>
              <FolderPlus className="size-4 shrink-0" />
              <span>New Folder</span>
            </ContextMenuItem>
          )}

          <ContextMenu.Separator className="my-1 h-px bg-zinc-200 dark:bg-zinc-700" />

          <ContextMenuItem onSelect={onRename}>
            <Pencil className="size-4 shrink-0" />
            <span>Rename</span>
          </ContextMenuItem>

          <ContextMenuItem onSelect={onDelete} isDelete>
            <Trash2 className="size-4 shrink-0" />
            <span>Delete</span>
          </ContextMenuItem>
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
}
