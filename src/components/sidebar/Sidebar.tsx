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
import { DragDropProvider } from "@dnd-kit/react";

export default function Sidebar({
  onSelectFile,
}: {
  onSelectFile: (path: string) => void;
}) {
  const newEntry = useNewEntry();
  const entries = useEntries();
  const currentDir = useCurrentDir();

  const { refreshTree, moveEntry } = useFileTreeActions();

  useEffect(() => {
    refreshTree();
  }, [currentDir, refreshTree]);

  const handleDragEnd = async (event: any) => {
    const { operation, canceled } = event;
    if (canceled || !operation.target || !currentDir) return;

    const sourcePath = operation.source.id as string;
    const destId = operation.target.id as string;
    const resolvedDest = destId === "__root__" ? currentDir : destId;

    if (sourcePath === resolvedDest) return;
    await moveEntry(sourcePath, resolvedDest);
  };

  return (
    <SidebarContextMenu>
      <DragDropProvider onDragEnd={handleDragEnd}>
        <div className="overflow-auto px-8">
          {currentDir ? (
            <>
              {newEntry?.dirPath === currentDir && (
                <NewEntryInput
                  type={newEntry.type}
                  onSelectFile={onSelectFile}
                />
              )}
              <FileTree entries={entries} onSelectFile={onSelectFile} />
            </>
          ) : (
            <p className="text-sm text-zinc-400 dark:text-zinc-500">
              No directory selected
            </p>
          )}
        </div>
      </DragDropProvider>
    </SidebarContextMenu>
  );
}
