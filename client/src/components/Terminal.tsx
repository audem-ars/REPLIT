import React, { useState, useRef, useEffect } from "react";
import { Terminal as TerminalIcon, Trash2, ArrowUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useTerminal } from "@/hooks/use-terminal";

interface TerminalProps {
  height: number;
  projectId: number;
}

export default function Terminal({ height, projectId }: TerminalProps) {
  const { 
    history, 
    commandHistory, 
    currentCommandIndex,
    addToHistory, 
    clearHistory,
    setCurrentCommandIndex
  } = useTerminal();
  const [command, setCommand] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const { toast } = useToast();
  const contentRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when history changes
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [history]);

  // Focus input when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleCommand = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && command.trim() && !isExecuting) {
      try {
        setIsExecuting(true);
        
        // Add command to history immediately
        addToHistory({
          type: "command",
          content: command
        });
        
        // Special handling for clear command
        if (command.trim() === "clear" || command.trim() === "cls") {
          clearHistory();
          setCommand("");
          setIsExecuting(false);
          return;
        }
        
        // Execute command
        const response = await apiRequest("POST", "/api/execute", {
          command: command,
          cwd: "/tmp"
        });
        
        const result = await response.json();
        
        // Add stdout to history
        if (result.stdout) {
          addToHistory({
            type: "output",
            content: result.stdout
          });
        }
        
        // Add stderr to history if there are errors
        if (result.stderr) {
          addToHistory({
            type: "error",
            content: result.stderr
          });
        }
        
        // Add exit code if non-zero
        if (result.exitCode !== 0) {
          addToHistory({
            type: "error",
            content: `Process exited with code ${result.exitCode}`
          });
        }
      } catch (error) {
        toast({
          title: "Command execution failed",
          description: error instanceof Error ? error.message : "An unknown error occurred",
          variant: "destructive",
        });
        
        addToHistory({
          type: "error",
          content: error instanceof Error ? error.message : "Command execution failed"
        });
      } finally {
        // Clear current command and reset executing state
        setCommand("");
        setIsExecuting(false);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandHistory.length > 0 && currentCommandIndex < commandHistory.length - 1) {
        const newIndex = currentCommandIndex + 1;
        setCurrentCommandIndex(newIndex);
        setCommand(commandHistory[commandHistory.length - 1 - newIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (currentCommandIndex > 0) {
        const newIndex = currentCommandIndex - 1;
        setCurrentCommandIndex(newIndex);
        setCommand(commandHistory[commandHistory.length - 1 - newIndex]);
      } else if (currentCommandIndex === 0) {
        setCurrentCommandIndex(-1);
        setCommand("");
      }
    }
  };

  return (
    <div 
      id="terminal" 
      className="bg-terminal-bg border-t border-border flex flex-col"
      style={{ height: `${height}px` }}
    >
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <div className="flex items-center">
          <TerminalIcon className="h-4 w-4 mr-2" />
          <span>Terminal</span>
        </div>
        <div className="flex space-x-2">
          <Button variant="ghost" size="icon" onClick={clearHistory}>
            <Trash2 className="h-4 w-4 text-text-dim hover:text-text" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => {
              if (commandHistory.length > 0 && currentCommandIndex < commandHistory.length - 1) {
                const newIndex = currentCommandIndex + 1;
                setCurrentCommandIndex(newIndex);
                setCommand(commandHistory[commandHistory.length - 1 - newIndex]);
              }
            }}
          >
            <ArrowUp className="h-4 w-4 text-text-dim hover:text-text" />
          </Button>
        </div>
      </div>
      
      <div 
        ref={contentRef}
        className="terminal-content font-mono text-sm p-3 flex-1"
        onClick={() => inputRef.current?.focus()}
      >
        {history.length > 0 ? (
          history.map((entry, index) => (
            <div key={index} className="mb-1">
              {entry.type === "command" ? (
                <div>
                  <span className="text-green-500 mr-1">$</span>
                  <span>{entry.content}</span>
                </div>
              ) : entry.type === "error" ? (
                <div className="text-red-400">{entry.content}</div>
              ) : (
                <div>{entry.content}</div>
              )}
            </div>
          ))
        ) : (
          <div className="text-text-dim">
            Terminal ready. Type commands and press Enter to execute.
          </div>
        )}
        
        <div className="flex items-center mt-1">
          <span className="text-green-500 mr-1">$</span>
          <input
            ref={inputRef}
            type="text"
            className="terminal-input font-mono text-sm bg-transparent outline-none flex-1"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyDown={handleCommand}
            disabled={isExecuting}
            placeholder={isExecuting ? "Executing..." : "Enter command..."}
          />
          {isExecuting && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
        </div>
      </div>
    </div>
  );
}
