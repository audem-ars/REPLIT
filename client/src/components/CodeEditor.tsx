import { useEffect, useRef } from "react";
import { File } from "@shared/schema";
import { useMonaco } from "@/hooks/use-monaco";
import { Loader2 } from "lucide-react";

declare global {
  interface Window {
    require: any;
    monaco: any;
  }
}

interface Position {
  lineNumber: number;
  column: number;
}

interface CodeEditorProps {
  file?: File;
  onChange: (fileId: number, content: string) => void;
  position: Position;
  onPositionChange: (position: Position) => void;
}

export default function CodeEditor({ 
  file, 
  onChange,
  position,
  onPositionChange
}: CodeEditorProps) {
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const { isLoading, initMonaco } = useMonaco();
  const editorRef = useRef<any>(null);

  // Initialize and configure Monaco editor
  useEffect(() => {
    if (isLoading || !editorContainerRef.current) return;

    // Initialize Monaco only once
    if (!editorRef.current) {
      initMonaco(editorContainerRef.current).then((editor) => {
        editorRef.current = editor;
        
        // Set up position change listener
        editor.onDidChangeCursorPosition((e: any) => {
          onPositionChange({
            lineNumber: e.position.lineNumber,
            column: e.position.column
          });
        });
      });
    }

    // Update editor content when file changes
    if (editorRef.current && file) {
      const monaco = window.monaco;
      const model = monaco.editor.createModel(
        file.content,
        file.language || 'plaintext'
      );
      
      editorRef.current.setModel(model);
      
      // Set up content change listener
      const disposable = model.onDidChangeContent(() => {
        onChange(file.id, model.getValue());
      });
      
      return () => {
        disposable.dispose();
        model.dispose();
      };
    }
  }, [file, isLoading, onChange, onPositionChange, initMonaco]);

  // If no file is selected, show a message
  if (!file) {
    return (
      <div className="flex-1 flex items-center justify-center bg-editor-bg text-text-dim">
        <div className="text-center">
          <p>No file selected</p>
          <p className="text-sm mt-2">Select a file from the explorer to start editing</p>
        </div>
      </div>
    );
  }

  // Show loading state while Monaco is initializing
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-editor-bg">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="editor-container flex-1">
      <div 
        id="monaco-editor" 
        ref={editorContainerRef} 
        className="w-full h-full"
      />
    </div>
  );
}
