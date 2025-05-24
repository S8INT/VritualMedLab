import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table - for user authentication and progress tracking
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name"),
  role: text("role").default("student"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  role: true,
});

// Departments table - laboratory departments
export const departments = pgTable("departments", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  color: text("color").notNull(),
  icon: text("icon").notNull(),
  simulationCount: integer("simulation_count").default(0),
});

export const insertDepartmentSchema = createInsertSchema(departments).pick({
  name: true,
  description: true,
  color: true,
  icon: true,
  simulationCount: true,
});

// Simulations table - virtual laboratory simulations
export const simulations = pgTable("simulations", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  departmentId: integer("department_id").notNull(),
  duration: text("duration").notNull(),
  level: text("level").notNull(),
  imagePath: text("image_path"),
  objectives: jsonb("objectives").notNull(),
  procedure: jsonb("procedure").notNull(),
  lowBandwidth: boolean("low_bandwidth").default(false),
  featured: boolean("featured").default(false),
});

export const insertSimulationSchema = createInsertSchema(simulations).pick({
  title: true,
  description: true,
  departmentId: true,
  duration: true,
  level: true,
  imagePath: true,
  objectives: true,
  procedure: true,
  lowBandwidth: true,
  featured: true,
});

// CaseStudies table - clinical case studies
export const caseStudies = pgTable("case_studies", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  departmentId: integer("department_id").notNull(),
  duration: text("duration").notNull(),
  status: text("status").default("new"),
});

export const insertCaseStudySchema = createInsertSchema(caseStudies).pick({
  title: true,
  description: true,
  departmentId: true,
  duration: true,
  status: true,
});

// Resources table - educational resources
export const resources = pgTable("resources", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(),
  icon: text("icon").notNull(),
});

export const insertResourceSchema = createInsertSchema(resources).pick({
  title: true,
  description: true,
  type: true,
  icon: true,
});

// Progress table - user progress in courses and simulations
export const progress = pgTable("progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  simulationId: integer("simulation_id"),
  moduleId: text("module_id"),
  status: text("status").default("not_started"),
  completedDate: timestamp("completed_date"),
  score: integer("score"),
});

export const insertProgressSchema = createInsertSchema(progress).pick({
  userId: true,
  simulationId: true,
  moduleId: true,
  status: true,
  completedDate: true,
  score: true,
});

// Modules table - course modules
export const modules = pgTable("modules", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  totalLabs: integer("total_labs").notNull(),
  order: integer("order").notNull(),
  prerequisiteId: integer("prerequisite_id"),
});

export const insertModuleSchema = createInsertSchema(modules).pick({
  title: true,
  description: true,
  totalLabs: true,
  order: true,
  prerequisiteId: true,
});

// Testimonials table - user testimonials
export const testimonials = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  institution: text("institution").notNull(),
  country: text("country").notNull(),
  text: text("text").notNull(),
  rating: integer("rating").notNull(),
});

export const insertTestimonialSchema = createInsertSchema(testimonials).pick({
  name: true,
  role: true,
  institution: true,
  country: true,
  text: true,
  rating: true,
});

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Department = typeof departments.$inferSelect;
export type InsertDepartment = z.infer<typeof insertDepartmentSchema>;

export type Simulation = typeof simulations.$inferSelect;
export type InsertSimulation = z.infer<typeof insertSimulationSchema>;

export type CaseStudy = typeof caseStudies.$inferSelect;
export type InsertCaseStudy = z.infer<typeof insertCaseStudySchema>;

export type Resource = typeof resources.$inferSelect;
export type InsertResource = z.infer<typeof insertResourceSchema>;

export type Progress = typeof progress.$inferSelect;
export type InsertProgress = z.infer<typeof insertProgressSchema>;

export type Module = typeof modules.$inferSelect;
export type InsertModule = z.infer<typeof insertModuleSchema>;

export type Testimonial = typeof testimonials.$inferSelect;
export type InsertTestimonial = z.infer<typeof insertTestimonialSchema>;
