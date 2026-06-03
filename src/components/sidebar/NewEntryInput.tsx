import { FileText, FolderIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useFileTreeActions, useNewEntry } from "../../stores/useFileTreeStore";
import { cn } from "../../lib/utils";

export function NewEntryInput({
  type,
  onSelectFile,
}: {
  type: "file" | "folder";
  onSelectFile: (path: string) => void;
}) {
  const newEntry = useNewEntry();
  const { setNewEntry, createFile, createFolder } = useFileTreeActions();

  const [name, setName] = useState("");
  const [failed, setFailed] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleConfirm = async () => {
    if (!name || !newEntry) return;
    let path: string | null = null;

    if (newEntry.type === "file") {
      path = await createFile(newEntry.dirPath, name);
    } else {
      path = await createFolder(newEntry.dirPath, name);
    }

    if (!path) {
      setFailed(true);
      return;
    }

    setNewEntry(null);
    setFailed(false);
    if (newEntry.type === "file") onSelectFile(path);
  };

  const handleBlur = () => setNewEntry(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && name) handleConfirm();
    if (e.key === "Escape") setNewEntry(null);
  };

  useEffect(() => {
    if (!inputRef.current) return;

    const id = setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 1);

    return () => clearTimeout(id);
  }, []);

  return (
    <>
      <div className="flex items-center gap-1 px-2 py-0.5">
        {type === "file" ? (
          <FileText className="size-4 shrink-0 text-zinc-400 dark:text-zinc-500" />
        ) : (
          <FolderIcon className="size-4 shrink-0 text-zinc-400 dark:text-zinc-500" />
        )}

        <input
          ref={inputRef}
          value={name}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onChange={(e) => {
            setName(e.target.value);
            if (failed) setFailed(false);
          }}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          className={cn(
            "w-full rounded bg-transparent px-1 text-sm text-gray-900 ring-2 ring-emerald-500 focus:outline-none dark:text-gray-100 dark:ring-emerald-400",
            failed && "ring-red-500 dark:ring-red-400",
          )}
        />
      </div>

      {failed && (
        <div className="mt-1 flex gap-1 px-2">
          <span className="size-4 shrink-0" />
          <p className="px-1 text-xs text-red-500 dark:text-red-400">
            File or folder "{name}" already exists
          </p>
        </div>
      )}
    </>
  );
}
