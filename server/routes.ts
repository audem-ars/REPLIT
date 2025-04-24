import { Express, Request, Response, NextFunction } from "express";
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
import { openAIService } from "./services/openai";
import { z } from "zod";
import { setupAuth, isAuthenticated } from "./replitAuth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
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

  // AI Assistant routes
  const aiCodeCompletionSchema = z.object({
    code: z.string(),
    language: z.string(),
    maxTokens: z.number().optional(),
  });

  app.post("/api/ai/complete", async (req: Request, res: Response) => {
    try {
      const validationResult = aiCodeCompletionSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        const errorMessage = fromZodError(validationResult.error).message;
        return res.status(400).json({ message: errorMessage });
      }
      
      const { code, language, maxTokens } = validationResult.data;
      const completion = await openAIService.generateCompletion({ 
        code, 
        language, 
        maxTokens 
      });
      
      res.status(200).json({ completion });
    } catch (error: any) {
      res.status(500).json({ 
        message: "Failed to generate code completion",
        error: error.message 
      });
    }
  });

  const aiCodeExplanationSchema = z.object({
    code: z.string(),
    language: z.string(),
  });

  app.post("/api/ai/explain", async (req: Request, res: Response) => {
    try {
      const validationResult = aiCodeExplanationSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        const errorMessage = fromZodError(validationResult.error).message;
        return res.status(400).json({ message: errorMessage });
      }
      
      const { code, language } = validationResult.data;
      const explanation = await openAIService.explainCode({ code, language });
      
      res.status(200).json({ explanation });
    } catch (error: any) {
      res.status(500).json({ 
        message: "Failed to explain code",
        error: error.message 
      });
    }
  });

  const aiCodeFixSchema = z.object({
    code: z.string(),
    error: z.string(),
    language: z.string(),
  });

  app.post("/api/ai/fix", async (req: Request, res: Response) => {
    try {
      const validationResult = aiCodeFixSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        const errorMessage = fromZodError(validationResult.error).message;
        return res.status(400).json({ message: errorMessage });
      }
      
      const { code, error, language } = validationResult.data;
      const fixedCode = await openAIService.fixCode({ code, error, language });
      
      res.status(200).json({ fixedCode });
    } catch (error: any) {
      res.status(500).json({ 
        message: "Failed to fix code",
        error: error.message 
      });
    }
  });

  app.post("/api/ai/document", async (req: Request, res: Response) => {
    try {
      const validationResult = aiCodeExplanationSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        const errorMessage = fromZodError(validationResult.error).message;
        return res.status(400).json({ message: errorMessage });
      }
      
      const { code, language } = validationResult.data;
      const documentation = await openAIService.generateDocumentation({ code, language });
      
      res.status(200).json({ documentation });
    } catch (error: any) {
      res.status(500).json({ 
        message: "Failed to generate documentation",
        error: error.message 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
