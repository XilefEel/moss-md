import MarkdownIt from "markdown-it";
import container from "markdown-it-container";
import hljs from "highlight.js/lib/core";
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import python from "highlight.js/lib/languages/python";
import rust from "highlight.js/lib/languages/rust";
import c from "highlight.js/lib/languages/c";
import html from "highlight.js/lib/languages/xml";
import css from "highlight.js/lib/languages/css";
import "highlight.js/styles/monokai-sublime.css";
import { useEffect, useRef } from "react";
import { openUrl } from "@tauri-apps/plugin-opener";
import { useFontSize } from "../../stores/useUIStore";

hljs.registerLanguage("html", html);
hljs.registerLanguage("css", css);
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("python", python);
hljs.registerLanguage("rust", rust);
hljs.registerLanguage("c", c);

const md = new MarkdownIt({
  highlight(str: string, lang: string): string {
    if (lang && hljs.getLanguage(lang)) {
      const highlighted = hljs.highlight(str, {
        language: lang,
        ignoreIllegals: true,
      }).value;

      return `<pre><code class="hljs language-${lang}">${highlighted}</code></pre>`;
    }

    return `<pre><code class="hljs">${md.utils.escapeHtml(str)}</code></pre>`;
  },
});

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

md.renderer.rules.link_open = (tokens, idx, options, _env, self) => {
  tokens[idx].attrSet("target", "_blank");
  return self.renderToken(tokens, idx, options);
};

export default function Viewer({ content }: { content: string }) {
  const fontSize = useFontSize();
  const viewerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");
      if (!anchor?.href) return;

      e.preventDefault();
      e.stopPropagation();
      openUrl(anchor.href);
    };

    viewer.addEventListener("click", handleLinkClick);
    return () => viewer.removeEventListener("click", handleLinkClick);
  }, [content]);

  return (
    <div
      ref={viewerRef}
      className="markdown-body mx-auto max-w-2xl"
      data-text-size={fontSize}
      dangerouslySetInnerHTML={{ __html: md.render(content) }}
    />
  );
}
