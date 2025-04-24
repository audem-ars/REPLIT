import { 
  pgTable, 
  text, 
  serial, 
  integer, 
  timestamp, 
  json, 
  varchar, 
  jsonb, 
  boolean,
  index,
  uniqueIndex 
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User model
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  username: varchar("username").unique().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  bio: text("bio"),
  profileImageUrl: varchar("profile_image_url"),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Project model
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  userId: varchar("user_id").references(() => users.id), // Project owner
  isPublic: boolean("is_public").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Project collaborators junction table
export const projectCollaborators = pgTable("project_collaborators", {
  projectId: integer("project_id").notNull().references(() => projects.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  accessLevel: text("access_level").notNull().default("read"), // read, write, admin
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => {
  return {
    pk: uniqueIndex("project_collaborators_pk").on(table.projectId, table.userId),
  };
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

// User types
export type User = typeof users.$inferSelect;
export type UpsertUser = typeof users.$inferInsert;

// Collaborator types
export type ProjectCollaborator = typeof projectCollaborators.$inferSelect;
export type InsertProjectCollaborator = typeof projectCollaborators.$inferInsert;

// Project types
export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

// File types
export type File = typeof files.$inferSelect;
export type InsertFile = z.infer<typeof insertFileSchema>;
export type UpdateFile = z.infer<typeof updateFileSchema>;

// Terminal command execution
export const commandSchema = z.object({
  command: z.string(),
  cwd: z.string().optional(),
});

export type CommandExecution = z.infer<typeof commandSchema>;
