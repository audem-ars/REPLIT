import { useState, useCallback } from "react";

interface HistoryEntry {
  type: "command" | "output" | "error";
  content: string;
}

export function useTerminal() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [currentCommandIndex, setCurrentCommandIndex] = useState<number>(-1);

  // Add an entry to the terminal history
  const addToHistory = useCallback((entry: HistoryEntry) => {
    setHistory((prev) => [...prev, entry]);
    
    // Add commands to command history for arrow-up recall
    if (entry.type === "command") {
      setCommandHistory((prev) => {
        // Don't add duplicate consecutive commands
        if (prev.length > 0 && prev[prev.length - 1] === entry.content) {
          return prev;
        }
        return [...prev, entry.content];
      });
      setCurrentCommandIndex(-1);
    }
  }, []);

  // Clear the terminal history
  const clearHistory = useCallback(() => {
    setHistory([]);
    // Don't clear command history, only visible history
  }, []);

  return {
    history,
    commandHistory,
    currentCommandIndex,
    addToHistory,
    clearHistory,
    setCurrentCommandIndex
  };
}
