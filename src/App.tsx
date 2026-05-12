import { useEffect, useState } from "react";
import { open, save } from "@tauri-apps/plugin-dialog";
import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import Editor from "./components/Editor";
import Viewer from "./components/Viewer";
import "./App.css";
import Titlebar from "./components/Titlebar";
import {
  getIsDark,
  getLastFilePath,
  saveIsDark,
  saveLastFilePath,
} from "./lib/storage";
import { Group, Panel, Separator } from "react-resizable-panels";
import Sidebar from "./components/Sidebar";

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
  };

  const handleSelectFile = async (path: string) => {
    const text = await readTextFile(path);
    setFilePath(path);
    setContent(text);
  };

  useEffect(() => {
    const loadSettings = async () => {
      const dark = await getIsDark();
      const lastFile = await getLastFilePath();

      if (dark !== null) setIsDark(dark);

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
    if (!loaded) return;
    saveIsDark(isDark);
  }, [isDark, loaded]);

  useEffect(() => {
    if (filePath) saveLastFilePath(filePath);
  }, [filePath]);

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

  return (
    <div className="flex h-screen flex-col bg-white dark:bg-zinc-900">
      <Titlebar
        mode={mode}
        isDark={isDark}
        onOpen={handleOpen}
        onSave={handleSave}
        onToggle={() => setMode(mode === "view" ? "edit" : "view")}
        onToggleDark={() => setIsDark((prev) => !prev)}
      />

      <div className="flex-1 overflow-auto p-8 pt-16 pb-6">
        {mode === "edit" ? (
          <Group>
            {isSidebarOpen && (
              <>
                <Panel minSize={200}>
                  <Sidebar
                    currentDir={currentDir}
                    currentFile={filePath}
                    onSelect={handleSelectFile}
                  />
                </Panel>
                <Separator className="w-px cursor-col-resize bg-zinc-200 dark:bg-zinc-700" />
              </>
            )}

            <Panel className="px-8" minSize={200}>
              <Viewer content={content} />
            </Panel>

            <Separator className="w-px cursor-col-resize rounded-full bg-zinc-200 dark:bg-zinc-700" />

            <Panel className="pl-8" minSize={200}>
              <Editor content={content} onChange={setContent} isDark={isDark} />
            </Panel>
          </Group>
        ) : (
          <Viewer content={content} />
        )}
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
