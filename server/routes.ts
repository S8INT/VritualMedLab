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

import { WebSocketServer, WebSocket } from "ws";

// Define collaborative session types
interface CollaborativeSession {
  id: string;
  name: string;
  owner: string;
  createdAt: Date;
  participants: Map<string, WebSocket>;
  simulationId: number;
  departmentType: string;
  messages: SessionMessage[];
  currentStep: number;
  annotations: Annotation[];
}

interface SessionMessage {
  sender: string;
  content: string;
  timestamp: Date;
  type: 'chat' | 'action' | 'system';
}

interface Annotation {
  id: string;
  x: number;
  y: number;
  text: string;
  author: string;
  color: string;
  timestamp: Date;
}

// Store active collaborative sessions
const activeSessions = new Map<string, CollaborativeSession>();

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
  
  // Setup WebSocket server for collaborative sessions
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws) => {
    let sessionId: string | null = null;
    let userId: string | null = null;
    
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        // Handle different message types
        switch (data.type) {
          case 'join':
            handleJoinSession(ws, data);
            sessionId = data.sessionId;
            userId = data.userId;
            break;
          
          case 'create':
            handleCreateSession(ws, data);
            sessionId = data.sessionId;
            userId = data.userId;
            break;
          
          case 'chat':
            handleChatMessage(ws, data, sessionId, userId);
            break;
          
          case 'annotation':
            handleAnnotation(ws, data, sessionId, userId);
            break;
          
          case 'sync':
            handleSyncRequest(ws, sessionId);
            break;
          
          case 'step':
            handleStepChange(ws, data, sessionId, userId);
            break;
          
          case 'leave':
            handleLeaveSession(ws, sessionId, userId);
            break;
            
          default:
            ws.send(JSON.stringify({ type: 'error', message: 'Unknown message type' }));
        }
      } catch (error) {
        console.error('Error handling WebSocket message:', error);
        ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
      }
    });
    
    // Handle disconnection
    ws.on('close', () => {
      if (sessionId && userId) {
        handleLeaveSession(ws, sessionId, userId);
      }
    });
  });
  
  // API routes for collaborative sessions
  app.get('/api/sessions', (req, res) => {
    const sessions = Array.from(activeSessions.values()).map(session => ({
      id: session.id,
      name: session.name,
      owner: session.owner,
      createdAt: session.createdAt,
      participantCount: session.participants.size,
      simulationId: session.simulationId,
      departmentType: session.departmentType
    }));
    
    res.json(sessions);
  });
  
  app.get('/api/sessions/:id', (req, res) => {
    const sessionId = req.params.id;
    const session = activeSessions.get(sessionId);
    
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    res.json({
      id: session.id,
      name: session.name,
      owner: session.owner,
      createdAt: session.createdAt,
      participantCount: session.participants.size,
      simulationId: session.simulationId,
      departmentType: session.departmentType,
      currentStep: session.currentStep,
      messages: session.messages.slice(-50) // Return last 50 messages
    });
  });
  
  return httpServer;
}

// WebSocket message handlers
function handleJoinSession(ws: WebSocket, data: any) {
  const { sessionId, userId, username } = data;
  const session = activeSessions.get(sessionId);
  
  if (!session) {
    return ws.send(JSON.stringify({ 
      type: 'error', 
      message: 'Session not found' 
    }));
  }
  
  // Add participant to session
  session.participants.set(userId, ws);
  
  // Add system message about new participant
  const joinMessage: SessionMessage = {
    sender: 'system',
    content: `${username} has joined the session`,
    timestamp: new Date(),
    type: 'system'
  };
  
  session.messages.push(joinMessage);
  
  // Notify all participants
  broadcastToSession(session, {
    type: 'participant_joined',
    userId,
    username,
    message: joinMessage,
    participantCount: session.participants.size
  });
  
  // Send session data to new participant
  ws.send(JSON.stringify({
    type: 'session_joined',
    session: {
      id: session.id,
      name: session.name,
      owner: session.owner,
      simulationId: session.simulationId,
      departmentType: session.departmentType,
      currentStep: session.currentStep,
      messages: session.messages.slice(-50),
      annotations: session.annotations,
      participantCount: session.participants.size
    }
  }));
}

function handleCreateSession(ws: WebSocket, data: any) {
  const { userId, username, sessionName, simulationId, departmentType } = data;
  
  // Generate session ID
  const sessionId = generateSessionId();
  
  // Create new session
  const newSession: CollaborativeSession = {
    id: sessionId,
    name: sessionName,
    owner: userId,
    createdAt: new Date(),
    participants: new Map(),
    simulationId,
    departmentType,
    messages: [],
    currentStep: 0,
    annotations: []
  };
  
  // Add creator as first participant
  newSession.participants.set(userId, ws);
  
  // Add welcome message
  const welcomeMessage: SessionMessage = {
    sender: 'system',
    content: `Session "${sessionName}" created by ${username}`,
    timestamp: new Date(),
    type: 'system'
  };
  
  newSession.messages.push(welcomeMessage);
  
  // Store session
  activeSessions.set(sessionId, newSession);
  
  // Send confirmation to creator
  ws.send(JSON.stringify({
    type: 'session_created',
    sessionId,
    session: {
      id: sessionId,
      name: sessionName,
      owner: userId,
      simulationId,
      departmentType,
      currentStep: 0,
      messages: [welcomeMessage],
      annotations: [],
      participantCount: 1
    }
  }));
}

