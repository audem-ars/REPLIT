import { useState, useCallback } from "react";

export function useResize(
  initialSidebarWidth = 250,
  initialTerminalHeight = 200,
  minSidebarWidth = 150,
  maxSidebarWidth = 500,
  minTerminalHeight = 100,
  maxTerminalHeight = 500
) {
  const [sidebarWidth, setSidebarWidth] = useState(initialSidebarWidth);
  const [terminalHeight, setTerminalHeight] = useState(initialTerminalHeight);

  // Handler for sidebar resizing
  const handleSidebarResize = useCallback((delta: number) => {
    setSidebarWidth((prevWidth) => {
      const newWidth = prevWidth + delta;
      return Math.max(minSidebarWidth, Math.min(newWidth, maxSidebarWidth));
    });
  }, [minSidebarWidth, maxSidebarWidth]);

  // Handler for terminal resizing
  const handleTerminalResize = useCallback((delta: number) => {
    setTerminalHeight((prevHeight) => {
      const newHeight = prevHeight - delta;
      return Math.max(minTerminalHeight, Math.min(newHeight, maxTerminalHeight));
    });
  }, [minTerminalHeight, maxTerminalHeight]);

  return {
    sidebarWidth,
    terminalHeight,
    handleSidebarResize,
    handleTerminalResize
  };
}
