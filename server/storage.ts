import {
  users, departments, simulations, caseStudies, resources, progress, modules, testimonials,
  type User, type InsertUser, type Department, type InsertDepartment,
  type Simulation, type InsertSimulation, type CaseStudy, type InsertCaseStudy,
  type Resource, type InsertResource, type Progress, type InsertProgress,
  type Module, type InsertModule, type Testimonial, type InsertTestimonial
} from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Department operations
  getAllDepartments(): Promise<Department[]>;
  getDepartment(id: number): Promise<Department | undefined>;
  createDepartment(department: InsertDepartment): Promise<Department>;

  // Simulation operations
  getAllSimulations(): Promise<Simulation[]>;
  getSimulationsByDepartment(departmentId: number): Promise<Simulation[]>;
  getSimulation(id: number): Promise<Simulation | undefined>;
  createSimulation(simulation: InsertSimulation): Promise<Simulation>;
  getFeaturedSimulation(): Promise<Simulation | undefined>;
  getQuickStartSimulations(limit: number): Promise<Simulation[]>;

  // Case study operations
  getAllCaseStudies(): Promise<CaseStudy[]>;
  getCaseStudiesByDepartment(departmentId: number): Promise<CaseStudy[]>;
  getCaseStudy(id: number): Promise<CaseStudy | undefined>;
  createCaseStudy(caseStudy: InsertCaseStudy): Promise<CaseStudy>;
  getRecentCaseStudies(limit: number): Promise<CaseStudy[]>;

  // Resource operations
  getAllResources(): Promise<Resource[]>;
  getResource(id: number): Promise<Resource | undefined>;
  createResource(resource: InsertResource): Promise<Resource>;

  // Progress operations
  getUserProgress(userId: number): Promise<Progress[]>;
  getSimulationProgress(userId: number, simulationId: number): Promise<Progress | undefined>;
  createProgress(progress: InsertProgress): Promise<Progress>;
  updateProgress(id: number, progress: Partial<InsertProgress>): Promise<Progress>;

  // Module operations
  getAllModules(): Promise<Module[]>;
  getModule(id: number): Promise<Module | undefined>;
  createModule(module: InsertModule): Promise<Module>;

  // Testimonial operations
  getAllTestimonials(): Promise<Testimonial[]>;
  getTestimonial(id: number): Promise<Testimonial | undefined>;
  createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private departments: Map<number, Department>;
  private simulations: Map<number, Simulation>;
  private caseStudies: Map<number, CaseStudy>;
  private resources: Map<number, Resource>;
  private progresses: Map<number, Progress>;
  private modules: Map<number, Module>;
  private testimonials: Map<number, Testimonial>;

  private currentUserId: number;
  private currentDepartmentId: number;
  private currentSimulationId: number;
  private currentCaseStudyId: number;
  private currentResourceId: number;
  private currentProgressId: number;
  private currentModuleId: number;
  private currentTestimonialId: number;

  constructor() {
    this.users = new Map();
    this.departments = new Map();
    this.simulations = new Map();
    this.caseStudies = new Map();
    this.resources = new Map();
    this.progresses = new Map();
    this.modules = new Map();
    this.testimonials = new Map();

    this.currentUserId = 1;
    this.currentDepartmentId = 1;
    this.currentSimulationId = 1;
    this.currentCaseStudyId = 1;
    this.currentResourceId = 1;
    this.currentProgressId = 1;
    this.currentModuleId = 1;
    this.currentTestimonialId = 1;

    // Initialize with sample data
    this.initializeData();
  }

  private initializeData() {
    // Create sample departments
    const microbiology = this.createDepartment({
      name: "Microbiology",
      description: "Explore bacterial and viral culture techniques, learn identification methods, and practice antimicrobial susceptibility testing.",
      color: "#8e44ad",
      icon: "biotech",
      simulationCount: 12,
    });

    const clinicalChemistry = this.createDepartment({
      name: "Clinical Chemistry",
      description: "Analyze biochemical markers, perform enzyme assays, and interpret results for diagnostics of metabolic and organ function disorders.",
      color: "#e67e22",
      icon: "science",
      simulationCount: 15,
    });

    const histopathology = this.createDepartment({
      name: "Histopathology",
      description: "Study tissue preparation techniques, practice staining methods, and learn to identify cellular abnormalities in disease states.",
      color: "#c0392b",
      icon: "visibility",
      simulationCount: 9,
    });

    // Create sample simulations
    this.createSimulation({
      title: "Bacterial Culture & Identification",
      description: "Learn to isolate and identify common bacterial pathogens using culture techniques.",
      departmentId: microbiology.id,
      duration: "30-45 min",
      level: "Beginner",
      imagePath: "/microbiology-petri-dishes.jpg",
      objectives: ["Prepare culture media", "Inoculate specimens", "Identify bacterial growth patterns", "Perform biochemical tests"],
      procedure: [
        { step: "Prepare agar plates", description: "Prepare sterile agar plates for bacterial culture." },
        { step: "Inoculate specimen", description: "Using a sterile loop, streak the specimen onto the agar plate." },
        { step: "Incubate", description: "Incubate plates at 37°C for 24-48 hours." },
        { step: "Observe growth", description: "Examine colonies for morphology, size, and hemolysis patterns." },
        { step: "Biochemical testing", description: "Perform tests to identify bacterial species." }
      ],
      lowBandwidth: true,
      featured: false,
    });

    this.createSimulation({
      title: "Blood Glucose Analysis",
      description: "Perform glucose tolerance tests and interpret results for diabetes diagnosis.",
      departmentId: clinicalChemistry.id,
      duration: "20-30 min",
      level: "Beginner",
      imagePath: "/clinical-chemistry-analyzer.jpg",
      objectives: ["Prepare glucose standards", "Perform glucose oxidase test", "Create standard curve", "Analyze patient samples"],
      procedure: [
        { step: "Prepare reagents", description: "Prepare glucose oxidase reagent according to protocol." },
        { step: "Set up standards", description: "Prepare a series of glucose standards (0-300 mg/dL)." },
        { step: "Process samples", description: "Add patient samples to test tubes with reagent." },
        { step: "Incubate", description: "Incubate all tubes at 37°C for 10 minutes." },
        { step: "Measure absorbance", description: "Read absorbance at 540nm." },
        { step: "Calculate results", description: "Calculate glucose concentration using standard curve." }
      ],
      lowBandwidth: true,
      featured: false,
    });

    this.createSimulation({
      title: "Tissue Sample Processing",
      description: "Learn proper techniques for preparing and staining tissue samples for examination.",
      departmentId: histopathology.id,
      duration: "40-60 min",
      level: "Intermediate",
      imagePath: "/histopathology-slide.jpg",
      objectives: ["Fix tissue samples", "Process and embed samples", "Section tissues", "Stain slides", "Analyze microscopic features"],
      procedure: [
        { step: "Fixation", description: "Fix tissue sample in 10% neutral buffered formalin." },
        { step: "Processing", description: "Process through graded alcohols and xylene." },
        { step: "Embedding", description: "Embed in paraffin wax." },
        { step: "Sectioning", description: "Cut 4-5μm sections using microtome." },
        { step: "H&E Staining", description: "Stain with hematoxylin and eosin." },
        { step: "Mounting", description: "Apply coverslip and examine." }
      ],
      lowBandwidth: false,
      featured: false,
    });

    // Featured simulation
    this.createSimulation({
      title: "Malaria Parasite Identification",
      description: "Practice identifying various stages of malaria parasites in blood smears, learn morphological characteristics of different Plasmodium species, and develop diagnostic skills for this critical infectious disease.",
      departmentId: microbiology.id,
      duration: "60-90 min",
      level: "Intermediate",
      imagePath: "/malaria-microscope.jpg",
      objectives: ["Identify four Plasmodium species", "Recognize parasite life stages", "Calculate parasitemia levels", "Document findings accurately"],
      procedure: [
        { step: "Prepare thin blood smear", description: "Place a drop of blood on a slide and spread it thinly." },
        { step: "Fix the smear", description: "Air dry and fix with methanol." },
        { step: "Stain with Giemsa", description: "Apply Giemsa stain according to protocol." },
        { step: "Microscopic examination", description: "Examine using 100x oil immersion objective." },
        { step: "Identify species", description: "Identify Plasmodium species based on morphology." },
        { step: "Calculate parasitemia", description: "Count infected and uninfected RBCs to determine parasitemia." }
      ],
      lowBandwidth: true,
      featured: true,
    });

    // Create sample case studies
    this.createCaseStudy({
      title: "Suspected Typhoid Fever",
      description: "A 28-year-old male presents with fever, headache, and abdominal pain for 7 days.",
      departmentId: microbiology.id,
      duration: "45 min",
      status: "New",
    });

    this.createCaseStudy({
      title: "Elevated Liver Enzymes",
      description: "A 45-year-old female with fatigue, jaundice, and elevated ALT/AST levels.",
      departmentId: clinicalChemistry.id,
      duration: "30 min",
      status: "In Progress",
    });

    // Create sample resources
    this.createResource({
      title: "Laboratory Procedures",
      description: "Step-by-step guides for common lab procedures with visual aids",
      type: "Guide",
      icon: "menu_book",
    });

    this.createResource({
      title: "Video Tutorials",
      description: "Watch expert demonstrations of complex laboratory techniques",
      type: "Video",
      icon: "video_library",
    });

    this.createResource({
      title: "Practice Assessments",
      description: "Test your knowledge with case-based quizzes and exercises",
      type: "Assessment",
      icon: "quiz",
    });

    this.createResource({
      title: "Offline Resources",
      description: "Downloadable PDFs and materials for low-bandwidth areas",
      type: "Download",
      icon: "download",
    });

    // Create sample modules
    this.createModule({
      title: "Specimen Collection & Processing",
      description: "Learn proper specimen collection techniques and processing methods",
      totalLabs: 5,
      order: 3,
      prerequisiteId: 2,
    });

    this.createModule({
      title: "Microscopy Techniques",
      description: "Master essential microscopy skills for laboratory diagnosis",
      totalLabs: 4,
      order: 4,
      prerequisiteId: 3,
    });

    this.createModule({
      title: "Basic Hematology Tests",
      description: "Perform common hematology tests and interpret results",
      totalLabs: 6,
      order: 5,
      prerequisiteId: 4,
    });

    // Create sample testimonials
    this.createTestimonial({
      name: "Dr. James Mwangi",
      role: "Medical Laboratory Sciences Instructor",
      institution: "University of Nairobi",
      country: "Kenya",
      text: "This platform has revolutionized how we teach laboratory skills in our program. Students can practice techniques repeatedly without consuming expensive reagents or worrying about making mistakes.",
      rating: 5,
    });

    this.createTestimonial({
      name: "Amina Sanchez",
      role: "Medical Laboratory Student",
      institution: "Universidad Nacional",
      country: "Colombia",
      text: "The virtual simulations helped me build confidence before handling real specimens. I especially appreciate the detailed feedback and ability to work at my own pace through complex procedures.",
      rating: 4.5,
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Department methods
  async getAllDepartments(): Promise<Department[]> {
    return Array.from(this.departments.values());
  }

  async getDepartment(id: number): Promise<Department | undefined> {
    return this.departments.get(id);
  }

  async createDepartment(insertDepartment: InsertDepartment): Promise<Department> {
    const id = this.currentDepartmentId++;
    const department: Department = { ...insertDepartment, id };
    this.departments.set(id, department);
    return department;
  }

  // Simulation methods
  async getAllSimulations(): Promise<Simulation[]> {
    return Array.from(this.simulations.values());
  }

  async getSimulationsByDepartment(departmentId: number): Promise<Simulation[]> {
    return Array.from(this.simulations.values()).filter(
      (simulation) => simulation.departmentId === departmentId,
    );
  }

  async getSimulation(id: number): Promise<Simulation | undefined> {
    return this.simulations.get(id);
  }

  async createSimulation(insertSimulation: InsertSimulation): Promise<Simulation> {
    const id = this.currentSimulationId++;
    const simulation: Simulation = { ...insertSimulation, id };
    this.simulations.set(id, simulation);
    return simulation;
  }

  async getFeaturedSimulation(): Promise<Simulation | undefined> {
    return Array.from(this.simulations.values()).find(
      (simulation) => simulation.featured,
    );
  }

  async getQuickStartSimulations(limit: number): Promise<Simulation[]> {
    return Array.from(this.simulations.values())
      .filter(simulation => !simulation.featured)
      .slice(0, limit);
  }

  // Case study methods
  async getAllCaseStudies(): Promise<CaseStudy[]> {
    return Array.from(this.caseStudies.values());
  }

  async getCaseStudiesByDepartment(departmentId: number): Promise<CaseStudy[]> {
    return Array.from(this.caseStudies.values()).filter(
      (caseStudy) => caseStudy.departmentId === departmentId,
    );
  }

  async getCaseStudy(id: number): Promise<CaseStudy | undefined> {
    return this.caseStudies.get(id);
  }

  async createCaseStudy(insertCaseStudy: InsertCaseStudy): Promise<CaseStudy> {
    const id = this.currentCaseStudyId++;
    const caseStudy: CaseStudy = { ...insertCaseStudy, id };
    this.caseStudies.set(id, caseStudy);
    return caseStudy;
  }

  async getRecentCaseStudies(limit: number): Promise<CaseStudy[]> {
    return Array.from(this.caseStudies.values()).slice(0, limit);
  }

  // Resource methods
  async getAllResources(): Promise<Resource[]> {
    return Array.from(this.resources.values());
  }

  async getResource(id: number): Promise<Resource | undefined> {
    return this.resources.get(id);
  }

  async createResource(insertResource: InsertResource): Promise<Resource> {
    const id = this.currentResourceId++;
    const resource: Resource = { ...insertResource, id };
    this.resources.set(id, resource);
    return resource;
  }

  // Progress methods
  async getUserProgress(userId: number): Promise<Progress[]> {
    return Array.from(this.progresses.values()).filter(
      (progress) => progress.userId === userId,
    );
  }

  async getSimulationProgress(userId: number, simulationId: number): Promise<Progress | undefined> {
    return Array.from(this.progresses.values()).find(
      (progress) => progress.userId === userId && progress.simulationId === simulationId,
    );
  }

  async createProgress(insertProgress: InsertProgress): Promise<Progress> {
    const id = this.currentProgressId++;
    const progress: Progress = { ...insertProgress, id };
    this.progresses.set(id, progress);
    return progress;
  }

  async updateProgress(id: number, updatedProgress: Partial<InsertProgress>): Promise<Progress> {
    const progress = this.progresses.get(id);
    if (!progress) {
      throw new Error(`Progress with id ${id} not found`);
    }
    
    const updated = { ...progress, ...updatedProgress };
    this.progresses.set(id, updated);
    return updated;
  }

  // Module methods
  async getAllModules(): Promise<Module[]> {
    return Array.from(this.modules.values());
  }

  async getModule(id: number): Promise<Module | undefined> {
    return this.modules.get(id);
  }

  async createModule(insertModule: InsertModule): Promise<Module> {
    const id = this.currentModuleId++;
    const module: Module = { ...insertModule, id };
    this.modules.set(id, module);
    return module;
  }

  // Testimonial methods
  async getAllTestimonials(): Promise<Testimonial[]> {
    return Array.from(this.testimonials.values());
  }

  async getTestimonial(id: number): Promise<Testimonial | undefined> {
    return this.testimonials.get(id);
  }

  async createTestimonial(insertTestimonial: InsertTestimonial): Promise<Testimonial> {
    const id = this.currentTestimonialId++;
    const testimonial: Testimonial = { ...insertTestimonial, id };
    this.testimonials.set(id, testimonial);
    return testimonial;
  }
}

export const storage = new MemStorage();
