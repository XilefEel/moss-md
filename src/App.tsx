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

export default function App() {
  const [isDark, setIsDark] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [content, setContent] = useState("");
  const [filePath, setFilePath] = useState<string | null>(null);
  const [mode, setMode] = useState<"view" | "edit">("view");

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;

  const handleOpen = async () => {
    const path = await open({
      filters: [{ name: "Markdown", extensions: ["md"] }],
    });
    if (!path) return;

    const text = await readTextFile(path);

    setFilePath(path);
    setContent(text);
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
  };

  useEffect(() => {
    async function loadSettings() {
      const dark = await getIsDark();
      const lastFile = await getLastFilePath();

      console.log("dark:", dark);
      console.log("lastFile:", lastFile);

      if (dark !== null) setIsDark(dark);

      if (lastFile) {
        const text = await readTextFile(lastFile);
        setFilePath(lastFile);
        setContent(text);
      }

      setLoaded(true);
    }
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

      <div className="flex-1 overflow-auto p-8 pt-16">
        {mode === "edit" ? (
          <Editor content={content} onChange={setContent} isDark={isDark} />
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
