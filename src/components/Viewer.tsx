import MarkdownIt from "markdown-it";

const md = new MarkdownIt();

export default function Viewer({ content }: { content: string }) {
  return (
    <div
      className="prose prose-zinc dark:prose-invert max-w-none"
      dangerouslySetInnerHTML={{ __html: md.render(content) }}
    />
  );
}
