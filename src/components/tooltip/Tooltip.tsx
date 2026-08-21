import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "../../lib/utils";

export function Tooltip({
  children,
  content,
  side = "top",
  sideOffset = 8,
}: {
  children: React.ReactNode;
  content: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
}) {
  return (
    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side={side}
          sideOffset={sideOffset}
          className={cn(
            "rounded bg-zinc-900 px-2 py-1 text-xs text-white shadow-md select-none",
            "dark:bg-zinc-800 dark:text-zinc-300",
            "data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
          )}
        >
          {content}
          <TooltipPrimitive.Arrow className="fill-zinc-900 dark:fill-zinc-800" />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}
