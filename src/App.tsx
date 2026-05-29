import { useEffect, useRef, useState } from "react";
import { open, save } from "@tauri-apps/plugin-dialog";
import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import Editor from "./components/panels/Editor";
import Viewer from "./components/panels/Viewer";
import "./App.css";
import Titlebar from "./components/Titlebar";
import {
  saveIsSidebarOpen,
  saveLastDir,
  saveLastFilePath,
  saveViewMode,
} from "./lib/storage";
import {
  Group,
  Panel,
  PanelImperativeHandle,
  PanelSize,
  Separator,
  useDefaultLayout,
} from "react-resizable-panels";
import Sidebar from "./components/sidebar/Sidebar";
import { cn } from "./lib/utils";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import BottomBar from "./components/BottomBar";
import useTheme from "./hooks/useTheme";
import { useRestoreSession } from "./hooks/useRestoreSession";
import {
  useCurrentFilePath,
  useFileTreeActions,
} from "./stores/useFileTreeStore";
import SearchModal from "./components/modals/SearchModal";

export default function App() {
  const [content, setContent] = useState("");
  const [isDirty, setIsDirty] = useState(false);

  const [mode, setMode] = useState<"view" | "edit" | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean | null>(null);

  const sidebarRef = useRef<PanelImperativeHandle>(null);
  const editorRef = useRef<PanelImperativeHandle>(null);
  const savedContentRef = useRef<string>("");

  const currentFilePath = useCurrentFilePath();
  const { setCurrentFilePath, setCurrentDir } = useFileTreeActions();

  const { defaultLayout, onLayoutChanged } = useDefaultLayout({
    id: "moss-layout",
    storage: localStorage,
  });

  const handleContentChange = (value: string) => {
    setContent(value);
    setIsDirty(value !== savedContentRef.current);
  };

  const handleSave = async () => {
    if (!currentFilePath) {
      const path = await save({
        filters: [{ name: "Markdown", extensions: ["md"] }],
      });
      if (!path) return;

      setCurrentFilePath(path);
      await writeTextFile(path, content.replace(/\n/g, "\r\n"));
    } else {
      await writeTextFile(currentFilePath, content.replace(/\n/g, "\r\n"));
    }

    savedContentRef.current = content;
    setIsDirty(false);
  };

  const handleOpenDirectory = async () => {
    const dir = await open({ directory: true });
    if (!dir) return;

    setCurrentDir(dir);
    setCurrentFilePath(null);
    setContent("");
    savedContentRef.current = "";
    setIsDirty(false);

    await Promise.all([saveLastDir(dir), saveLastFilePath("")]);
  };

  const handleSelectFile = async (path: string) => {
    const text = await readTextFile(path);
    setCurrentFilePath(path);

    const normalized = text.replace(/\r\n/g, "\n");
    setContent(normalized);
    savedContentRef.current = normalized;

    await saveLastFilePath(path);
  };

  const handleToggleMode = () => {
    const next = mode === "view" ? "edit" : "view";
    setMode(next);
    saveViewMode(next);
  };

  const handleToggleSidebar = () => {
    const next = !isSidebarOpen;
    setIsSidebarOpen(next);
    saveIsSidebarOpen(next);
  };

  const handleSidebarResize = (size: PanelSize) => {
    const isOpen = size.asPercentage !== 0;
    setIsSidebarOpen(isOpen);
    saveIsSidebarOpen(isOpen);
  };

  const handleEditorResize = (size: PanelSize) => {
    const isEdit = size.asPercentage !== 0;
    setMode(isEdit ? "edit" : "view");
    saveViewMode(isEdit ? "edit" : "view");
  };

  const { isDark, toggleTheme } = useTheme();

  useRestoreSession({
    setContent,
    savedContentRef,
    setIsSidebarOpen,
    setMode,
  });

  const { isSearchOpen, setIsSearchOpen } = useKeyboardShortcuts({
    handleSave,
    handleOpen: handleOpenDirectory,
    toggleTheme,
    handleToggleMode,
    handleToggleSidebar,
  });

  useEffect(() => {
    if (isSidebarOpen === null) return;
    if (isSidebarOpen) sidebarRef.current?.expand();
    else sidebarRef.current?.collapse();
  }, [isSidebarOpen]);

  useEffect(() => {
    if (mode === null) return;
    if (mode === "edit") editorRef.current?.expand();
    else editorRef.current?.collapse();
  }, [mode]);

  return (
    <div
      className="flex h-screen flex-col bg-white dark:bg-zinc-900"
      onContextMenu={(e) => e.preventDefault()}
    >
      <Titlebar
        mode={mode!}
        isSidebarOpen={isSidebarOpen!}
        isDark={isDark}
        isDirty={isDirty}
        onOpen={handleOpenDirectory}
        onSave={handleSave}
        onToggleMode={handleToggleMode}
        onToggleSidebar={handleToggleSidebar}
        onToggleTheme={toggleTheme}
        onToggleSearch={() => setIsSearchOpen((open) => !open)}
      />

      <div className="flex h-screen">
        <Group defaultLayout={defaultLayout} onLayoutChanged={onLayoutChanged}>
          <Panel
            id="sidebar"
            minSize="15%"
            className="mt-12 mb-6"
            panelRef={sidebarRef}
            collapsible
            onResize={handleSidebarResize}
          >
            <Sidebar onSelectFile={handleSelectFile} />
          </Panel>

          <Separator
            className={cn(
              "w-px cursor-col-resize bg-zinc-200 hover:bg-emerald-400 dark:bg-zinc-700 dark:hover:bg-emerald-500",
              !isSidebarOpen && "hidden",
            )}
          />

          <Panel id="viewer" className="mt-8 mb-6 px-8" minSize="15%">
            <Viewer content={content} />
          </Panel>

          <Separator
            className={cn(
              "w-px cursor-col-resize bg-zinc-200 hover:bg-emerald-400 dark:bg-zinc-700 dark:hover:bg-emerald-500",
              mode === "view" && "hidden",
            )}
          />

          <Panel
            id="editor"
            minSize="15%"
            className="mt-8 mb-6 px-8"
            panelRef={editorRef}
            collapsible
            onResize={handleEditorResize}
          >
            <Editor
              content={content}
              onChange={handleContentChange}
              isDark={isDark}
            />
          </Panel>
        </Group>
      </div>

      <BottomBar content={content} />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelect={handleSelectFile}
      />
    </div>
  );
}
