import { useState, useCallback } from "react";
import { File, UpdateFile } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Position {
  lineNumber: number;
  column: number;
}

export function useFiles(allFiles: File[]) {
  const [openFiles, setOpenFiles] = useState<File[]>([]);
  const [activeFile, setActiveFile] = useState<File | undefined>(undefined);
  const [position, setPosition] = useState<Position>({ lineNumber: 1, column: 1 });
  const { toast } = useToast();

  // Open a file in the editor
  const openFile = useCallback((file: File) => {
    if (file.type === "directory") return;
    
    // Check if file is already open
    const isOpen = openFiles.some((f) => f.id === file.id);
    
    if (!isOpen) {
      setOpenFiles((prev) => [...prev, file]);
    }
    
    setActiveFile(file);
  }, [openFiles]);

  // Close a file tab
  const closeFile = useCallback((fileId: number) => {
    setOpenFiles((prev) => prev.filter((f) => f.id !== fileId));
    
    // If we're closing the active file, activate another file if available
    if (activeFile?.id === fileId) {
      setActiveFile((prev) => {
        if (prev?.id !== fileId) return prev;
        
        const remainingFiles = openFiles.filter((f) => f.id !== fileId);
        return remainingFiles.length > 0 ? remainingFiles[remainingFiles.length - 1] : undefined;
      });
    }
  }, [activeFile, openFiles]);

  // Update file content
  const updateFileContent = useCallback(async (fileId: number, content: string) => {
    try {
      // Update the file in the openFiles state optimistically
      setOpenFiles((prev) => 
        prev.map((f) => (f.id === fileId ? { ...f, content } : f))
      );
      
      // If this is the active file, update it too
      if (activeFile?.id === fileId) {
        setActiveFile((prev) => (prev ? { ...prev, content } : prev));
      }
      
      // Debounce server updates (for now just immediate update)
      const updateData: UpdateFile = { content };
      await apiRequest("PUT", `/api/files/${fileId}`, updateData);
      
    } catch (error) {
      toast({
        title: "Failed to save file",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  }, [activeFile, toast]);

  return {
    openFiles,
    activeFile,
    position,
    openFile,
    closeFile,
    updateFileContent,
    setPosition
  };
}
