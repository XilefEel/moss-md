import { useEffect, useState, useRef } from "react";
import { FileText } from "lucide-react";
import { cn } from "../../lib/utils";
import { useCurrentDir } from "../../stores/useFileTreeStore";
import { SearchResult } from "../../lib/types";
import { fuzzySearch } from "../../lib/io";

export default function SearchModal({
  isOpen,
  onClose,
  onSelect,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (path: string) => void;
}) {
  const currentDir = useCurrentDir();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);

  const handleClose = () => {
    setQuery("");
    setResults([]);
    setActiveIndex(0);
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 1);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query || !currentDir) {
      setResults([]);
      return;
    }

    const search = async () => {
      const results = await fuzzySearch(currentDir, query);
      setResults(results);
      setActiveIndex(0);
    };

    search();
  }, [query, currentDir]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, results.length - 1));
        break;

      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
        break;

      case "Enter":
        if (results[activeIndex]) {
          onSelect(results[activeIndex].path);
          handleClose();
        }
        break;

      case "Escape":
        handleClose();
        break;
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-99 flex items-start justify-center pt-24"
      onClick={handleClose}
    >
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />

      <div
        className="relative w-full max-w-lg rounded-xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search files..."
          className={cn(
            "w-full rounded-t-xl bg-transparent px-4 py-3 outline-none",
            "border-zinc-200 dark:border-zinc-800",
            "text-sm text-zinc-800 placeholder:text-zinc-400 dark:text-zinc-200",
            (results.length > 0 || query) && "border-b",
          )}
        />

        {results.length > 0 && (
          <div className="max-h-80 overflow-auto p-1">
            {results.map((result, index) => (
              <button
                key={result.path}
                onClick={() => {
                  onSelect(result.path);
                  onClose();
                }}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm",
                  index === activeIndex
                    ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                    : "text-zinc-600 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800",
                )}
              >
                <FileText className="size-4 shrink-0" />
                {result.name}
              </button>
            ))}
          </div>
        )}

        {query && results.length === 0 && (
          <p className="px-4 py-6 text-center text-sm text-zinc-400">
            No files found
          </p>
        )}
      </div>
    </div>
  );
}
