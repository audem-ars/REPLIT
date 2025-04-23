import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { File } from "@shared/schema";
import { getFileIcon } from "@/lib/languages";

interface EditorTabsProps {
  openFiles: File[];
  activeFile?: File;
  onTabSelect: (file: File) => void;
  onTabClose: (fileId: number) => void;
}

export default function EditorTabs({ 
  openFiles, 
  activeFile, 
  onTabSelect, 
  onTabClose 
}: EditorTabsProps) {
  if (!openFiles.length) {
    return (
      <div className="flex bg-sidebar-bg border-b border-border h-9 overflow-x-auto">
        <div className="flex-shrink-0 text-text-dim px-3 py-2 border-r border-border flex items-center">
          No files open
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-sidebar-bg border-b border-border overflow-x-auto">
      {openFiles.map((file) => (
        <div 
          key={file.id}
          className={`
            flex-shrink-0 px-3 py-2 border-r border-border flex items-center cursor-pointer
            ${activeFile?.id === file.id ? 'bg-selected text-text' : 'text-text-dim hover:bg-hover'}
          `}
          onClick={() => onTabSelect(file)}
        >
          <span className="file-icon">
            {getFileIcon(file.language || "")}
          </span>
          <span className="truncate max-w-[100px]">{file.name}</span>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-5 w-5 ml-1 rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              onTabClose(file.id);
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ))}
    </div>
  );
}
