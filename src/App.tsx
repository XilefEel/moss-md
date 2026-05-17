import { useEffect, useRef, useState } from "react";
import { open, save } from "@tauri-apps/plugin-dialog";
import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import Editor from "./components/Editor";
import Viewer from "./components/Viewer";
import "./App.css";
import Titlebar from "./components/Titlebar";
import {
  getIsSidebarOpen,
  getLastDir,
  getLastFilePath,
  getViewMode,
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
import Sidebar from "./components/Sidebar";
import { cn, getAncestorPaths } from "./lib/utils";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import BottomBar from "./components/BottomBar";
import useTheme from "./hooks/useTheme";

export default function App() {
  const [content, setContent] = useState("");
  const [isDirty, setIsDirty] = useState(false);

  const [filePath, setFilePath] = useState<string | null>(null);
  const [currentDir, setCurrentDir] = useState<string | null>(null);
  const [openFolders, setOpenFolders] = useState<Set<string>>(new Set());

  const [mode, setMode] = useState<"view" | "edit" | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean | null>(null);

  const sidebarRef = useRef<PanelImperativeHandle>(null);
  const editorRef = useRef<PanelImperativeHandle>(null);
  const savedContentRef = useRef<string>("");

  const { defaultLayout, onLayoutChanged } = useDefaultLayout({
    id: "moss-layout",
    storage: localStorage,
  });

  const handleContentChange = (value: string) => {
    setContent(value);
    setIsDirty(value !== savedContentRef.current);
  };

  const handleSave = async () => {
    if (!filePath) {
      const path = await save({
        filters: [{ name: "Markdown", extensions: ["md"] }],
      });
      if (!path) return;

      setFilePath(path);

      await writeTextFile(path, content);
    } else {
      await writeTextFile(filePath, content);
    }

    savedContentRef.current = content;
    setIsDirty(false);
  };

  const handleOpen = async () => {
    const dir = await open({ directory: true });
    if (!dir) return;
    setCurrentDir(dir);
    await saveLastDir(dir);
  };

  const handleSelectFile = async (path: string) => {
    const text = await readTextFile(path);
    setFilePath(path);
    setContent(text);
    savedContentRef.current = text;
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

  useKeyboardShortcuts({
    handleSave,
    handleOpen,
    toggleTheme,
    handleToggleMode,
    handleToggleSidebar,
  });

  useEffect(() => {
    const loadSettings = async () => {
      const [lastDir, lastFile, isSidebarOpen, viewMode] = await Promise.all([
        getLastDir(),
        getLastFilePath(),
        getIsSidebarOpen(),
        getViewMode(),
      ]);

      if (lastDir) setCurrentDir(lastDir);

      if (lastFile) {
        const text = await readTextFile(lastFile);
        setFilePath(lastFile);
        setContent(text);
        savedContentRef.current = text;
      }

      if (lastDir && lastFile) {
        const ancestors = await getAncestorPaths(lastFile, lastDir);
        setOpenFolders(new Set(ancestors));
      }

      if (isSidebarOpen !== null) setIsSidebarOpen(isSidebarOpen);
      if (viewMode !== null) setMode(viewMode);
    };
    loadSettings();
  }, []);

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
        onOpen={handleOpen}
        onSave={handleSave}
        onToggleMode={handleToggleMode}
        onToggleSidebar={handleToggleSidebar}
        onToggleTheme={toggleTheme}
      />

      <div className="flex h-screen">
        <Group defaultLayout={defaultLayout} onLayoutChanged={onLayoutChanged}>
          <Panel
            id="sidebar"
            minSize="15%"
            className="pt-12 pb-6"
            panelRef={sidebarRef}
            collapsible
            onResize={handleSidebarResize}
          >
            <Sidebar
              currentDir={currentDir}
              currentFile={filePath}
              onSelect={handleSelectFile}
              openFolders={openFolders}
            />
          </Panel>

          <Separator
            className={cn(
              "w-px cursor-col-resize bg-zinc-200 hover:bg-emerald-400 dark:bg-zinc-700 dark:hover:bg-emerald-500",
              !isSidebarOpen && "hidden",
            )}
          />

          <Panel id="viewer" className="px-8 pt-12 pb-6" minSize="15%">
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
            className="px-8 pt-12 pb-6"
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
    </div>
  );
}
