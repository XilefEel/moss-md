# Moss

A minimal, fast desktop Markdown editor built with Tauri and React.

## Features

- **Edit/View mode**: CodeMirror-powered editor + live rendered preview, side by side
- **File tree sidebar**: browse a folder's markdown files and subfolders, with inline rename, create, delete, and drag-and-drop
- **Flexible layout**: collapse the sidebar and/or right pane for a focused view
- **Live file watching**: external changes to the current directory update the sidebar automatically
- **File search**: quickly find any file in the current directory
- **Light/dark theme**: toggle between themes, with persistence between sessions
- **Drag to open**: drop a markdown file onto the window to open it
- **Session restore**: reopens your last folder and file on launch

## Tech stack

- [Tauri](https://tauri.app/)
- [React](https://react.dev/) + TypeScript
- [CodeMirror 6](https://codemirror.net/)
- [markdown-it](https://github.com/markdown-it/markdown-it)
- [Zustand](https://github.com/pmndrs/zustand)
- [@dnd-kit](https://dndkit.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [react-resizable-panels](https://github.com/bvaughn/react-resizable-panels)

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/)
- [Rust](https://www.rust-lang.org/tools/install)
- [Tauri prerequisites guide](https://v2.tauri.app/start/prerequisites/)

### Run Locally

```bash
git clone https://github.com/XilefEel/moss-md.git
cd moss-md
npm install
npm run tauri dev
```

### Building

```bash
npm run tauri build
```
