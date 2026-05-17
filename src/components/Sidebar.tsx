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
        if (children.length === 0) return null;

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

  return result
    .filter((e) => e !== null)
    .sort((a, b) => {
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;
      return 0;
    }) as Entry[];
};

export default function Sidebar({
  currentDir,
  currentFile,
  onSelect,
  openFolders,
}: {
  currentDir: string | null;
  currentFile: string | null;
  onSelect: (path: string) => void;
  openFolders: Set<string>;
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
    <div className="h-full overflow-auto px-8">
      {currentDir ? (
        <FileTree
          entries={entries}
          currentFile={currentFile}
          onSelect={onSelect}
          openFolders={openFolders}
        />
      ) : (
        <div>No directory selected</div>
      )}
    </div>
  );
}