function handleChatMessage(ws: WebSocket, data: any, sessionId: string | null, userId: string | null) {
  if (!sessionId || !userId) {
    return ws.send(JSON.stringify({ 
      type: 'error', 
      message: 'Not connected to a session' 
    }));
  }
  
  const { content, username } = data;
  const session = activeSessions.get(sessionId);
  
  if (!session) {
    return ws.send(JSON.stringify({ 
      type: 'error', 
      message: 'Session not found' 
    }));
  }
  
  // Create new message
  const newMessage: SessionMessage = {
    sender: username,
    content,
    timestamp: new Date(),
    type: 'chat'
  };
  
  // Add to session messages
  session.messages.push(newMessage);
  
  // Broadcast to all participants
  broadcastToSession(session, {
    type: 'chat_message',
    message: newMessage
  });
}

function handleAnnotation(ws: WebSocket, data: any, sessionId: string | null, userId: string | null) {
  if (!sessionId || !userId) {
    return ws.send(JSON.stringify({ 
      type: 'error', 
      message: 'Not connected to a session' 
    }));
  }
  
  const { x, y, text, color, username } = data;
  const session = activeSessions.get(sessionId);
  
  if (!session) {
    return ws.send(JSON.stringify({ 
      type: 'error', 
      message: 'Session not found' 
    }));
  }
  
  // Create new annotation
  const newAnnotation: Annotation = {
    id: generateId(),
    x,
    y,
    text,
    author: username,
    color,
    timestamp: new Date()
  };
  
  // Add to session annotations
  session.annotations.push(newAnnotation);
  
  // Broadcast to all participants
  broadcastToSession(session, {
    type: 'annotation_added',
    annotation: newAnnotation
  });
}

function handleSyncRequest(ws: WebSocket, sessionId: string | null) {
  if (!sessionId) {
    return ws.send(JSON.stringify({ 
      type: 'error', 
      message: 'Not connected to a session' 
    }));
  }
  
  const session = activeSessions.get(sessionId);
  
  if (!session) {
    return ws.send(JSON.stringify({ 
      type: 'error', 
      message: 'Session not found' 
    }));
  }
  
  // Send current session state
  ws.send(JSON.stringify({
    type: 'session_sync',
    currentStep: session.currentStep,
    annotations: session.annotations,
    messages: session.messages.slice(-50),
    participantCount: session.participants.size
  }));
}

function handleStepChange(ws: WebSocket, data: any, sessionId: string | null, userId: string | null) {
  if (!sessionId || !userId) {
    return ws.send(JSON.stringify({ 
      type: 'error', 
      message: 'Not connected to a session' 
    }));
  }
  
  const { step, username } = data;
  const session = activeSessions.get(sessionId);
  
  if (!session) {
    return ws.send(JSON.stringify({ 
      type: 'error', 
      message: 'Session not found' 
    }));
  }
  
  // Update session step
  session.currentStep = step;
  
  // Create action message
  const actionMessage: SessionMessage = {
    sender: username,
    content: `moved to step ${step + 1}`,
    timestamp: new Date(),
    type: 'action'
  };
  
  session.messages.push(actionMessage);
  
  // Broadcast to all participants
  broadcastToSession(session, {
    type: 'step_changed',
    step,
    message: actionMessage
  });
}

function handleLeaveSession(ws: WebSocket, sessionId: string | null, userId: string | null) {
  if (!sessionId || !userId) {
    return;
  }
  
  const session = activeSessions.get(sessionId);
  
  if (!session) {
    return;
  }
  
  // Get username before removing from session
  const username = Array.from(session.messages)
    .filter(msg => msg.type === 'chat' && msg.sender !== 'system')
    .find(msg => msg.sender !== 'system')?.sender || 'A participant';
  
  // Remove participant
  session.participants.delete(userId);
  
  // Create leave message
  const leaveMessage: SessionMessage = {
    sender: 'system',
    content: `${username} has left the session`,
    timestamp: new Date(),
    type: 'system'
  };
  
  session.messages.push(leaveMessage);
  
  // Check if session is empty
  if (session.participants.size === 0) {
    activeSessions.delete(sessionId);
    return;
  }
  
  // Broadcast to remaining participants
  broadcastToSession(session, {
    type: 'participant_left',
    userId,
    message: leaveMessage,
    participantCount: session.participants.size
  });
}

// Helper functions
function broadcastToSession(session: CollaborativeSession, message: any) {
  const messageStr = JSON.stringify(message);
  
  session.participants.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(messageStr);
    }
  });
}

function generateSessionId(): string {
  return Math.random().toString(36).substring(2, 10);
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}
