import { useEffect, useRef } from "react";
import { minimalSetup } from "codemirror";
import { EditorView, keymap } from "@codemirror/view";
import { Compartment, EditorState } from "@codemirror/state";
import { markdown } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";
import { search, searchKeymap } from "@codemirror/search";

const themeCompartment = new Compartment();

const lightTheme = EditorView.theme(
  {
    "&": { backgroundColor: "transparent" },
    ".cm-content": { caretColor: "#71717a", color: "#3f3f46" },
    ".cm-focused": { outline: "none" },
    ".cm-gutters": { display: "none" },
    "&.cm-focused .cm-cursor": { borderLeftColor: "#71717a" },
    "&.cm-focused .cm-selectionBackground, ::selection": {
      backgroundColor: "#e4e4e7",
    },
  },
  { dark: false },
);

const darkTheme = EditorView.theme(
  {
    "&": { backgroundColor: "transparent" },
    ".cm-content": { caretColor: "#a1a1aa", color: "#d4d4d8" },
    ".cm-focused": { outline: "none" },
    ".cm-gutters": { display: "none" },
    "&.cm-focused .cm-cursor": { borderLeftColor: "#a1a1aa" },
    "&.cm-focused .cm-selectionBackground, ::selection": {
      backgroundColor: "#3f3f46",
    },
  },
  { dark: true },
);

const lightHighlight = HighlightStyle.define([
  { tag: t.heading, color: "#18181b" },
  { tag: t.strong, color: "#18181b" },
  { tag: t.emphasis, color: "#3f3f46" },
  { tag: t.punctuation, color: "#a1a1aa" },
  { tag: t.url, color: "#a1a1aa" },
  { tag: t.quote, color: "#71717a" },
]);

const darkHighlight = HighlightStyle.define([
  { tag: t.heading, color: "#f4f4f5" },
  { tag: t.strong, color: "#f4f4f5" },
  { tag: t.emphasis, color: "#d4d4d8" },
  { tag: t.punctuation, color: "#52525b" },
  { tag: t.url, color: "#52525b" },
  { tag: t.quote, color: "#a1a1aa" },
]);

export default function Editor({
  content,
  onChange,
  isDark,
}: {
  content: string;
  onChange: (value: string) => void;
  isDark: boolean;
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
          EditorView.lineWrapping,
          markdown({ codeLanguages: languages }),
          themeCompartment.of([
            isDark ? darkTheme : lightTheme,
            syntaxHighlighting(isDark ? darkHighlight : lightHighlight),
          ]),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) onChange(update.state.doc.toString());
          }),
          search({ top: true }),
          keymap.of(searchKeymap),
          EditorState.phrases.of({
            Find: "Search...",
            Replace: "Replace with...",
            next: "Next",
            previous: "Prev",
            all: "All",
            "match case": "Case",
            "by word": "Word",
            regexp: "Regex",
            replace: "Replace",
            "replace all": "Replace All",
          }),
        ],
      }),
      parent: containerRef.current,
    });

    viewRef.current = view;
    return () => view.destroy();
  }, [isDark]);

  useEffect(() => {
    if (!viewRef.current) return;
    const current = viewRef.current.state.doc.toString();
    if (current === content) return;

    viewRef.current.dispatch({
      changes: { from: 0, to: current.length, insert: content },
    });
  }, [content]);

  useEffect(() => {
    if (!viewRef.current) return;

    viewRef.current.dispatch({
      effects: themeCompartment.reconfigure([
        isDark ? darkTheme : lightTheme,
        syntaxHighlighting(isDark ? darkHighlight : lightHighlight),
      ]),
    });
  }, [isDark]);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new MutationObserver(() => {
      containerRef.current
        ?.querySelectorAll(".cm-textfield")
        .forEach((input) => {
          input.setAttribute("autocomplete", "off");
          input.setAttribute("spellcheck", "false");
        });
    });
    observer.observe(containerRef.current, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="h-full text-base">
      <div ref={containerRef} className="mx-auto max-w-2xl" />
    </div>
  );
}
