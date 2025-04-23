import { 
  Project, InsertProject, File, InsertFile, UpdateFile
} from "@shared/schema";

export interface IStorage {
  // Project operations
  getProjects(): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  deleteProject(id: number): Promise<boolean>;

  // File operations
  getFiles(projectId: number): Promise<File[]>;
  getFile(id: number): Promise<File | undefined>;
  getFileByPath(projectId: number, path: string): Promise<File | undefined>;
  createFile(file: InsertFile): Promise<File>;
  updateFile(id: number, file: UpdateFile): Promise<File | undefined>;
  deleteFile(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private projects: Map<number, Project>;
  private files: Map<number, File>;
  private projectIdCounter: number;
  private fileIdCounter: number;

  constructor() {
    this.projects = new Map();
    this.files = new Map();
    this.projectIdCounter = 1;
    this.fileIdCounter = 1;

    // Create initial project and files for demo
    this.setupInitialProject();
  }

  private setupInitialProject() {
    const now = new Date();
    const projectId = this.projectIdCounter++;
    
    // Create a default project
    const project: Project = {
      id: projectId,
      name: "my-project",
      description: "A sample project",
      createdAt: now,
    };
    
    this.projects.set(project.id, project);
    
    // Create some default files
    const defaultFiles: InsertFile[] = [
      {
        projectId,
        name: "index.html",
        path: "/index.html",
        content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Web Project</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div id="app">
        <h1>Hello, World!</h1>
        <p>This is a sample project created with Code Scraper.</p>
    </div>
    <script src="index.js"></script>
</body>
</html>`,
        type: "file",
        language: "html",
      },
      {
        projectId,
        name: "index.js",
        path: "/index.js",
        content: `// Main JavaScript file
console.log('Hello from JavaScript!');

document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app');
  const button = document.createElement('button');
  button.textContent = 'Click me!';
  button.addEventListener('click', () => {
    alert('Button clicked!');
  });
  app.appendChild(button);
});`,
        type: "file",
        language: "javascript",
      },
      {
        projectId,
        name: "styles.css",
        path: "/styles.css",
        content: `/* Main stylesheet */
body {
  font-family: Arial, sans-serif;
  line-height: 1.6;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  color: #0F9D58;
}

button {
  background-color: #0F9D58;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #0C8C4D;
}`,
        type: "file",
        language: "css",
      },
      {
        projectId,
        name: "README.md",
        path: "/README.md",
        content: `# My Project

This is a simple web project created with Code Scraper.

## Features

- HTML, CSS, and JavaScript files
- Simple interactive button
- Clean styling

## Getting Started

Open index.html in your browser to see the project in action.`,
        type: "file",
        language: "markdown",
      },
      {
        projectId,
        name: "node_modules",
        path: "/node_modules",
        content: "",
        type: "directory",
      },
      {
        projectId,
        name: "public",
        path: "/public",
        content: "",
        type: "directory",
      }
    ];
    
    defaultFiles.forEach(file => {
      const newFile: File = {
        ...file,
        id: this.fileIdCounter++,
        createdAt: now,
        updatedAt: now,
      };
      this.files.set(newFile.id, newFile);
    });
  }

  // Project operations
  async getProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }

  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async createProject(project: InsertProject): Promise<Project> {
    const id = this.projectIdCounter++;
    const now = new Date();
    const newProject: Project = {
      ...project,
      id,
      createdAt: now,
    };
    this.projects.set(id, newProject);
    return newProject;
  }

  async deleteProject(id: number): Promise<boolean> {
    // Delete all files associated with the project
    for (const [fileId, file] of this.files.entries()) {
      if (file.projectId === id) {
        this.files.delete(fileId);
      }
    }
    return this.projects.delete(id);
  }

  // File operations
  async getFiles(projectId: number): Promise<File[]> {
    return Array.from(this.files.values()).filter(
      (file) => file.projectId === projectId
    );
  }

  async getFile(id: number): Promise<File | undefined> {
    return this.files.get(id);
  }

  async getFileByPath(projectId: number, path: string): Promise<File | undefined> {
    return Array.from(this.files.values()).find(
      (file) => file.projectId === projectId && file.path === path
    );
  }

  async createFile(file: InsertFile): Promise<File> {
    const id = this.fileIdCounter++;
    const now = new Date();
    const newFile: File = {
      ...file,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.files.set(id, newFile);
    return newFile;
  }

  async updateFile(id: number, file: UpdateFile): Promise<File | undefined> {
    const existingFile = this.files.get(id);
    if (!existingFile) {
      return undefined;
    }
    
    const updatedFile: File = {
      ...existingFile,
      ...file,
      updatedAt: new Date(),
    };
    
    this.files.set(id, updatedFile);
    return updatedFile;
  }

  async deleteFile(id: number): Promise<boolean> {
    return this.files.delete(id);
  }
}

export const storage = new MemStorage();
