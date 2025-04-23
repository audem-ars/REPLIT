import { useState } from "react";
import { 
  FolderIcon, 
  FileIcon, 
  ChevronRight, 
  ChevronDown, 
  PlusIcon, 
  FolderPlusIcon, 
  MoreHorizontal, 
  File as FileIcon2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { File } from "@shared/schema";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { getFileIcon } from "@/lib/languages";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FileExplorerProps {
  files: File[];
  activeFile?: File;
  onFileSelect: (file: File) => void;
  width: number;
}

export default function FileExplorer({ files, activeFile, onFileSelect, width }: FileExplorerProps) {
  const [expandedFolders, setExpandedFolders] = useState<{ [key: string]: boolean }>({
    "/": true, // Root folder is expanded by default
  });
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [currentPath, setCurrentPath] = useState("/");
  const { toast } = useToast();

  // Toggle folder expansion
  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  };

  // Create a file tree structure from flat files array
  const fileTree = () => {
    const root: { [key: string]: File[] } = {};
    
    // First, organize files by their direct parent path
    files.forEach(file => {
      const pathParts = file.path.split('/').filter(Boolean);
      const parentPath = pathParts.length <= 1 ? "/" : "/" + pathParts.slice(0, -1).join('/');
      
      if (!root[parentPath]) {
        root[parentPath] = [];
      }
      
      root[parentPath].push(file);
    });
    
    return root;
  };

  // Render files and folders recursively
  const renderFileTree = (parentPath: string, level = 0) => {
    const items = fileTree()[parentPath] || [];
    
    // Sort by type (directories first) then by name
    const sortedItems = [...items].sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === "directory" ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
    
    return (
      <ul className={level === 0 ? "py-2" : "pl-4 mt-1"}>
        {sortedItems.map(item => {
          const isDirectory = item.type === "directory";
          const isExpanded = expandedFolders[item.path];
          const isActive = activeFile?.id === item.id;
          
          return (
            <li key={item.id} className="px-2 py-0.5">
              <div
                className={`flex items-center hover:bg-hover rounded px-2 py-1 cursor-pointer ${
                  isActive ? "bg-selected" : ""
                }`}
                onClick={() => isDirectory ? toggleFolder(item.path) : onFileSelect(item)}
              >
                {isDirectory ? (
                  <span className="mr-1">
                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </span>
                ) : (
                  <span className="w-4 mr-1"></span>
                )}
                
                <span className="file-icon">
                  {isDirectory ? (
                    <FolderIcon className="h-4 w-4 icon-folder" />
                  ) : (
                    getFileIcon(item.language || "")
                  )}
                </span>
                
                <span className="truncate">{item.name}</span>
              </div>
              
              {isDirectory && isExpanded && renderFileTree(item.path, level + 1)}
            </li>
          );
        })}
      </ul>
    );
  };

  // Create a new file or folder
  const handleCreateItem = async () => {
    if (!newItemName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name for your item",
        variant: "destructive"
      });
      return;
    }

    try {
      const projectId = files[0]?.projectId;
      const path = currentPath === "/" 
        ? `/${newItemName}` 
        : `${currentPath}/${newItemName}`;
      
      await apiRequest("POST", "/api/files", {
        projectId,
        name: newItemName,
        path,
        content: "",
        type: isCreatingFolder ? "directory" : "file",
        language: isCreatingFolder ? undefined : getLanguageFromFileName(newItemName)
      });
      
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/files`] });
      
      // If it's a folder, expand it automatically
      if (isCreatingFolder) {
        setExpandedFolders(prev => ({
          ...prev,
          [path]: true
        }));
      }
      
      setNewItemName("");
      setIsCreateDialogOpen(false);
      
      toast({
        title: `${isCreatingFolder ? "Folder" : "File"} created`,
        description: `Your ${isCreatingFolder ? "folder" : "file"} has been created successfully`,
      });
    } catch (error) {
      toast({
        title: `Failed to create ${isCreatingFolder ? "folder" : "file"}`,
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  };

  // Determine language from file extension
  const getLanguageFromFileName = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase() || "";
    
    switch(ext) {
      case 'js': return 'javascript';
      case 'ts': return 'typescript';
      case 'html': return 'html';
      case 'css': return 'css';
      case 'json': return 'json';
      case 'md': return 'markdown';
      case 'py': return 'python';
      case 'java': return 'java';
      case 'c': return 'c';
      case 'cpp': case 'cc': return 'cpp';
      case 'cs': return 'csharp';
      case 'php': return 'php';
      case 'rb': return 'ruby';
      case 'go': return 'go';
      case 'rs': return 'rust';
      case 'swift': return 'swift';
      case 'kt': case 'kts': return 'kotlin';
      case 'dart': return 'dart';
      default: return 'plaintext';
    }
  };

  // Open dialog to create a new file
  const openCreateFile = () => {
    setIsCreatingFolder(false);
    setIsCreateDialogOpen(true);
  };

  // Open dialog to create a new folder
  const openCreateFolder = () => {
    setIsCreatingFolder(true);
    setIsCreateDialogOpen(true);
  };

  return (
    <div 
      id="file-explorer" 
      className="bg-sidebar-bg border-r border-border overflow-y-auto flex flex-col"
      style={{ width: `${width}px` }}
    >
      <div className="flex items-center justify-between p-3 border-b border-border">
        <h2 className="font-medium">Files</h2>
        <div className="flex space-x-1">
          <Button variant="ghost" size="icon" onClick={openCreateFile}>
            <PlusIcon className="h-4 w-4 text-text-dim hover:text-text" />
          </Button>
          <Button variant="ghost" size="icon" onClick={openCreateFolder}>
            <FolderPlusIcon className="h-4 w-4 text-text-dim hover:text-text" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4 text-text-dim hover:text-text" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={openCreateFile}>
                <FileIcon2 className="h-4 w-4 mr-2" />
                New File
              </DropdownMenuItem>
              <DropdownMenuItem onClick={openCreateFolder}>
                <FolderIcon className="h-4 w-4 mr-2" />
                New Folder
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex-1">
        {renderFileTree("/")}
      </div>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Create New {isCreatingFolder ? "Folder" : "File"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="item-name">Name</Label>
              <Input
                id="item-name"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder={isCreatingFolder ? "my-folder" : "my-file.js"}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateItem} 
              disabled={!newItemName.trim()}
              className="bg-primary hover:bg-primary/90"
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
