import { join } from "@tauri-apps/api/path";
import { readDir } from "@tauri-apps/plugin-fs";
import { useEffect, useState } from "react";
import FileTree from "./FileTree";

export type Entry = {
  name: string;
  path: string;
  isDirectory: boolean;
  children: Entry[] | null;
};

const buildTree = async (dirPath: string): Promise<Entry[]> => {
  const entries = await readDir(dirPath);

  const result = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = await join(dirPath, entry.name);

      if (entry.isDirectory) {
        const children = await buildTree(entryPath);
        return {
          name: entry.name,
          path: entryPath,
          isDirectory: true,
          children,
        };
      } else if (entry.name.endsWith(".md")) {
        return {
          name: entry.name,
          path: entryPath,
          isDirectory: false,
          children: [],
        };
      }
      return null;
    }),
  );

  return result.filter(Boolean) as Entry[];
};

export default function Sidebar({
  currentDir,
  currentFile,
  onSelect,
}: {
  currentDir: string | null;
  currentFile: string | null;
  onSelect: (path: string) => void;
}) {
  const [entries, setEntries] = useState<Entry[]>([]);

  useEffect(() => {
    if (!currentDir) return;

    const fetchEntries = async () => {
      const entries = await buildTree(currentDir);
      setEntries(entries);
    };

    fetchEntries();
  }, [currentDir]);

  return (
    <div>
      {currentDir ? (
        <FileTree
          entries={entries}
          currentFile={currentFile}
          onSelect={onSelect}
        />
      ) : (
        <div>No directory selected</div>
      )}
    </div>
  );
}
