import { getCurrentWindow } from "@tauri-apps/api/window";
import {
  Eye,
  FolderOpen,
  Minus,
  Moon,
  PanelLeftOpen,
  PanelRightOpen,
  Pencil,
  Plus,
  Search,
  Sun,
  Type,
  X,
} from "lucide-react";
import { confirm } from "@tauri-apps/plugin-dialog";
import {
  useMode,
  useIsSidebarOpen,
  useIsRightbarOpen,
  useIsDirty,
  useUIActions,
  useFontSize,
} from "../stores/useUIStore";
import { cn } from "../lib/utils";
import TitlebarItem from "./TitlebarItem";

const appWindow = getCurrentWindow();
const sizeOrder = ["sm", "md", "lg"] as const;

export default function Titlebar({
  isDark,
  onOpen,
  onToggleTheme,
  onToggleSearch,
}: {
  isDark: boolean;
  onOpen: () => void;
  onToggleTheme: () => void;
  onToggleSearch: () => void;
}) {
  const mode = useMode();
  const isSidebarOpen = useIsSidebarOpen();
  const isRightbarOpen = useIsRightbarOpen();
  const isDirty = useIsDirty();
  const fontSize = useFontSize();
  const { toggleMode, toggleSidebar, toggleRightbar, setFontSize } =
    useUIActions();

  const handleClose = async () => {
    if (!isDirty) {
      appWindow.close();
      return;
    }

    const confirmed = await confirm(
      "You have unsaved changes. Are you sure you want to close?",
      { title: "Unsaved Changes", kind: "warning" },
    );

    if (confirmed) {
      appWindow.close();
    }
  };

  return (
    <div
      data-tauri-drag-region
      className="fixed top-0 right-0 left-0 z-50 flex h-8 flex-row items-center gap-5 bg-white px-4 select-none dark:bg-zinc-900"
    >
      <div className="group flex items-center gap-2 select-none">
        <button
          onClick={handleClose}
          className="relative flex size-3.5 items-center justify-center rounded-full border border-black/10 bg-[#fc5753] transition-all hover:scale-110 active:scale-95"
        >
          <X
            strokeWidth={3}
            className="size-2 text-black/60 opacity-0 transition-opacity group-hover:opacity-100"
          />
        </button>

        <button
          onClick={() => appWindow.minimize()}
          className="relative flex size-3.5 items-center justify-center rounded-full border border-black/10 bg-[#fdbc40] transition-all hover:scale-110 active:scale-95"
        >
          <Minus
            strokeWidth={3}
            className="size-2 text-black/60 opacity-0 transition-opacity group-hover:opacity-100"
          />
        </button>

        <button
          onClick={() => appWindow.toggleMaximize()}
          className="relative flex size-3.5 items-center justify-center rounded-full border border-black/10 bg-[#36c84b] transition-all hover:scale-110 active:scale-95"
        >
          <Plus
            strokeWidth={3}
            className="size-2 text-black/60 opacity-0 transition-opacity group-hover:opacity-100"
          />
        </button>
      </div>

      <div className="flex items-center gap-2.5">
        <TitlebarItem
          action={toggleSidebar}
          content="Toggle Sidebar"
          Icon={isSidebarOpen ? PanelLeftOpen : PanelRightOpen}
        />

        <TitlebarItem
          action={onOpen}
          content="Open Directory"
          Icon={FolderOpen}
        />

        <TitlebarItem action={onToggleSearch} content="Search" Icon={Search} />
      </div>

      {isDirty && (
        <div className="size-1.5 rounded-full bg-green-400 dark:bg-green-500" />
      )}

      <div className="ml-auto flex items-center gap-2.5">
        <TitlebarItem
          action={() => {
            const nextIndex =
              (sizeOrder.indexOf(fontSize) + 1) % sizeOrder.length;
            setFontSize(sizeOrder[nextIndex]);
          }}
          content={`Font Size: ${fontSize.toUpperCase()}`}
        >
          <Type className="size-4 shrink-0" />
          <span className="flex flex-col-reverse gap-0.5">
            {sizeOrder.map((s) => (
              <span
                key={s}
                className={cn(
                  "size-1 rounded-full",
                  s === fontSize ? "bg-current" : "bg-current opacity-30",
                )}
              />
            ))}
          </span>
        </TitlebarItem>

        <TitlebarItem
          action={onToggleTheme}
          content="Toggle Theme"
          Icon={isDark ? Sun : Moon}
        />

        <TitlebarItem
          Icon={mode === "view" ? Pencil : Eye}
          content={
            mode === "view" ? "Switch to Edit Mode" : "Switch to View Mode"
          }
          action={toggleMode}
        />

        <TitlebarItem
          Icon={isRightbarOpen ? PanelLeftOpen : PanelRightOpen}
          content="Toggle Rightbar"
          action={toggleRightbar}
        />
      </div>
    </div>
  );
}
