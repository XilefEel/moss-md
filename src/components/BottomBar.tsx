import { useCurrentFilePath } from "../stores/useFileTreeStore";

export default function BottomBar({ content }: { content: string }) {
  const currentFilePath = useCurrentFilePath();

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;

  return (
    <div className="fixed bottom-0 left-0 flex h-6 w-full items-center bg-white px-4 text-xs text-zinc-500 select-none dark:bg-zinc-900 dark:text-zinc-400">
      {currentFilePath && <p className="hidden sm:block">{currentFilePath}</p>}

      <div className="ml-auto flex items-center gap-4">
        <p>
          <span className="tabular-nums">{wordCount}</span> words
        </p>
        <p>
          <span className="tabular-nums">{charCount}</span> characters
        </p>
      </div>
    </div>
  );
}
