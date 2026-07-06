import { useEffect } from "react";
import { PanelImperativeHandle, PanelSize } from "react-resizable-panels";

export function usePanelSync({
  sidebarRef,
  editorRef,
  isSidebarOpen,
  isRightbarOpen,
  setIsSidebarOpen,
  setIsRightbarOpen,
}: {
  sidebarRef: React.RefObject<PanelImperativeHandle | null>;
  editorRef: React.RefObject<PanelImperativeHandle | null>;
  isSidebarOpen: boolean | null;
  isRightbarOpen: boolean | null;
  setIsSidebarOpen: (open: boolean) => void;
  setIsRightbarOpen: (open: boolean) => void;
}) {
  const handleSidebarResize = (size: PanelSize) => {
    setIsSidebarOpen(size.asPercentage !== 0);
  };

  const handleEditorResize = (size: PanelSize) => {
    setIsRightbarOpen(size.asPercentage !== 0);
  };

  useEffect(() => {
    if (isSidebarOpen === null) return;
    if (isSidebarOpen) sidebarRef.current?.expand();
    else sidebarRef.current?.collapse();
  }, [isSidebarOpen, sidebarRef]);

  useEffect(() => {
    if (isRightbarOpen === null) return;
    if (isRightbarOpen) editorRef.current?.expand();
    else editorRef.current?.collapse();
  }, [isRightbarOpen, editorRef]);

  return { handleSidebarResize, handleEditorResize };
}
