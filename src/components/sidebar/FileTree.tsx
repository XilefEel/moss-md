import { Entry } from "../../lib/types";
import FileNode from "./FileNode";
import FolderNode from "./FolderNode";

export default function FileTree({
  entries,
  onSelectFile,
}: {
  entries: Entry[];
  onSelectFile: (path: string) => void;
}) {
  return (
    <div className="select-none">
      {entries.map((entry) =>
        entry.isDirectory ? (
          <FolderNode
            key={entry.path}
            entry={entry}
            onSelectFile={onSelectFile}
          />
        ) : (
          <FileNode
            key={entry.path}
            entry={entry}
            onSelectFile={onSelectFile}
          />
        ),
      )}
    </div>
  );
}
