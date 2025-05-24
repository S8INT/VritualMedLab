import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { getDemoImage } from '@/data/images';
import { 
  SimulationStep, 
  LabScenario, 
  getScenarioById, 
  getScenariosByDepartment 
} from '@/data/simulationScenarios';

interface InteractiveSimulationProps {
  departmentType: string;
  currentStep: number;
  simulationId?: number;
  onComplete: (results: any) => void;
}

export function InteractiveSimulation({ 
  departmentType, 
  currentStep,
  simulationId = 1, // Default to first scenario if not specified
  onComplete
}: InteractiveSimulationProps) {
  const [isActive, setIsActive] = useState(false);
  const [selectedTool, setSelectedTool] = useState<number | null>(null);
  const [completedTargets, setCompletedTargets] = useState<number[]>([]);
  const [simulationFeedback, setSimulationFeedback] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [simulationResults, setSimulationResults] = useState<any>({});
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const [infoPanelContent, setInfoPanelContent] = useState<'patient' | 'procedure' | 'tools' | 'safety'>('patient');

  // Get the appropriate scenario based on department and ID
  const scenario = simulationId 
    ? getScenarioById(simulationId) 
    : getScenariosByDepartment(departmentType)[0];
  
  // Current simulation step
  const simulationSteps = scenario?.procedure || [];
  const currentSimulation = simulationSteps[currentStep];

  // Reset the simulation when the step changes
  useEffect(() => {
    setIsActive(false);
    setSelectedTool(null);
    setCompletedTargets([]);
    setSimulationFeedback('');
    setShowFeedback(false);
  }, [currentStep]);

  // Handle starting the simulation
  const handleStartSimulation = () => {
    setIsActive(true);
  };

  // Handle tool selection
  const handleToolSelect = (toolId: number) => {
    setSelectedTool(toolId);
  };

  // Handle clicking on a target in the simulation
  const handleTargetClick = (targetId: number) => {
    if (!selectedTool) {
      setSimulationFeedback('Please select a tool first');
      setShowFeedback(true);
      setTimeout(() => setShowFeedback(false), 3000);
      return;
    }

    // Check if the target is already completed
    if (completedTargets.includes(targetId)) {
      setSimulationFeedback('You have already completed this step');
      setShowFeedback(true);
      setTimeout(() => setShowFeedback(false), 3000);
      return;
    }

    // Add target to completed targets
    setCompletedTargets([...completedTargets, targetId]);
    
    // Display success feedback
    setSimulationFeedback(currentSimulation.feedback.success);
    setShowFeedback(true);
    
    // Hide feedback after 3 seconds
    setTimeout(() => setShowFeedback(false), 3000);

    // Check if all targets are completed
    if (completedTargets.length + 1 === currentSimulation.targets.length) {
      // Generate simulation results
      const results = {
        stepId: currentSimulation.id,
        completionTime: new Date().toISOString(),
        accuracy: 100, // In a real app, this would be calculated
        notes: `Successfully completed ${currentSimulation.name}`,
      };
      
      setSimulationResults(results);
      
      // Notify parent component of completion
      setTimeout(() => {
        onComplete(results);
      }, 1000);
    }
  };

  // Render clinical case information panel
  const renderInfoPanel = () => {
    if (!scenario) return null;
    
    return (
      <Card className="mb-4 overflow-hidden">
        <CardContent className="p-0">
          <Tabs defaultValue={infoPanelContent} onValueChange={(v) => setInfoPanelContent(v as any)}>
            <TabsList className="w-full bg-muted/50 rounded-none p-0 h-10">
              <TabsTrigger value="patient" className="flex-1 rounded-none h-full">
                Patient Info
              </TabsTrigger>
              <TabsTrigger value="procedure" className="flex-1 rounded-none h-full">
                Procedure
              </TabsTrigger>
              <TabsTrigger value="tools" className="flex-1 rounded-none h-full">
                Tools
              </TabsTrigger>
              <TabsTrigger value="safety" className="flex-1 rounded-none h-full">
                Safety
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="patient" className="p-4 space-y-3">
              <div>
                <Badge variant="outline" className="mb-2">{scenario.department}</Badge>
                <h3 className="text-lg font-medium">{scenario.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{scenario.description}</p>
              </div>
              
              <div className="space-y-2 mt-3">
                <h4 className="text-sm font-medium">Patient Details</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Age: <span className="text-muted-foreground">{scenario.patientInfo.age}</span></div>
                  <div>Gender: <span className="text-muted-foreground">{scenario.patientInfo.gender}</span></div>
                </div>
                
                <div className="mt-2">
                  <h4 className="text-sm font-medium">Symptoms</h4>
                  <ul className="list-disc list-inside text-sm text-muted-foreground ml-2">
                    {scenario.patientInfo.symptoms.map((symptom, idx) => (
                      <li key={idx}>{symptom}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="mt-2">
                  <h4 className="text-sm font-medium">Medical History</h4>
                  <p className="text-sm text-muted-foreground">{scenario.patientInfo.medicalHistory}</p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="procedure" className="p-4 space-y-3">
              <div>
                <h3 className="text-lg font-medium">Procedure Steps</h3>
                <p className="text-sm text-muted-foreground">Complete all steps in sequence</p>
              </div>
              
              <div className="space-y-2">
                {scenario.procedure.map((step, idx) => (
                  <div 
                    key={step.id} 
                    className={`p-2 border rounded-md ${idx === currentStep ? 'border-primary bg-primary/5' : 'border-border'}`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">{step.name}</h4>
                      {idx < currentStep ? (
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Completed</Badge>
                      ) : idx === currentStep ? (
                        <Badge variant="outline" className="text-xs">Current</Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs bg-muted/50">Pending</Badge>
                      )}
                    </div>
                    {idx === currentStep && (
                      <p className="text-xs text-muted-foreground mt-1">{step.description}</p>
                    )}
                  </div>
                ))}
              </div>
              
              {currentSimulation?.scientificPrinciple && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md">
                  <h4 className="text-sm font-medium">Scientific Principle</h4>
                  <p className="text-xs text-muted-foreground">{currentSimulation.scientificPrinciple}</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="tools" className="p-4 space-y-3">
              <div>
                <h3 className="text-lg font-medium">Required Tools</h3>
                <p className="text-sm text-muted-foreground">Select the appropriate tool for each step</p>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {currentSimulation?.tools.map(tool => (
                  <div key={tool.id} className="border rounded-md p-2 flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="material-icons text-primary">{tool.icon}</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">{tool.name}</h4>
                    </div>
                  </div>
                ))}
              </div>
              
              {currentSimulation?.detailedInstructions && (
                <div className="mt-3">
                  <h4 className="text-sm font-medium">Detailed Instructions</h4>
                  <ul className="list-disc list-inside text-xs text-muted-foreground ml-2 space-y-1 mt-1">
                    {currentSimulation.detailedInstructions.map((instruction, idx) => (
                      <li key={idx}>{instruction}</li>
                    ))}
                  </ul>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="safety" className="p-4 space-y-3">
              <div>
                <h3 className="text-lg font-medium">Safety Guidelines</h3>
                <p className="text-sm text-muted-foreground">Follow these precautions during the procedure</p>
              </div>
              
              {currentSimulation?.safetyNotes ? (
                <div className="space-y-2">
                  <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 rounded-md">
                    <h4 className="text-sm font-medium text-red-600 dark:text-red-400">Safety Notes</h4>
                    <ul className="list-disc list-inside text-xs text-muted-foreground ml-2 mt-1 space-y-1">
                      {currentSimulation.safetyNotes.map((note, idx) => (
                        <li key={idx}>{note}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-900 rounded-md">
                  <h4 className="text-sm font-medium">Standard Laboratory Safety</h4>
                  <ul className="list-disc list-inside text-xs text-muted-foreground ml-2 mt-1 space-y-1">
                    <li>Always wear appropriate PPE (gloves, lab coat, eye protection)</li>
                    <li>Dispose of biological waste in designated containers</li>
                    <li>Keep work area clean and organized</li>
                    <li>Wash hands before and after handling specimens</li>
                    <li>Report any accidents or spills immediately</li>
                  </ul>
                </div>
              )}
              
              {currentSimulation?.commonErrors && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-900 rounded-md">
                  <h4 className="text-sm font-medium text-amber-700 dark:text-amber-400">Common Errors to Avoid</h4>
                  <ul className="list-disc list-inside text-xs text-muted-foreground ml-2 mt-1 space-y-1">
                    {currentSimulation.commonErrors.map((error, idx) => (
                      <li key={idx}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    );
  };

  // Render the simulation container
  const renderSimulationContainer = () => {
    if (!isActive) {
      return (
        <div className="aspect-video relative overflow-hidden bg-black">
          <img 
            src={scenario?.specimens[0]?.image || getDemoImage(departmentType)} 
            alt="Laboratory simulation"
            className="w-full h-full object-cover opacity-90" 
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-4">
              <h2 className="text-white text-xl font-bold drop-shadow-md">
                {scenario?.title || "Laboratory Simulation"}
              </h2>
              <Button className="bg-white/90 hover:bg-white text-gray-900" onClick={handleStartSimulation}>
                <span className="material-icons mr-2">play_arrow</span>
                Start Interactive Simulation
              </Button>
            </div>
          </div>
          
          {/* Specimen Information Badge */}
          {scenario?.specimens && (
            <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-2 rounded-md text-sm max-w-[60%]">
              <div className="font-medium">Specimen:</div>
              <div className="text-xs">{scenario.specimens[0].type} - {scenario.specimens[0].appearance}</div>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="aspect-video relative overflow-hidden bg-gray-900">
        <img 
          src={currentSimulation?.image || getDemoImage(departmentType)} 
          alt={currentSimulation?.name || "Laboratory procedure"}
          className="w-full h-full object-cover" 
        />
        
        {/* Tool Selection */}
        <div className="absolute bottom-4 left-4 flex gap-2 bg-black/50 p-2 rounded-md">
          {currentSimulation?.tools.map(tool => (
            <Button 
              key={tool.id}
              size="sm" 
              variant={selectedTool === tool.id ? "default" : "outline"} 
              className={`${selectedTool === tool.id ? "bg-primary" : "bg-white/80 hover:bg-white"} text-gray-900`}
              onClick={() => handleToolSelect(tool.id)}
            >
              <span className="material-icons text-sm mr-1">{tool.icon}</span>
              {tool.name}
            </Button>
          ))}
        </div>
        
        {/* Interactive targets */}
        {currentSimulation?.targets.map(target => (
          <div
            key={target.id}
            onClick={() => handleTargetClick(target.id)}
            className={`absolute cursor-pointer ${completedTargets.includes(target.id) ? 'bg-green-500/30 border-green-500' : 'bg-blue-500/10 border-blue-500/50 hover:bg-blue-500/30'} border-2 border-dashed rounded-md`}
            style={{
              left: `${target.position.x}%`,
              top: `${target.position.y}%`,
              width: `${target.size.width}%`,
              height: `${target.size.height}%`,
            }}
          />
        ))}
        
        {/* Feedback message */}
        {showFeedback && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-md">
            {simulationFeedback}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Toggle for info panel */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">
          {scenario?.title || `${departmentType} Lab Simulation`}
        </h2>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setShowInfoPanel(!showInfoPanel)}
          className="text-sm"
        >
          <span className="material-icons text-sm mr-1">
            {showInfoPanel ? 'visibility_off' : 'visibility'}
          </span>
          {showInfoPanel ? 'Hide Details' : 'Show Details'}
        </Button>
      </div>
      
      {/* Info panel */}
      {showInfoPanel && renderInfoPanel()}
      
      {/* Simulation container */}
      {renderSimulationContainer()}
      
      {/* Instructions */}
      <div className="p-4 bg-muted/30 border border-border rounded-md">
        <div className="flex justify-between items-center">
          <h3 className="font-medium">Current Task: {currentSimulation?.name}</h3>
          <Badge variant="outline">Step {currentStep + 1} of {simulationSteps.length}</Badge>
        </div>
        <Separator className="my-2" />
        <p className="text-sm text-muted-foreground">{currentSimulation?.description}</p>
        
        {currentSimulation?.detailedInstructions && isActive && (
          <div className="mt-3 pt-3 border-t border-border">
            <details className="text-sm">
              <summary className="font-medium cursor-pointer">Detailed Instructions</summary>
              <ul className="mt-2 space-y-1 list-disc list-inside text-muted-foreground">
                {currentSimulation.detailedInstructions.map((instruction, idx) => (
                  <li key={idx}>{instruction}</li>
                ))}
              </ul>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function to get simulation steps based on department type
function getSimulationSteps(departmentType: string): SimulationStep[] {
  // Default steps for all departments
  const defaultSteps: SimulationStep[] = [
    {
      id: 1,
      name: "Prepare the workspace",
      description: "Clean and sanitize your work area. Gather all necessary equipment and materials.",
      image: getDemoImage('workstations'),
      tools: [
        { id: 1, name: "Gloves", icon: "cleaning_services" },
        { id: 2, name: "Sanitizer", icon: "sanitizer" }
      ],
      targets: [
        { id: 1, position: { x: 10, y: 20 }, size: { width: 20, height: 20 } },
        { id: 2, position: { x: 60, y: 40 }, size: { width: 30, height: 20 } }
      ],
      feedback: {
        success: "Workspace successfully prepared!",
        error: "Please ensure all areas are properly cleaned."
      }
    }
  ];

  // Department-specific steps
  switch (departmentType) {
    case 'microbiology':
      return [
        ...defaultSteps,
        {
          id: 2,
          name: "Prepare culture media",
          description: "Select appropriate agar plates for the specimen. Label the plates with specimen details.",
          image: getDemoImage('equipment'),
          tools: [
            { id: 1, name: "Agar Plate", icon: "science" },
            { id: 2, name: "Marker", icon: "edit" }
          ],
          targets: [
            { id: 1, position: { x: 20, y: 30 }, size: { width: 25, height: 15 } },
            { id: 2, position: { x: 70, y: 20 }, size: { width: 20, height: 20 } }
          ],
          feedback: {
            success: "Culture media successfully prepared!",
            error: "Incorrect media selection for this specimen."
          }
        },
        {
          id: 3,
          name: "Inoculate specimen",
          description: "Using a sterile loop, streak the specimen onto the agar plate using the standard streaking technique.",
          image: getDemoImage('specimens'),
          tools: [
            { id: 1, name: "Inoculation Loop", icon: "gesture" },
            { id: 2, name: "Bunsen Burner", icon: "local_fire_department" }
          ],
          targets: [
            { id: 1, position: { x: 40, y: 40 }, size: { width: 30, height: 30 } }
          ],
          feedback: {
            success: "Specimen successfully inoculated!",
            error: "Improper streaking technique."
          }
        }
      ];
    case 'clinical-chemistry':
      return [
        ...defaultSteps,
        {
          id: 2,
          name: "Prepare reagents",
          description: "Prepare glucose oxidase reagent according to protocol. Ensure all reagents are at room temperature.",
          image: getDemoImage('clinicalChemistry'),
          tools: [
            { id: 1, name: "Pipette", icon: "colorize" },
            { id: 2, name: "Test Tube", icon: "science" }
          ],
          targets: [
            { id: 1, position: { x: 30, y: 50 }, size: { width: 20, height: 20 } },
            { id: 2, position: { x: 60, y: 30 }, size: { width: 15, height: 25 } }
          ],
          feedback: {
            success: "Reagents successfully prepared!",
            error: "Incorrect reagent preparation."
          }
        },
        {
          id: 3,
          name: "Set up standards",
          description: "Prepare a series of glucose standards (0-300 mg/dL) for the calibration curve.",
          image: getDemoImage('equipment'),
          tools: [
            { id: 1, name: "Micropipette", icon: "colorize" },
            { id: 2, name: "Standard Solution", icon: "opacity" }
          ],
          targets: [
            { id: 1, position: { x: 20, y: 40 }, size: { width: 15, height: 20 } },
            { id: 2, position: { x: 40, y: 40 }, size: { width: 15, height: 20 } },
            { id: 3, position: { x: 60, y: 40 }, size: { width: 15, height: 20 } }
          ],
          feedback: {
            success: "Standards successfully set up!",
            error: "Incorrect standard preparation."
          }
        }
      ];
    case 'histopathology':
      return [
        ...defaultSteps,
        {
          id: 2,
          name: "Fixation",
          description: "Fix tissue sample in 10% neutral buffered formalin for the appropriate time period.",
          image: getDemoImage('histopathology'),
          tools: [
            { id: 1, name: "Formalin", icon: "science" },
            { id: 2, name: "Container", icon: "inventory_2" }
          ],
          targets: [
            { id: 1, position: { x: 40, y: 50 }, size: { width: 25, height: 25 } }
          ],
          feedback: {
            success: "Tissue successfully fixed!",
            error: "Improper fixation technique."
          }
        },
        {
          id: 3,
          name: "Processing",
          description: "Process tissue through graded alcohols and xylene for dehydration and clearing.",
          image: getDemoImage('equipment'),
          tools: [
            { id: 1, name: "Alcohol Series", icon: "science" },
            { id: 2, name: "Tissue Processor", icon: "settings" }
          ],
          targets: [
            { id: 1, position: { x: 30, y: 30 }, size: { width: 20, height: 30 } },
            { id: 2, position: { x: 60, y: 40 }, size: { width: 30, height: 20 } }
          ],
          feedback: {
            success: "Tissue successfully processed!",
            error: "Incorrect processing sequence."
          }
        }
      ];
    default:
      return defaultSteps;
  }
}