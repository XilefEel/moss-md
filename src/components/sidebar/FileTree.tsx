import { Entry } from "../../stores/useFileTreeStore";
import FileNode from "./FileNode";
import FolderNode from "./FolderNode";

export default function FileTree({
  entries,
  onSelect,
}: {
  entries: Entry[];
  onSelect: (path: string) => void;
}) {
  return (
    <div className="select-none">
      {entries.map((entry) =>
        entry.isDirectory ? (
          <FolderNode key={entry.path} entry={entry} onSelect={onSelect} />
        ) : (
          <FileNode key={entry.path} entry={entry} onSelect={onSelect} />
        ),
      )}
    </div>
  );
}
