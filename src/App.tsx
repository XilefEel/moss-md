import { useState } from "react";
import { open, save } from "@tauri-apps/plugin-dialog";
import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import Toolbar from "./components/Toolbar";
import Editor from "./components/Editor";
import Viewer from "./components/Viewer";
import "./App.css";

export default function App() {
  const [content, setContent] = useState("");
  const [filePath, setFilePath] = useState<string | null>(null);
  const [mode, setMode] = useState<"view" | "edit">("view");

  async function handleOpen() {
    const path = await open({
      filters: [{ name: "Markdown", extensions: ["md"] }],
    });
    if (!path) return;

    const text = await readTextFile(path);

    setFilePath(path);
    setContent(text);
  }

  async function handleSave() {
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
  }

  return (
    <div className="flex h-screen flex-col bg-white dark:bg-zinc-900">
      <Toolbar
        mode={mode}
        onOpen={handleOpen}
        onSave={handleSave}
        onToggle={() => setMode(mode === "view" ? "edit" : "view")}
      />

      <div className="flex-1 overflow-auto p-8">
        {mode === "edit" ? (
          <Editor content={content} onChange={setContent} />
        ) : (
          <Viewer content={content} />
        )}
      </div>
    </div>
  );
}
