import * as ContextMenu from "@radix-ui/react-context-menu";
import { cn } from "../../lib/utils";
import { LucideIcon } from "lucide-react";

export default function ContextMenuItem({
  Icon,
  label,
  onSelect,
  isDelete,
}: {
  Icon: LucideIcon;
  label: string;
  onSelect?: () => void;
  isDelete?: boolean;
}) {
  return (
    <ContextMenu.Item
      onSelect={onSelect}
      className={cn(
        "flex cursor-default items-center gap-2 rounded px-2 py-1 text-sm outline-none select-none",
        "text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100",
        "hover:bg-zinc-50 dark:hover:bg-zinc-700/50",
        isDelete &&
          "hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400",
      )}
    >
      <Icon className="size-4 shrink-0" />
      <span>{label}</span>
    </ContextMenu.Item>
  );
}
