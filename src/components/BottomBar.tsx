export default function BottomBar({ content }: { content: string }) {
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;

  return (
    <div className="fixed bottom-0 left-0 flex h-6 w-full items-center justify-end gap-4 bg-white/30 px-4 text-xs text-zinc-500 backdrop-blur-sm select-none dark:bg-zinc-900/30 dark:text-zinc-400">
      <p>
        <span className="tabular-nums">{wordCount}</span> words
      </p>
      <p>
        <span className="tabular-nums">{charCount}</span> characters
      </p>
    </div>
  );
}
