import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertCaseStudySchema, 
  insertDepartmentSchema, 
  insertModuleSchema, 
  insertProgressSchema, 
  insertResourceSchema, 
  insertSimulationSchema, 
  insertTestimonialSchema, 
  insertUserSchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Departments routes
  app.get("/api/departments", async (req, res) => {
    const departments = await storage.getAllDepartments();
    res.json(departments);
  });

  app.get("/api/departments/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const department = await storage.getDepartment(id);
    
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }
    
    res.json(department);
  });

  app.post("/api/departments", async (req, res) => {
    try {
      const validatedData = insertDepartmentSchema.parse(req.body);
      const department = await storage.createDepartment(validatedData);
      res.status(201).json(department);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid department data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create department" });
    }
  });

  // Simulations routes
  app.get("/api/simulations", async (req, res) => {
    const departmentId = req.query.departmentId ? parseInt(req.query.departmentId as string) : undefined;
    
    if (departmentId) {
      const simulations = await storage.getSimulationsByDepartment(departmentId);
      return res.json(simulations);
    }
    
    const simulations = await storage.getAllSimulations();
    res.json(simulations);
  });

  app.get("/api/simulations/featured", async (req, res) => {
    const featuredSimulation = await storage.getFeaturedSimulation();
    
    if (!featuredSimulation) {
      return res.status(404).json({ message: "No featured simulation found" });
    }
    
    res.json(featuredSimulation);
  });

  app.get("/api/simulations/quickstart", async (req, res) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 3;
    const simulations = await storage.getQuickStartSimulations(limit);
    res.json(simulations);
  });

  app.get("/api/simulations/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const simulation = await storage.getSimulation(id);
    
    if (!simulation) {
      return res.status(404).json({ message: "Simulation not found" });
    }
    
    res.json(simulation);
  });

  app.post("/api/simulations", async (req, res) => {
    try {
      const validatedData = insertSimulationSchema.parse(req.body);
      const simulation = await storage.createSimulation(validatedData);
      res.status(201).json(simulation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid simulation data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create simulation" });
    }
  });

  // Case studies routes
  app.get("/api/case-studies", async (req, res) => {
    const departmentId = req.query.departmentId ? parseInt(req.query.departmentId as string) : undefined;
    
    if (departmentId) {
      const caseStudies = await storage.getCaseStudiesByDepartment(departmentId);
      return res.json(caseStudies);
    }
    
    const caseStudies = await storage.getAllCaseStudies();
    res.json(caseStudies);
  });

  app.get("/api/case-studies/recent", async (req, res) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 2;
    const caseStudies = await storage.getRecentCaseStudies(limit);
    res.json(caseStudies);
  });

  app.get("/api/case-studies/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const caseStudy = await storage.getCaseStudy(id);
    
    if (!caseStudy) {
      return res.status(404).json({ message: "Case study not found" });
    }
    
    res.json(caseStudy);
  });

  app.post("/api/case-studies", async (req, res) => {
    try {
      const validatedData = insertCaseStudySchema.parse(req.body);
      const caseStudy = await storage.createCaseStudy(validatedData);
      res.status(201).json(caseStudy);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid case study data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create case study" });
    }
  });

  // Resources routes
  app.get("/api/resources", async (req, res) => {
    const resources = await storage.getAllResources();
    res.json(resources);
  });

  app.get("/api/resources/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const resource = await storage.getResource(id);
    
    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }
    
    res.json(resource);
  });

  app.post("/api/resources", async (req, res) => {
    try {
      const validatedData = insertResourceSchema.parse(req.body);
      const resource = await storage.createResource(validatedData);
      res.status(201).json(resource);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid resource data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create resource" });
    }
  });

  // Modules routes
  app.get("/api/modules", async (req, res) => {
    const modules = await storage.getAllModules();
    res.json(modules);
  });

  app.get("/api/modules/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const module = await storage.getModule(id);
    
    if (!module) {
      return res.status(404).json({ message: "Module not found" });
    }
    
    res.json(module);
  });

  app.post("/api/modules", async (req, res) => {
    try {
      const validatedData = insertModuleSchema.parse(req.body);
      const module = await storage.createModule(validatedData);
      res.status(201).json(module);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid module data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create module" });
    }
  });

  // Testimonials routes
  app.get("/api/testimonials", async (req, res) => {
    const testimonials = await storage.getAllTestimonials();
    res.json(testimonials);
  });

  app.get("/api/testimonials/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const testimonial = await storage.getTestimonial(id);
    
    if (!testimonial) {
      return res.status(404).json({ message: "Testimonial not found" });
    }
    
    res.json(testimonial);
  });

  app.post("/api/testimonials", async (req, res) => {
    try {
      const validatedData = insertTestimonialSchema.parse(req.body);
      const testimonial = await storage.createTestimonial(validatedData);
      res.status(201).json(testimonial);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid testimonial data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create testimonial" });
    }
  });

  // User progress routes
  app.get("/api/progress/:userId", async (req, res) => {
    const userId = parseInt(req.params.userId);
    const progress = await storage.getUserProgress(userId);
    res.json(progress);
  });

  app.get("/api/progress/:userId/:simulationId", async (req, res) => {
    const userId = parseInt(req.params.userId);
    const simulationId = parseInt(req.params.simulationId);
    const progress = await storage.getSimulationProgress(userId, simulationId);
    
    if (!progress) {
      return res.status(404).json({ message: "Progress not found" });
    }
    
    res.json(progress);
  });

  app.post("/api/progress", async (req, res) => {
    try {
      const validatedData = insertProgressSchema.parse(req.body);
      const progress = await storage.createProgress(validatedData);
      res.status(201).json(progress);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid progress data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create progress" });
    }
  });

  app.patch("/api/progress/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updatedProgress = await storage.updateProgress(id, req.body);
      res.json(updatedProgress);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(404).json({ message: error.message });
      }
      res.status(500).json({ message: "Failed to update progress" });
    }
  });

  // User routes
  app.post("/api/users", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(validatedData);
      // Don't return the password
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
