import { getCurrentWindow } from "@tauri-apps/api/window";

export default function Titlebar() {
  const appWindow = getCurrentWindow();

  return (
    <div
      data-tauri-drag-region
      className="fixed top-0 right-0 left-0 z-99 flex h-8 items-center bg-white/30 px-4 backdrop-blur-sm select-none"
    >
      <div className="flex items-center gap-2.5">
        <button
          onClick={() => appWindow.close()}
          className="size-3.5 rounded-full bg-red-400 transition-colors hover:bg-red-500"
        />
        <button
          onClick={() => appWindow.minimize()}
          className="size-3.5 rounded-full bg-yellow-400 transition-colors hover:bg-yellow-500"
        />
        <button
          onClick={() => appWindow.toggleMaximize()}
          className="size-3.5 rounded-full bg-green-400 transition-colors hover:bg-green-500"
        />
      </div>
    </div>
  );
}
