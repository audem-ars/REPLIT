import { Express, Request, Response } from "express";
import { createServer, Server } from "http";
import { storage } from "./storage";
import { spawn } from "child_process";
import { 
  insertProjectSchema, 
  insertFileSchema, 
  updateFileSchema,
  commandSchema
} from "@shared/schema";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Project routes
  app.get("/api/projects", async (req: Request, res: Response) => {
    try {
      const projects = await storage.getProjects();
      res.status(200).json(projects);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.get("/api/projects/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      const project = await storage.getProject(id);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      res.status(200).json(project);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  app.post("/api/projects", async (req: Request, res: Response) => {
    try {
      const validationResult = insertProjectSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        const errorMessage = fromZodError(validationResult.error).message;
        return res.status(400).json({ message: errorMessage });
      }
      
      const project = await storage.createProject(validationResult.data);
      res.status(201).json(project);
    } catch (error) {
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  app.delete("/api/projects/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      const success = await storage.deleteProject(id);
      
      if (!success) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete project" });
    }
  });

  // File routes
  app.get("/api/projects/:projectId/files", async (req: Request, res: Response) => {
    try {
      const projectId = parseInt(req.params.projectId, 10);
      const files = await storage.getFiles(projectId);
      res.status(200).json(files);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch files" });
    }
  });

  app.get("/api/files/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      const file = await storage.getFile(id);
      
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }
      
      res.status(200).json(file);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch file" });
    }
  });

  app.post("/api/files", async (req: Request, res: Response) => {
    try {
      const validationResult = insertFileSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        const errorMessage = fromZodError(validationResult.error).message;
        return res.status(400).json({ message: errorMessage });
      }
      
      const file = await storage.createFile(validationResult.data);
      res.status(201).json(file);
    } catch (error) {
      res.status(500).json({ message: "Failed to create file" });
    }
  });

  app.put("/api/files/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      const validationResult = updateFileSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        const errorMessage = fromZodError(validationResult.error).message;
        return res.status(400).json({ message: errorMessage });
      }
      
      const file = await storage.updateFile(id, validationResult.data);
      
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }
      
      res.status(200).json(file);
    } catch (error) {
      res.status(500).json({ message: "Failed to update file" });
    }
  });

  app.delete("/api/files/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      const success = await storage.deleteFile(id);
      
      if (!success) {
        return res.status(404).json({ message: "File not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete file" });
    }
  });

  // Execute code
  app.post("/api/execute", async (req: Request, res: Response) => {
    try {
      const validationResult = commandSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        const errorMessage = fromZodError(validationResult.error).message;
        return res.status(400).json({ message: errorMessage });
      }
      
      const { command, cwd } = validationResult.data;
      
      // Split command into program and args
      const parts = command.split(" ");
      const program = parts[0];
      const args = parts.slice(1);
      
      // Execute the command
      const process = spawn(program, args, {
        cwd: cwd || "/tmp",
        shell: true,
      });
      
      let stdout = "";
      let stderr = "";
      
      process.stdout.on("data", (data) => {
        stdout += data.toString();
      });
      
      process.stderr.on("data", (data) => {
        stderr += data.toString();
      });
      
      process.on("close", (code) => {
        res.status(200).json({
          stdout,
          stderr,
          exitCode: code,
        });
      });
      
      // Handle potential errors
      process.on("error", (error) => {
        res.status(500).json({
          message: "Execution failed",
          error: error.message,
        });
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to execute command" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
