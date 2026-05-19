import { useEffect } from "react";
import FileTree from "../sidebar/FileTree";
import {
  useCurrentDir,
  useEntries,
  useFileTreeActions,
} from "../../stores/useFileTreeStore";

export default function Sidebar({
  onSelectFile,
}: {
  onSelectFile: (path: string) => void;
}) {
  const entries = useEntries();
  const currentDir = useCurrentDir();

  const { refreshTree } = useFileTreeActions();

  useEffect(() => {
    refreshTree();
  }, [currentDir]);

  return (
    <div className="h-full overflow-auto px-8">
      {currentDir ? (
        <FileTree entries={entries} onSelectFile={onSelectFile} />
      ) : (
        <p className="text-sm text-zinc-400 dark:text-zinc-500">
          No directory selected
        </p>
      )}
    </div>
  );
}
