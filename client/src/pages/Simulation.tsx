import { useState } from "react";
import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";

import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

import { Department, Simulation as SimulationType } from "@shared/schema";
import { getDemoImage } from "@/data/images";
import { InteractiveSimulation } from "@/components/simulation/InteractiveSimulation";
import { LabReport } from "@/components/simulation/LabReport";

export default function Simulation() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [showLabReport, setShowLabReport] = useState(false);
  const [simulationResults, setSimulationResults] = useState<any[]>([]);
  const { toast } = useToast();
  
  const [match, params] = useRoute("/simulations/:id");
  const id = params?.id;
  const simulationId = id ? parseInt(id) : 0;

  // Fetch simulation details
  const { data: simulation, isLoading: isLoadingSimulation } = useQuery<SimulationType>({
    queryKey: ["/api/simulations", simulationId],
    enabled: !!simulationId,
  });

  // Fetch departments for department info
  const { data: departments } = useQuery<Department[]>({
    queryKey: ["/api/departments"],
  });

  const department = simulation 
    ? departments?.find(d => d.id === simulation.departmentId) 
    : undefined;

  // Placeholder procedure steps if real ones aren't loaded yet
  const procedureSteps = simulation?.procedure as { step: string, description: string }[] || [];
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  // Handle simulation step completion
  const handleSimulationComplete = (results: any) => {
    // Add the results to our collection
    setSimulationResults(prev => [...prev, results]);
    
    // Move to the next step or show lab report if all steps completed
    if (currentStep < 2) { // Assuming we have 3 steps (0, 1, 2)
      setCurrentStep(prev => prev + 1);
      toast({
        title: "Step completed!",
        description: `You've completed the "${results.notes}" step.`,
      });
    } else {
      // All steps completed, show lab report
      setShowLabReport(true);
      toast({
        title: "Simulation completed!",
        description: "Please complete your lab report.",
      });
    }
  };
  
  // Handle saving lab report
  const handleSaveReport = (reportData: any) => {
    // In a real app, we would save this to the backend
    console.log("Lab report saved:", reportData);
    
    toast({
      title: "Lab report saved!",
      description: "Your lab report has been submitted successfully.",
    });
    
    // Reset the simulation state for a new session
    setCurrentStep(0);
    setShowLabReport(false);
    setSimulationResults([]);
  };

  const handleNextStep = () => {
    if (procedureSteps && activeStep < procedureSteps.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const getProgressPercentage = () => {
    if (!procedureSteps || procedureSteps.length === 0) return 0;
    return Math.round((activeStep / (procedureSteps.length - 1)) * 100);
  };

  const getDepartmentClass = () => {
    if (!department) return "bg-primary";
    
    const deptName = department.name.toLowerCase().replace(/\s+/g, '-');
    return `bg-${deptName}`;
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-black/20" onClick={toggleSidebar}></div>
          <div className="fixed inset-y-0 left-0 w-64 bg-card shadow-lg">
            <Sidebar />
          </div>
        </div>
      )}
      <Sidebar />

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header toggleSidebar={toggleSidebar} />

        {/* Content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          {isLoadingSimulation ? (
            <div className="flex items-center justify-center h-full">
              <p>Loading simulation...</p>
            </div>
          ) : simulation ? (
            <div className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                {/* Breadcrumb */}
                <div className="mb-4 flex items-center text-sm text-muted-foreground">
                  <Link href="/">
                    <a className="hover:text-foreground">Dashboard</a>
                  </Link>
                  <span className="mx-2">/</span>
                  {department && (
                    <>
                      <Link href={`/departments/${department.name.toLowerCase().replace(/\s+/g, '-')}`}>
                        <a className="hover:text-foreground">{department.name}</a>
                      </Link>
                      <span className="mx-2">/</span>
                    </>
                  )}
                  <span className="text-foreground">{simulation.title}</span>
                </div>

                {/* Simulation header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                  <div className="flex items-center">
                    {department && (
                      <div className={`w-12 h-12 ${getDepartmentClass()} rounded-md flex items-center justify-center mr-4`}>
                        <span className="material-icons text-white text-2xl">{department.icon}</span>
                      </div>
                    )}
                    <div>
                      <div className="flex items-center mb-1">
                        {department && (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-${department.name.toLowerCase().replace(/\s+/g, '-')} bg-opacity-10 text-${department.name.toLowerCase().replace(/\s+/g, '-')} mr-2`}>
                            {department.name}
                          </span>
                        )}
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-muted text-foreground">
                          {simulation.level}
                        </span>
                      </div>
                      <h1 className="text-2xl font-heading font-bold text-foreground">{simulation.title}</h1>
                    </div>
                  </div>
                  <div className="mt-3 md:mt-0 flex items-center">
                    <span className="flex items-center text-sm text-muted-foreground mr-4">
                      <span className="material-icons mr-1 text-sm">schedule</span>
                      {simulation.duration}
                    </span>
                    <Button variant="outline" size="sm">
                      <span className="material-icons mr-2 text-sm">help_outline</span>
                      Help
                    </Button>
                  </div>
                </div>

                {/* Simulation content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                  {/* Left column - Procedure */}
                  <div className="lg:col-span-2">
                    <Card>
                      <CardContent className="p-6">
                        <div className="mb-6">
                          <h2 className="text-lg font-heading font-semibold text-foreground mb-2">Simulation Progress</h2>
                          <div className="flex items-center">
                            <Progress value={getProgressPercentage()} className="flex-1 mr-4" />
                            <span className="text-sm text-muted-foreground whitespace-nowrap">{getProgressPercentage()}% Complete</span>
                          </div>
                        </div>

                        <div className="mb-6">
                          <h2 className="text-lg font-heading font-semibold text-foreground mb-4">Current Step: {procedureSteps[activeStep]?.step}</h2>
                          <p className="text-foreground mb-4">{procedureSteps[activeStep]?.description}</p>
                          
                          <div className="bg-muted p-4 rounded-md mb-4">
                            <h3 className="text-sm font-medium text-foreground mb-2">Instructions:</h3>
                            <p className="text-sm text-muted-foreground">Follow the on-screen instructions to complete this step. Use the equipment shown in the simulation window.</p>
                          </div>
                          
                          <div className="flex justify-between mt-8">
                            <Button 
                              variant="outline" 
                              onClick={handlePreviousStep}
                              disabled={activeStep === 0}
                            >
                              <span className="material-icons mr-2 text-sm">arrow_back</span>
                              Previous Step
                            </Button>
                            <Button 
                              variant="default" 
                              className={`${getDepartmentClass()} hover:bg-opacity-90 text-white`}
                              onClick={handleNextStep}
                              disabled={activeStep === procedureSteps.length - 1}
                            >
                              Next Step
                              <span className="material-icons ml-2 text-sm">arrow_forward</span>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Simulation interaction area */}
                    <Card className="mt-6">
                      <CardContent className="p-0">
                        <Tabs defaultValue="simulation" className="w-full">
                          <TabsList className="w-full rounded-none bg-muted/50 p-0 h-12">
                            <TabsTrigger value="simulation" className="flex-1 rounded-none h-full data-[state=active]:bg-card">Simulation</TabsTrigger>
                            <TabsTrigger value="microscope" className="flex-1 rounded-none h-full data-[state=active]:bg-card">Microscope View</TabsTrigger>
                            <TabsTrigger value="results" className="flex-1 rounded-none h-full data-[state=active]:bg-card">Results</TabsTrigger>
                          </TabsList>
                          <TabsContent value="simulation" className="p-0">
                            {!showLabReport ? (
                              <InteractiveSimulation
                                departmentType={department?.name.toLowerCase() || 'microbiology'}
                                currentStep={currentStep}
                                simulationId={department?.name.toLowerCase() === 'microbiology' ? 1 : 
                                            department?.name.toLowerCase() === 'clinical chemistry' ? 2 : 
                                            department?.name.toLowerCase() === 'histopathology' ? 3 : 1}
                                onComplete={handleSimulationComplete}
                              />
                            ) : (
                              <LabReport
                                simulationId={Number(id)}
                                simulationTitle={simulation?.title || ''}
                                departmentName={department?.name || ''}
                                simulationResults={simulationResults}
                                onSave={handleSaveReport}
                              />
                            )}
                          </TabsContent>
                          <TabsContent value="microscope" className="p-0">
                            <div className="aspect-video relative overflow-hidden bg-black">
                              <img 
                                src={getDemoImage('slides')} 
                                alt="Microscope view"
                                className="w-full h-full object-cover" 
                              />
                              <div className="absolute bottom-4 right-4 flex gap-2">
                                <Button size="sm" variant="secondary" className="bg-white/80 hover:bg-white text-gray-900">
                                  <span className="material-icons text-sm">zoom_in</span>
                                </Button>
                                <Button size="sm" variant="secondary" className="bg-white/80 hover:bg-white text-gray-900">
                                  <span className="material-icons text-sm">zoom_out</span>
                                </Button>
                                <Button size="sm" variant="secondary" className="bg-white/80 hover:bg-white text-gray-900">
                                  <span className="material-icons text-sm">fullscreen</span>
                                </Button>
                              </div>
                            </div>
                          </TabsContent>
                          <TabsContent value="results" className="p-6">
                            <div className="text-center py-12">
                              <p className="text-muted-foreground">Complete the procedure to view results</p>
                            </div>
                          </TabsContent>
                        </Tabs>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Right column - Info and Resources */}
                  <div className="lg:col-span-1">
                    <Card className="mb-6">
                      <CardContent className="p-6">
                        <h2 className="text-lg font-heading font-semibold text-foreground mb-4">Learning Objectives</h2>
                        <ul className="space-y-2">
                          {simulation?.objectives ? (simulation.objectives as string[]).map((objective, index) => (
                            <li key={index} className="flex items-start">
                              <span className="material-icons text-primary mr-2 text-sm">check_circle</span>
                              <span className="text-sm text-foreground">{objective}</span>
                            </li>
                          )) : (
                            <li className="text-sm text-muted-foreground">Loading objectives...</li>
                          )}
                        </ul>
                      </CardContent>
                    </Card>
                    
                    <Card className="mb-6">
                      <CardContent className="p-6">
                        <h2 className="text-lg font-heading font-semibold text-foreground mb-4">Procedure Overview</h2>
                        <ol className="space-y-3">
                          {procedureSteps.length > 0 ? (
                            procedureSteps.map((step, index) => (
                              <li key={index} className={`flex items-start ${index === activeStep ? 'font-medium text-primary' : 'text-foreground'}`}>
                                <div className={`flex-shrink-0 w-6 h-6 rounded-full ${index === activeStep ? 'bg-primary' : index < activeStep ? 'bg-primary/20' : 'bg-muted'} flex items-center justify-center mr-3`}>
                                  <span className={`text-xs ${index === activeStep ? 'text-white' : index < activeStep ? 'text-primary' : 'text-muted-foreground'}`}>{index + 1}</span>
                                </div>
                                <span className="text-sm">{step.step}</span>
                              </li>
                            ))
                          ) : (
                            <li className="text-sm text-muted-foreground">Loading procedure steps...</li>
                          )}
                        </ol>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-6">
                        <h2 className="text-lg font-heading font-semibold text-foreground mb-4">Resources</h2>
                        <ul className="space-y-3">
                          <li>
                            <a href="#" className="flex items-center text-sm text-primary hover:underline">
                              <span className="material-icons mr-2 text-sm">description</span>
                              Procedure Manual
                            </a>
                          </li>
                          <li>
                            <a href="#" className="flex items-center text-sm text-primary hover:underline">
                              <span className="material-icons mr-2 text-sm">video_library</span>
                              Video Tutorial
                            </a>
                          </li>
                          <li>
                            <a href="#" className="flex items-center text-sm text-primary hover:underline">
                              <span className="material-icons mr-2 text-sm">science</span>
                              Equipment Guide
                            </a>
                          </li>
                          <li>
                            <a href="#" className="flex items-center text-sm text-primary hover:underline">
                              <span className="material-icons mr-2 text-sm">school</span>
                              Related Theory
                            </a>
                          </li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p>Simulation not found</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
