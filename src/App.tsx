import { useEffect, useRef, useState } from "react";
import { open, save } from "@tauri-apps/plugin-dialog";
import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import Editor from "./components/Editor";
import Viewer from "./components/Viewer";
import "./App.css";
import Titlebar from "./components/Titlebar";
import {
  getIsDark,
  getLastDir,
  getLastFilePath,
  saveIsDark,
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

export default function App() {
  const [isDark, setIsDark] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [content, setContent] = useState("");

  const [filePath, setFilePath] = useState<string | null>(null);
  const [currentDir, setCurrentDir] = useState<string | null>(null);

  const [mode, setMode] = useState<"view" | "edit">("view");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;

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

  const handleToggleDark = async () => {
    const theme = !isDark;
    setIsDark(theme);
    await saveIsDark(theme);
  };

  useEffect(() => {
    const loadSettings = async () => {
      const dark = await getIsDark();
      const lastDir = await getLastDir();
      const lastFile = await getLastFilePath();

      if (dark !== null) setIsDark(dark);

      if (lastDir) setCurrentDir(lastDir);

      if (lastFile) {
        const text = await readTextFile(lastFile);
        setFilePath(lastFile);
        setContent(text);
      }

      setLoaded(true);
    };
    loadSettings();
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "s":
            e.preventDefault();
            handleSave();
            break;
          case "o":
            e.preventDefault();
            handleOpen();
            break;
          case "e":
            e.preventDefault();
            setMode((prev) => (prev === "view" ? "edit" : "view"));
            break;
          case "d":
            e.preventDefault();
            setIsDark((prev) => !prev);
            break;
          case "b":
            e.preventDefault();
            setIsSidebarOpen((prev) => !prev);
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [filePath, content]);

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
        isDark={isDark}
        onOpen={handleOpen}
        onSave={handleSave}
        onToggle={() => setMode(mode === "view" ? "edit" : "view")}
        onToggleDark={handleToggleDark}
      />

      <div className="flex h-screen">
        <Group defaultLayout={defaultLayout} onLayoutChanged={onLayoutChanged}>
          <Panel
            id="sidebar"
            minSize="15%"
            className="px-8 pt-12 pb-6"
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
              "w-px cursor-col-resize bg-zinc-200 dark:bg-zinc-700",
              !isSidebarOpen && "hidden",
            )}
          />

          <Panel className="px-8 pt-12 pb-6" minSize="15%">
            <Viewer content={content} />
          </Panel>

          <Separator
            className={cn(
              "w-px cursor-col-resize bg-zinc-200 dark:bg-zinc-700",
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

      <div className="fixed bottom-0 left-0 flex h-6 w-full items-center justify-end gap-4 bg-white/30 px-4 text-xs text-zinc-500 backdrop-blur-sm dark:bg-zinc-900/30 dark:text-zinc-400">
        <p>
          <span className="tabular-nums">{wordCount}</span> words
        </p>
        <p>
          <span className="tabular-nums">{charCount}</span> characters
        </p>
      </div>
    </div>
  );
}
