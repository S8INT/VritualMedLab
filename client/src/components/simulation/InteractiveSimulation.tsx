import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getDemoImage } from '@/data/images';

interface SimulationStep {
  id: number;
  name: string;
  description: string;
  image: string;
  tools: Array<{
    id: number;
    name: string;
    icon: string;
  }>;
  targets: Array<{
    id: number;
    position: { x: number; y: number };
    size: { width: number; height: number };
  }>;
  feedback: {
    success: string;
    error: string;
  };
}

interface InteractiveSimulationProps {
  departmentType: string;
  currentStep: number;
  onComplete: (results: any) => void;
}

export function InteractiveSimulation({ 
  departmentType, 
  currentStep,
  onComplete
}: InteractiveSimulationProps) {
  const [isActive, setIsActive] = useState(false);
  const [selectedTool, setSelectedTool] = useState<number | null>(null);
  const [completedTargets, setCompletedTargets] = useState<number[]>([]);
  const [simulationFeedback, setSimulationFeedback] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [simulationResults, setSimulationResults] = useState<any>({});

  // Define simulation steps based on department
  const simulationSteps = getSimulationSteps(departmentType);
  
  // Current simulation step
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

  // Render the simulation container
  const renderSimulationContainer = () => {
    if (!isActive) {
      return (
        <div className="aspect-video relative overflow-hidden bg-black">
          <img 
            src={getDemoImage(departmentType)} 
            alt="Laboratory simulation"
            className="w-full h-full object-cover opacity-90" 
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <Button className="bg-white/90 hover:bg-white text-gray-900" onClick={handleStartSimulation}>
              <span className="material-icons mr-2">play_arrow</span>
              Start Interactive Simulation
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="aspect-video relative overflow-hidden bg-gray-900">
        <img 
          src={currentSimulation.image || getDemoImage(departmentType)} 
          alt={currentSimulation.name}
          className="w-full h-full object-cover" 
        />
        
        {/* Tool Selection */}
        <div className="absolute bottom-4 left-4 flex gap-2 bg-black/50 p-2 rounded-md">
          {currentSimulation.tools.map(tool => (
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
        {currentSimulation.targets.map(target => (
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
    <>
      {renderSimulationContainer()}
      
      {/* Instructions */}
      <div className="p-4 bg-muted/30 border-t border-border">
        <h3 className="font-medium mb-2">Current Task: {currentSimulation.name}</h3>
        <p className="text-sm text-muted-foreground">{currentSimulation.description}</p>
      </div>
    </>
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