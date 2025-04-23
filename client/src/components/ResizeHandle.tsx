import { useRef } from "react";

interface ResizeHandleProps {
  direction: "horizontal" | "vertical";
  position: number;
  onResize: (delta: number) => void;
  fromBottom?: boolean;
}

export default function ResizeHandle({ 
  direction, 
  position, 
  onResize, 
  fromBottom = false 
}: ResizeHandleProps) {
  const startPosRef = useRef<number>(0);
  const startSizeRef = useRef<number>(position);
  
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    startPosRef.current = direction === "horizontal" ? e.clientX : e.clientY;
    startSizeRef.current = position;
    
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    
    // Add cursor styling to body
    document.body.style.cursor = direction === "horizontal" ? "col-resize" : "row-resize";
    document.body.style.userSelect = "none";
  };
  
  const handleMouseMove = (e: MouseEvent) => {
    const currentPos = direction === "horizontal" ? e.clientX : e.clientY;
    const delta = currentPos - startPosRef.current;
    
    // If resizing from bottom, invert the delta
    const adjustedDelta = fromBottom ? -delta : delta;
    
    onResize(adjustedDelta);
  };
  
  const handleMouseUp = () => {
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
    
    // Reset cursor styling
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  };
  
  const style: React.CSSProperties = {
    zIndex: 10,
    position: "absolute",
    ...(direction === "horizontal" 
      ? {
          left: `${position}px`,
          top: 0,
          bottom: 0,
          width: "6px",
          cursor: "col-resize"
        } 
      : {
          right: 0,
          left: 0,
          ...(fromBottom 
            ? { bottom: `${position}px` } 
            : { top: `${position}px` }),
          height: "6px",
          cursor: "row-resize"
        })
  };
  
  return (
    <div
      className={`resize-handle resize-handle-${direction}`}
      style={style}
      onMouseDown={handleMouseDown}
    />
  );
}
