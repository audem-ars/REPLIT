import { 
  FileJson,
  FileCode,
  FileText,
  File as FileIcon
} from "lucide-react";
import React from "react";

// Monaco editor supported languages
export const monacoLanguages = [
  'javascript',
  'typescript',
  'html',
  'css',
  'json',
  'markdown',
  'python',
  'java',
  'c',
  'cpp',
  'csharp',
  'php',
  'ruby',
  'go',
  'rust',
  'sql',
  'yaml',
  'xml',
  'plaintext'
];

// Function to get the appropriate icon for a file language
export function getFileIcon(language: string): React.ReactNode {
  switch (language.toLowerCase()) {
    case 'javascript':
    case 'typescript':
    case 'jsx':
    case 'tsx':
      return React.createElement(FileCode, { className: "h-4 w-4 text-yellow-400" });
    
    case 'html':
      return React.createElement(FileCode, { className: "h-4 w-4 text-orange-400" });
    
    case 'css':
    case 'scss':
    case 'less':
      return React.createElement(FileCode, { className: "h-4 w-4 text-blue-400" });
    
    case 'json':
      return React.createElement(FileJson, { className: "h-4 w-4 text-green-400" });
    
    case 'markdown':
      return React.createElement(FileText, { className: "h-4 w-4 text-blue-300" });
    
    case 'python':
      return React.createElement(FileCode, { className: "h-4 w-4 text-blue-500" });
    
    case 'java':
      return React.createElement(FileCode, { className: "h-4 w-4 text-red-400" });
    
    case 'sql':
      return React.createElement(FileCode, { className: "h-4 w-4 text-purple-400" });
    
    case 'bash':
    case 'shell':
      return React.createElement(FileCode, { className: "h-4 w-4 text-gray-400" });
    
    case 'c':
    case 'cpp':
    case 'csharp':
    case 'php':
    case 'ruby':
    case 'go':
    case 'rust':
    case 'swift':
    case 'kotlin':
    case 'dart':
      return React.createElement(FileCode, { className: "h-4 w-4" });
    
    default:
      return React.createElement(FileIcon, { className: "h-4 w-4" });
  }
}

// Map file extensions to language identifiers
export function getLanguageFromExtension(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase() || "";
  
  const extensionMap: { [key: string]: string } = {
    'js': 'javascript',
    'ts': 'typescript',
    'jsx': 'javascript',
    'tsx': 'typescript',
    'html': 'html',
    'htm': 'html',
    'css': 'css',
    'scss': 'scss',
    'less': 'less',
    'json': 'json',
    'md': 'markdown',
    'markdown': 'markdown',
    'py': 'python',
    'java': 'java',
    'c': 'c',
    'cpp': 'cpp',
    'cc': 'cpp',
    'h': 'c',
    'hpp': 'cpp',
    'cs': 'csharp',
    'php': 'php',
    'rb': 'ruby',
    'go': 'go',
    'rs': 'rust',
    'swift': 'swift',
    'kt': 'kotlin',
    'kts': 'kotlin',
    'dart': 'dart',
    'sql': 'sql',
    'sh': 'shell',
    'bash': 'shell',
    'yaml': 'yaml',
    'yml': 'yaml',
    'xml': 'xml',
    'txt': 'plaintext'
  };
  
  return extensionMap[ext] || 'plaintext';
}
