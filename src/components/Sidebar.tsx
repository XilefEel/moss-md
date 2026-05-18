import { useEffect, useState } from "react";
import FileTree from "./FileTree";
import { buildTree } from "../lib/utils";

export type Entry = {
  name: string;
  path: string;
  isDirectory: boolean;
  children: Entry[] | null;
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
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          No directory selected
        </p>
      )}
    </div>
  );
}
