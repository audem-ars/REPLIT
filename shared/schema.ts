import { pgTable, text, serial, integer, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Project model
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
});

// File model
export const files = pgTable("files", {
  id: serial("id").primaryKey(), 
  projectId: integer("project_id").notNull(),
  name: text("name").notNull(),
  path: text("path").notNull(),
  content: text("content").default(""),
  type: text("type").notNull(), // file or directory
  language: text("language"), // programming language for syntax highlighting
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertFileSchema = createInsertSchema(files).omit({
  id: true, 
  createdAt: true,
  updatedAt: true,
});

export const updateFileSchema = createInsertSchema(files).omit({
  id: true,
  projectId: true,
  createdAt: true,
  updatedAt: true,
});

// Types for frontend and backend
export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export type File = typeof files.$inferSelect;
export type InsertFile = z.infer<typeof insertFileSchema>;
export type UpdateFile = z.infer<typeof updateFileSchema>;

// Terminal command execution
export const commandSchema = z.object({
  command: z.string(),
  cwd: z.string().optional(),
});

export type CommandExecution = z.infer<typeof commandSchema>;
