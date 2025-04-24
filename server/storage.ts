import {
  Project, InsertProject, File, InsertFile, UpdateFile,
  User, UpsertUser, ProjectCollaborator, InsertProjectCollaborator
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { projects, files, users, projectCollaborators } from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Project operations
  getProjects(): Promise<Project[]>;
  getUserProjects(userId: string): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;
  
  // Collaborator operations
  getProjectCollaborators(projectId: number): Promise<ProjectCollaborator[]>;
  addCollaborator(collaborator: InsertProjectCollaborator): Promise<ProjectCollaborator>;
  removeCollaborator(projectId: number, userId: string): Promise<boolean>;
  
  // File operations
  getFiles(projectId: number): Promise<File[]>;
  getFile(id: number): Promise<File | undefined>;
  getFileByPath(projectId: number, path: string): Promise<File | undefined>;
  createFile(file: InsertFile): Promise<File>;
  updateFile(id: number, file: UpdateFile): Promise<File | undefined>;
  deleteFile(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Project operations
  async getProjects(): Promise<Project[]> {
    return await db.select().from(projects);
  }

  async getUserProjects(userId: string): Promise<Project[]> {
    // Get projects owned by the user
    const ownedProjects = await db.select().from(projects).where(eq(projects.userId, userId));
    
    // Get projects where the user is a collaborator
    const collaborationProjects = await db
      .select({
        project: projects
      })
      .from(projectCollaborators)
      .where(eq(projectCollaborators.userId, userId))
      .innerJoin(projects, eq(projectCollaborators.projectId, projects.id));
    
    // Combine and return unique projects
    const collaborationProjectsData = collaborationProjects.map(item => item.project);
    return [...ownedProjects, ...collaborationProjectsData];
  }

  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async createProject(project: InsertProject): Promise<Project> {
    const [newProject] = await db.insert(projects).values(project).returning();
    return newProject;
  }

  async updateProject(id: number, projectData: Partial<InsertProject>): Promise<Project | undefined> {
    const [updatedProject] = await db
      .update(projects)
      .set({
        ...projectData,
        updatedAt: new Date(),
      })
      .where(eq(projects.id, id))
      .returning();
    return updatedProject;
  }

  async deleteProject(id: number): Promise<boolean> {
    // Delete all files associated with the project
    await db.delete(files).where(eq(files.projectId, id));
    
    // Delete all collaborator records
    await db.delete(projectCollaborators).where(eq(projectCollaborators.projectId, id));
    
    // Delete the project
    const result = await db.delete(projects).where(eq(projects.id, id)).returning();
    return result.length > 0;
  }

  // Collaborator operations
  async getProjectCollaborators(projectId: number): Promise<ProjectCollaborator[]> {
    return await db
      .select()
      .from(projectCollaborators)
      .where(eq(projectCollaborators.projectId, projectId));
  }

  async addCollaborator(collaborator: InsertProjectCollaborator): Promise<ProjectCollaborator> {
    const [newCollaborator] = await db
      .insert(projectCollaborators)
      .values(collaborator)
      .returning();
    return newCollaborator;
  }

  async removeCollaborator(projectId: number, userId: string): Promise<boolean> {
    const result = await db
      .delete(projectCollaborators)
      .where(
        and(
          eq(projectCollaborators.projectId, projectId),
          eq(projectCollaborators.userId, userId)
        )
      )
      .returning();
    return result.length > 0;
  }

  // File operations
  async getFiles(projectId: number): Promise<File[]> {
    return await db.select().from(files).where(eq(files.projectId, projectId));
  }

  async getFile(id: number): Promise<File | undefined> {
    const [file] = await db.select().from(files).where(eq(files.id, id));
    return file;
  }

  async getFileByPath(projectId: number, path: string): Promise<File | undefined> {
    const [file] = await db
      .select()
      .from(files)
      .where(
        and(
          eq(files.projectId, projectId),
          eq(files.path, path)
        )
      );
    return file;
  }

  async createFile(file: InsertFile): Promise<File> {
    const [newFile] = await db.insert(files).values(file).returning();
    return newFile;
  }

  async updateFile(id: number, fileData: UpdateFile): Promise<File | undefined> {
    const [updatedFile] = await db
      .update(files)
      .set({
        ...fileData,
        updatedAt: new Date(),
      })
      .where(eq(files.id, id))
      .returning();
    return updatedFile;
  }

  async deleteFile(id: number): Promise<boolean> {
    const result = await db.delete(files).where(eq(files.id, id)).returning();
    return result.length > 0;
  }
}

// Create initial data if needed
async function setupInitialData() {
  const projectCount = await db.select({ count: sql`count(*)` }).from(projects);
  
  if (projectCount[0].count === 0) {
    // Create a default project
    const [project] = await db.insert(projects).values({
      name: "my-project",
      description: "A sample project",
      isPublic: true
    }).returning();
    
    // Create sample files
    const defaultFiles = [
      {
        projectId: project.id,
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
        <p>This is a sample project created with Replit.</p>
    </div>
    <script src="index.js"></script>
</body>
</html>`,
        type: "file",
        language: "html",
      },
      {
        projectId: project.id,
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
        projectId: project.id,
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
        projectId: project.id,
        name: "README.md",
        path: "/README.md",
        content: `# My Project

This is a simple web project created with Replit.

## Features

- HTML, CSS, and JavaScript files
- Simple interactive button
- Clean styling

## Getting Started

Open index.html in your browser to see the project in action.`,
        type: "file",
        language: "markdown",
      }
    ];
    
    await db.insert(files).values(defaultFiles);
  }
}

export const storage = new DatabaseStorage();

// Initialize database with sample data (don't wait for it)
setupInitialData().catch(err => console.error("Error setting up initial data:", err));
