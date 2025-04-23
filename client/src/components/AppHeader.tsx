import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { File } from "@shared/schema";
import { useState } from "react";
import { Code, Play, Settings, Loader2 } from "lucide-react";
import { useLocation } from "wouter";

interface AppHeaderProps {
  projectName: string;
  activeFile?: File;
}

export default function AppHeader({ projectName, activeFile }: AppHeaderProps) {
  const [isRunning, setIsRunning] = useState(false);
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const handleRun = async () => {
    if (!activeFile) {
      toast({
        title: "No active file",
        description: "Please open a file to run",
        variant: "destructive",
      });
      return;
    }

    setIsRunning(true);
    let command = "";

    // Determine how to run the file based on its language
    switch (activeFile.language) {
      case "javascript":
        command = `node ${activeFile.name}`;
        break;
      case "typescript":
        command = `ts-node ${activeFile.name}`;
        break;
      case "python":
        command = `python ${activeFile.name}`;
        break;
      case "html":
        toast({
          title: "HTML file",
          description: "HTML files can be previewed in the browser",
        });
        setIsRunning(false);
        return;
      default:
        toast({
          title: "Unsupported language",
          description: `Running ${activeFile.language} files is not supported yet`,
          variant: "destructive",
        });
        setIsRunning(false);
        return;
    }

    try {
      await apiRequest("POST", "/api/execute", {
        command,
        cwd: "/tmp"
      });
      
      toast({
        title: "Execution complete",
        description: "Check the terminal for results",
      });
    } catch (error) {
      toast({
        title: "Execution failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const goHome = () => {
    navigate("/");
  };

  return (
    <header className="flex items-center justify-between px-4 py-2 bg-sidebar-bg border-b border-border">
      <div className="flex items-center">
        <div className="cursor-pointer flex items-center" onClick={goHome}>
          <Code className="text-primary h-5 w-5 mr-2" />
          <h1 className="text-lg font-medium">Code Scraper</h1>
        </div>
        <span className="text-text-dim mx-2">|</span>
        <span className="text-text">{projectName}</span>
      </div>
      <div className="flex items-center space-x-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="default" 
              className="bg-primary hover:bg-primary/90"
              onClick={handleRun}
              disabled={isRunning || !activeFile}
            >
              {isRunning ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              Run
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {activeFile 
              ? `Run ${activeFile.name}` 
              : "Select a file to run"}
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5 text-text-dim hover:text-text" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Settings</TooltipContent>
        </Tooltip>
      </div>
    </header>
  );
}
