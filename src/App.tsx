import { useCallback, useRef } from "react";
import { open, save } from "@tauri-apps/plugin-dialog";
import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import Editor from "./components/panels/Editor";
import Viewer from "./components/panels/Viewer";
import "./App.css";
import Titlebar from "./components/Titlebar";
import { saveLastDir, saveLastFilePath } from "./lib/storage";
import {
  Group,
  Panel,
  PanelImperativeHandle,
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
  useCurrentDir,
  useCurrentFilePath,
  useFileTreeActions,
} from "./stores/useFileTreeStore";
import {
  useMode,
  useIsSidebarOpen,
  useIsRightbarOpen,
  useUIActions,
} from "./stores/useUIStore";
import SearchModal from "./components/modals/SearchModal";
import { useState } from "react";
import { useFileDrop } from "./hooks/useFileDrop";
import { usePanelSync } from "./hooks/usePanelSync";
import { useDirWatcher } from "./hooks/useDirWatch";

export default function App() {
  const [content, setContent] = useState("");
  const sidebarRef = useRef<PanelImperativeHandle>(null);
  const editorRef = useRef<PanelImperativeHandle>(null);
  const savedContentRef = useRef<string>("");

  const currentFilePath = useCurrentFilePath();
  const currentDir = useCurrentDir();
  const { setCurrentFilePath, setCurrentDir, refreshTree } =
    useFileTreeActions();

  const mode = useMode();
  const isSidebarOpen = useIsSidebarOpen();
  const isRightbarOpen = useIsRightbarOpen();
  const {
    setMode,
    setIsSidebarOpen,
    setIsRightbarOpen,
    setIsDirty,
    toggleMode,
    toggleSidebar,
  } = useUIActions();

  const { isDark, toggleTheme } = useTheme();

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

  const handleSelectFile = useCallback(
    async (path: string) => {
      const text = await readTextFile(path);
      setCurrentFilePath(path);

      const normalized = text.replace(/\r\n/g, "\n");
      setContent(normalized);
      savedContentRef.current = normalized;

      await saveLastFilePath(path);
    },
    [setCurrentFilePath, setContent],
  );

  const { isSearchOpen, setIsSearchOpen } = useKeyboardShortcuts({
    handleSave,
    handleOpen: handleOpenDirectory,
    toggleTheme,
    handleToggleMode: toggleMode,
    handleToggleSidebar: toggleSidebar,
  });

  const isDragging = useFileDrop(handleSelectFile);

  const { handleSidebarResize, handleEditorResize } = usePanelSync({
    sidebarRef,
    editorRef,
    isSidebarOpen,
    isRightbarOpen,
    setIsSidebarOpen,
    setIsRightbarOpen,
  });

  useRestoreSession({
    setContent,
    savedContentRef,
    setIsSidebarOpen,
    setMode,
  });

  useDirWatcher(currentDir, refreshTree);

  return (
    <div
      className="flex h-screen flex-col bg-white dark:bg-zinc-900"
      onContextMenu={(e) => e.preventDefault()}
    >
      {isDragging && (
        <div className="absolute inset-0 z-9999 bg-emerald-500/10" />
      )}

      <Titlebar
        isDark={isDark}
        onOpen={handleOpenDirectory}
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
            {mode === "view" ? (
              <Viewer content={content} />
            ) : (
              <Editor
                content={content}
                onChange={handleContentChange}
                isDark={isDark}
              />
            )}
          </Panel>

          <Separator
            className={cn(
              "w-px cursor-col-resize bg-zinc-200 hover:bg-emerald-400 dark:bg-zinc-700 dark:hover:bg-emerald-500",
              !isRightbarOpen && "hidden",
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
            {mode === "edit" ? (
              <Viewer content={content} />
            ) : (
              <Editor
                content={content}
                onChange={handleContentChange}
                isDark={isDark}
              />
            )}
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
