import { useEffect, useState } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Project, File } from "@shared/schema";
import AppHeader from "@/components/AppHeader";
import FileExplorer from "@/components/FileExplorer";
import EditorTabs from "@/components/EditorTabs";
import CodeEditor from "@/components/CodeEditor";
import Terminal from "@/components/Terminal";
import StatusBar from "@/components/StatusBar";
import ResizeHandle from "@/components/ResizeHandle";
import { AIAssistantPanel } from "@/components/AIAssistantPanel";
import { useResize } from "@/hooks/use-resize";
import { useFiles } from "@/hooks/use-files";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Editor() {
  const { projectId } = useParams();
  const id = parseInt(projectId || "1", 10);
  const { toast } = useToast();
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  
  // State for resizable panels
  const { 
    sidebarWidth, 
    terminalHeight, 
    handleSidebarResize, 
    handleTerminalResize 
  } = useResize();

  // Load project data
  const { data: project, isLoading: isProjectLoading } = useQuery<Project>({
    queryKey: [`/api/projects/${id}`],
  });

  // Load project files
  const { data: files, isLoading: isFilesLoading } = useQuery<File[]>({
    queryKey: [`/api/projects/${id}/files`],
  });

  // Files handling
  const { 
    openFiles,
    activeFile,
    openFile,
    closeFile,
    updateFileContent,
    position,
    setPosition
  } = useFiles(files || []);

  // Handle file selection from explorer
  const handleFileSelect = (file: File) => {
    if (file.type === "file") {
      openFile(file);
    }
  };

  // Effect for initial file open
  useEffect(() => {
    if (files && files.length > 0 && !activeFile) {
      // Find the first actual file (not directory)
      const firstFile = files.find(file => file.type === "file");
      if (firstFile) {
        openFile(firstFile);
      }
    }
  }, [files, activeFile, openFile]);

  // Loading state
  if (isProjectLoading || isFilesLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Project not found</h2>
          <p className="mt-2">The project you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-editor-bg text-text font-sans dark">
      <AppHeader 
        projectName={project.name} 
        activeFile={activeFile}
      />

      <div className="flex flex-1 overflow-hidden">
        <FileExplorer 
          files={files || []} 
          activeFile={activeFile}
          onFileSelect={handleFileSelect}
          width={sidebarWidth}
        />
        
        <ResizeHandle 
          direction="horizontal" 
          position={sidebarWidth} 
          onResize={handleSidebarResize}
        />

        <div className="flex-1 flex flex-col overflow-hidden">
          <EditorTabs 
            openFiles={openFiles} 
            activeFile={activeFile}
            onTabSelect={openFile}
            onTabClose={closeFile}
          />

          <div className="flex-1 relative overflow-hidden flex flex-col">
            <div className="flex-1 flex">
              <div className={`flex-1 ${showAIAssistant ? 'border-r' : ''}`}>
                <CodeEditor
                  file={activeFile}
                  onChange={updateFileContent}
                  position={position}
                  onPositionChange={setPosition}
                />
              </div>
              
              {showAIAssistant && (
                <div className="w-80">
                  <AIAssistantPanel 
                    code={activeFile?.content || ""}
                    language={activeFile?.language || ""}
                    onApplyFix={(fixedCode) => {
                      if (activeFile) {
                        updateFileContent(activeFile.id, fixedCode);
                        toast({
                          title: "Code fixed",
                          description: "The AI fix has been applied to your code.",
                        });
                      }
                    }}
                  />
                </div>
              )}
            </div>

            <Terminal height={terminalHeight} projectId={id} />
            
            <ResizeHandle 
              direction="vertical" 
              position={terminalHeight} 
              onResize={handleTerminalResize}
              fromBottom={true}
            />
            
            {/* AI Assistant Toggle Button */}
            <Button
              variant="outline"
              size="sm"
              className="absolute top-2 right-2 gap-1 bg-background/80 backdrop-blur-sm z-10"
              onClick={() => setShowAIAssistant(!showAIAssistant)}
            >
              <Sparkles className="h-4 w-4 text-purple-500" />
              {showAIAssistant ? "Hide AI" : "AI Assistant"}
            </Button>
          </div>
        </div>
      </div>

      <StatusBar 
        language={activeFile?.language || ""}
        position={position}
      />
    </div>
  );
}
