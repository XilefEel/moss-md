import { useEffect } from "react";
import { PanelImperativeHandle, PanelSize } from "react-resizable-panels";
import {
  useIsSidebarOpen,
  useIsRightbarOpen,
  useUIActions,
} from "../stores/useUIStore";
import { saveIsRightbarOpen, saveIsSidebarOpen } from "../lib/storage";

export function usePanelSync({
  sidebarRef,
  editorRef,
}: {
  sidebarRef: React.RefObject<PanelImperativeHandle | null>;
  editorRef: React.RefObject<PanelImperativeHandle | null>;
}) {
  const isSidebarOpen = useIsSidebarOpen();
  const isRightbarOpen = useIsRightbarOpen();
  const { setIsSidebarOpen, setIsRightbarOpen } = useUIActions();

  const handleSidebarResize = (size: PanelSize) => {
    const isOpen = size.asPercentage !== 0;
    setIsSidebarOpen(isOpen);
    saveIsSidebarOpen(isOpen);
  };

  const handleEditorResize = (size: PanelSize) => {
    const isOpen = size.asPercentage !== 0;
    setIsRightbarOpen(isOpen);
    saveIsRightbarOpen(isOpen);
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
