import MarkdownIt from "markdown-it";
import container from "markdown-it-container";

const md = new MarkdownIt();

md.use(container, "tip", {
  render(tokens: any[], idx: number) {
    const token = tokens[idx];
    const title = token.info.trim().slice("tip".length).trim();
    if (token.nesting === 1) {
      return `<div class="tip"><p class="custom-block-title">${title || "TIP"}</p>\n`;
    }

    return "</div>\n";
  },
});

md.use(container, "info", {
  render(tokens: any[], idx: number) {
    const token = tokens[idx];
    const title = token.info.trim().slice("info".length).trim();
    if (token.nesting === 1) {
      return `<div class="info"><p class="custom-block-title">${title || "INFO"}</p>\n`;
    }

    return "</div>\n";
  },
});

md.use(container, "warning", {
  render(tokens: any[], idx: number) {
    const token = tokens[idx];
    const title = token.info.trim().slice("warning".length).trim();
    if (token.nesting === 1) {
      return `<div class="warning"><p class="custom-block-title">${title || "WARNING"}</p>\n`;
    }

    return "</div>\n";
  },
});

md.use(container, "danger", {
  render(tokens: any[], idx: number) {
    const token = tokens[idx];
    const title = token.info.trim().slice("danger".length).trim();
    if (token.nesting === 1) {
      return `<div class="danger"><p class="custom-block-title">${title || "DANGER"}</p>\n`;
    }

    return "</div>\n";
  },
});

export default function Viewer({ content }: { content: string }) {
  return (
    <div
      className="prose prose-zinc dark:prose-invert mx-auto max-w-2xl"
      dangerouslySetInnerHTML={{ __html: md.render(content) }}
    />
  );
}
