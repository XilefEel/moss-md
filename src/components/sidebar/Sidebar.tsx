import { useEffect } from "react";
import FileTree from "../sidebar/FileTree";
import {
  useCurrentDir,
  useEntries,
  useFileTreeActions,
  useNewEntry,
} from "../../stores/useFileTreeStore";
import { NewEntryInput } from "./NewEntryInput";
import SidebarContextMenu from "../context-menu/SidebarContextMenu";

export default function Sidebar({
  onSelectFile,
}: {
  onSelectFile: (path: string) => void;
}) {
  const newEntry = useNewEntry();
  const entries = useEntries();
  const currentDir = useCurrentDir();

  const { refreshTree } = useFileTreeActions();

  useEffect(() => {
    refreshTree();
  }, [currentDir, refreshTree]);

  return (
    <SidebarContextMenu>
      <div className="h-full overflow-auto px-8">
        {currentDir ? (
          <>
            {newEntry?.dirPath === currentDir && (
              <NewEntryInput type={newEntry.type} onSelectFile={onSelectFile} />
            )}
            <FileTree entries={entries} onSelectFile={onSelectFile} />
          </>
        ) : (
          <p className="text-sm text-zinc-400 dark:text-zinc-500">
            No directory selected
          </p>
        )}
      </div>
    </SidebarContextMenu>
  );
}
