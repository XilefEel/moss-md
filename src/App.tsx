import { useEffect, useRef, useState } from "react";
import { open, save } from "@tauri-apps/plugin-dialog";
import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import Editor from "./components/Editor";
import Viewer from "./components/Viewer";
import "./App.css";
import Titlebar from "./components/Titlebar";
import {
  getLastDir,
  getLastFilePath,
  saveLastDir,
  saveLastFilePath,
} from "./lib/storage";
import {
  Group,
  Panel,
  PanelImperativeHandle,
  Separator,
  useDefaultLayout,
} from "react-resizable-panels";
import Sidebar from "./components/Sidebar";
import { cn } from "./lib/utils";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import BottomBar from "./components/BottomBar";
import useTheme from "./hooks/useTheme";

export default function App() {
  const [content, setContent] = useState("");

  const [filePath, setFilePath] = useState<string | null>(null);
  const [currentDir, setCurrentDir] = useState<string | null>(null);

  const [mode, setMode] = useState<"view" | "edit">("view");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const sidebarRef = useRef<PanelImperativeHandle>(null);
  const editorRef = useRef<PanelImperativeHandle>(null);

  const { defaultLayout, onLayoutChanged } = useDefaultLayout({
    id: "moss-layout",
    storage: localStorage,
  });

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
    await saveLastFilePath(path);
  };

  const { isDark, toggleTheme } = useTheme();

  useKeyboardShortcuts({
    handleSave,
    handleOpen,
    handleToggleMode: () => setMode(mode === "view" ? "edit" : "view"),
    handleToggleDark: toggleTheme,
    handleToggleSidebar: () => setIsSidebarOpen(!isSidebarOpen),
  });

  useEffect(() => {
    const loadSettings = async () => {
      const lastDir = await getLastDir();
      const lastFile = await getLastFilePath();

      if (lastDir) setCurrentDir(lastDir);

      if (lastFile) {
        const text = await readTextFile(lastFile);
        setFilePath(lastFile);
        setContent(text);
      }
    };
    loadSettings();
  }, []);

  useEffect(() => {
    if (isSidebarOpen) sidebarRef.current?.expand();
    else sidebarRef.current?.collapse();
  }, [isSidebarOpen]);

  useEffect(() => {
    if (mode === "edit") editorRef.current?.expand();
    else editorRef.current?.collapse();
  }, [mode]);

  return (
    <div className="flex h-screen flex-col bg-white dark:bg-zinc-900">
      <Titlebar
        mode={mode}
        isSidebarOpen={isSidebarOpen}
        isDark={isDark}
        onOpen={handleOpen}
        onSave={handleSave}
        onToggleMode={() => setMode(mode === "view" ? "edit" : "view")}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
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
            onResize={(size) => {
              if (size.asPercentage === 0) setIsSidebarOpen(false);
              else setIsSidebarOpen(true);
            }}
          >
            <Sidebar
              currentDir={currentDir}
              currentFile={filePath}
              onSelect={handleSelectFile}
            />
          </Panel>

          <Separator
            className={cn(
              "w-px cursor-col-resize bg-zinc-200 hover:bg-emerald-400 dark:bg-zinc-700 dark:hover:bg-emerald-500",
              !isSidebarOpen && "hidden",
            )}
          />

          <Panel className="px-8 pt-12 pb-6" minSize="15%">
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
            onResize={(size) => {
              if (size.asPercentage === 0) setMode("view");
              else setMode("edit");
            }}
          >
            <Editor content={content} onChange={setContent} isDark={isDark} />
          </Panel>
        </Group>
      </div>

      <BottomBar content={content} />
    </div>
  );
}
