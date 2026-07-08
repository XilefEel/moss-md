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
import { DragDropProvider, useDroppable } from "@dnd-kit/react";
import { type ComponentProps } from "react";

type OnDragEnd = NonNullable<
  ComponentProps<typeof DragDropProvider>["onDragEnd"]
>;

export default function Sidebar({
  onSelectFile,
}: {
  onSelectFile: (path: string) => void;
}) {
  const newEntry = useNewEntry();
  const entries = useEntries();
  const currentDir = useCurrentDir();

  const { refreshTree, moveEntry } = useFileTreeActions();

  const handleDragEnd: OnDragEnd = async (event) => {
    const { operation, canceled } = event;
    if (canceled || !operation.target || !currentDir) return;

    const sourcePath = operation.source!.id as string;
    const destId = operation.target.id as string;
    const resolvedDest = destId === "__root__" ? currentDir : destId;

    if (sourcePath === resolvedDest) return;
    await moveEntry(sourcePath, resolvedDest);
  };

  useEffect(() => {
    refreshTree();
  }, [currentDir, refreshTree]);

  return (
    <SidebarContextMenu>
      <DragDropProvider onDragEnd={handleDragEnd}>
        <RootDropZone dirPath={currentDir}>
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
        </RootDropZone>
      </DragDropProvider>
    </SidebarContextMenu>
  );
}

function RootDropZone({
  dirPath,
  children,
}: {
  dirPath: string | null;
  children: React.ReactNode;
}) {
  const { ref } = useDroppable({ id: "__root__" });
  if (!dirPath) return <>{children}</>;

  return (
    <div ref={ref} className="flex h-full min-h-0 flex-col">
      {children}
    </div>
  );
}
