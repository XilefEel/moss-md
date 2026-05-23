import * as ContextMenu from "@radix-ui/react-context-menu";
import { cn } from "../../lib/utils";
import { FilePlus, FolderPlus } from "lucide-react";
import ContextMenuItem from "./ContextMenuItem";
import {
  useCurrentDir,
  useFileTreeActions,
} from "../../stores/useFileTreeStore";

export default function SidebarContextMenu({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentDir = useCurrentDir();
  const { setNewEntry } = useFileTreeActions();

  const handleNewEntry = async (type: "file" | "folder") => {
    setNewEntry({ dirPath: currentDir!, type });
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
            label="New Folder"
          />
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
}
