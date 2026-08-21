import { LucideIcon } from "lucide-react";
import { Tooltip } from "./tooltip/Tooltip";

export default function TitlebarItem({
  Icon,
  action,
  content,
  children,
}: {
  Icon?: LucideIcon;
  action: () => void;
  content: string;
  children?: React.ReactNode;
}) {
  return (
    <Tooltip content={content}>
      <button
        onClick={action}
        className="flex items-center gap-0.5 text-sm text-zinc-400 transition-colors hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
      >
        {Icon ? <Icon className="size-4 shrink-0" /> : children}
      </button>
    </Tooltip>
  );
}
