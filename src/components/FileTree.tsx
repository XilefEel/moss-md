import { Entry } from "./Sidebar";
import FileNode from "./FileNode";
import FolderNode from "./FolderNode";

export default function FileTree({
  entries,
  currentFile,
  onSelect,
  openFolders,
}: {
  entries: Entry[];
  currentFile: string | null;
  onSelect: (path: string) => void;
  openFolders: Set<string>;
}) {
  return (
    <div className="select-none">
      {entries.map((entry) =>
        entry.isDirectory ? (
          <FolderNode
            key={entry.path}
            entry={entry}
            currentFile={currentFile}
            onSelect={onSelect}
            openFolders={openFolders}
          />
        ) : (
          <FileNode
            key={entry.path}
            entry={entry}
            currentFile={currentFile}
            onSelect={onSelect}
          />
        ),
      )}
    </div>
  );
}
