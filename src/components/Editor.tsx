import { useEffect, useRef } from "react";
import { minimalSetup } from "codemirror";
import { EditorView } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { markdown } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";

export default function Editor({
  content,
  onChange,
}: {
  content: string;
  onChange: (value: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const view = new EditorView({
      state: EditorState.create({
        doc: content,
        extensions: [
          minimalSetup,
          markdown({ codeLanguages: languages, addKeymap: true }),
          EditorView.lineWrapping,
          EditorView.theme({
            "&": { height: "100%" },
            ".cm-scroller": {
              overflow: "auto",
              fontFamily: "JetBrains Mono, monospace",
            },
            ".cm-focused": { outline: "none" },
            ".cm-gutters": { display: "none" },
          }),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              onChange(update.state.doc.toString());
            }
          }),
        ],
      }),
      parent: containerRef.current,
    });

    viewRef.current = view;
    return () => view.destroy();
  }, []);

  return (
    <div className="h-full text-base">
      <div ref={containerRef} className="mx-auto max-w-2xl" />
    </div>
  );
}
