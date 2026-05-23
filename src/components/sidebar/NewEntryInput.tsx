import { FileText, FolderIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useFileTreeActions, useNewEntry } from "../../stores/useFileTreeStore";

export function NewEntryInput({
  type,
  onSelectFile,
}: {
  type: "file" | "folder";
  onSelectFile: (path: string) => void;
}) {
  const [name, setName] = useState("");
  const newEntry = useNewEntry();
  const { setNewEntry, createFile, createFolder } = useFileTreeActions();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleConfirm = async () => {
    if (!name || !newEntry) return;

    if (newEntry.type === "file") {
      const path = await createFile(newEntry.dirPath, name);
      onSelectFile(path);
    } else {
      await createFolder(newEntry.dirPath, name);
    }

    setNewEntry(null);
  };

  const handleBlur = () => (name ? handleConfirm() : setNewEntry(null));

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
        onChange={(e) => setName(e.target.value)}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        className="w-full rounded bg-transparent px-1 text-sm ring-2 ring-emerald-500 focus:outline-none"
      />
    </div>
  );
}
