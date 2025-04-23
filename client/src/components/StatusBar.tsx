import { FileType, Clock } from "lucide-react";

interface Position {
  lineNumber: number;
  column: number;
}

interface StatusBarProps {
  language: string;
  position: Position;
}

export default function StatusBar({ language, position }: StatusBarProps) {
  // Format language for display
  const formatLanguage = (lang: string) => {
    if (!lang) return "Plain Text";
    // Capitalize first letter
    return lang.charAt(0).toUpperCase() + lang.slice(1);
  };

  // Current time
  const now = new Date().toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit'
  });

  return (
    <footer className="flex items-center justify-between px-3 py-1 bg-sidebar-bg border-t border-border text-xs text-text-dim">
      <div className="flex items-center space-x-4">
        <div className="flex items-center">
          <FileType className="h-3 w-3 mr-1" />
          <span>{formatLanguage(language)}</span>
        </div>
        <span>UTF-8</span>
        <span>LF</span>
      </div>
      <div className="flex items-center space-x-4">
        <span>Ln {position.lineNumber}, Col {position.column}</span>
        <div className="flex items-center">
          <Clock className="h-3 w-3 mr-1" />
          <span>{now}</span>
        </div>
      </div>
    </footer>
  );
}
