import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { getDemoImage } from '@/data/images';

interface ReagentPreparationProps {
  reagentType?: 'buffer' | 'enzymatic' | 'standard' | 'calibrator';
  onComplete: (results: any) => void;
}

interface ChemicalComponent {
  id: string;
  name: string;
  formula: string;
  grade: string;
  required: boolean;
  defaultAmount: number;
  unit: string;
  min: number;
  max: number;
  precision: number;
}

interface Solution {
  id: string;
  name: string;
  pH: number | null;
  volume: number;
  unit: string;
  concentration: string;
  components: ChemicalComponent[];
}

interface ValidationResult {
  parameter: string;
  expected: string;
  actual: string;
  status: 'pass' | 'fail' | 'warning';
}

export function ReagentPreparation({ reagentType = 'buffer', onComplete }: ReagentPreparationProps) {
  const [activeTab, setActiveTab] = useState<string>('components');
  const [currentSolution, setCurrentSolution] = useState<Solution | null>(null);
  const [preparedSolution, setPreparedSolution] = useState<Record<string, number>>({});
  const [componentMeasurements, setComponentMeasurements] = useState<Record<string, number>>({});
  const [phMeasurement, setPhMeasurement] = useState<number | null>(null);
  const [finalVolume, setFinalVolume] = useState<number>(0);
  const [targetVolume, setTargetVolume] = useState<number>(0);
  const [isPreparationStarted, setIsPreparationStarted] = useState(false);
  const [isPreparationComplete, setIsPreparationComplete] = useState(false);
  const [isValidationStarted, setIsValidationStarted] = useState(false);
  const [isValidationComplete, setIsValidationComplete] = useState(false);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<string>('analytical');
  const [selectedWaterType, setSelectedWaterType] = useState<string>('type1');
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({
    'weighing': false,
    'dissolution': false,
    'ph_adjustment': false,
    'volume_adjustment': false,
    'filtration': false,
    'labeling': false
  });
  const [reagentLabel, setReagentLabel] = useState({
    name: '',
    preparer: '',
    date: '',
    expiration: '',
    lotNumber: '',
    storage: ''
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [stirringSpeed, setStirringSpeed] = useState(0);
  const [isStirring, setIsStirring] = useState(false);
  const [timer, setTimer] = useState<number | null>(null);
  const [waterTemperature, setWaterTemperature] = useState(22);
  const [solutionAppearance, setSolutionAppearance] = useState<string>('');
  
  const { toast } = useToast();

  // Available reagent templates based on type
  const reagentTemplates: Record<string, Solution[]> = {
    'buffer': [
      {
        id: 'phosphate-buffer',
        name: 'Phosphate Buffer (0.1M, pH 7.4)',
        pH: 7.4,
        volume: 1000,
        unit: 'mL',
        concentration: '0.1M',
        components: [
          {
            id: 'na2hpo4',
            name: 'Sodium phosphate dibasic (Na₂HPO₄)',
            formula: 'Na₂HPO₄',
            grade: 'analytical',
            required: true,
            defaultAmount: 11.36,
            unit: 'g',
            min: 11.3,
            max: 11.4,
            precision: 0.01
          },
          {
            id: 'kh2po4',
            name: 'Potassium phosphate monobasic (KH₂PO₄)',
            formula: 'KH₂PO₄',
            grade: 'analytical',
            required: true,
            defaultAmount: 2.72,
            unit: 'g',
            min: 2.7,
            max: 2.8,
            precision: 0.01
          },
          {
            id: 'water',
            name: 'Type I Ultrapure Water',
            formula: 'H₂O',
            grade: 'ultrapure',
            required: true,
            defaultAmount: 1000,
            unit: 'mL',
            min: 990,
            max: 1010,
            precision: 1
          }
        ]
      },
      {
        id: 'tris-buffer',
        name: 'Tris Buffer (0.05M, pH 8.0)',
        pH: 8.0,
        volume: 1000,
        unit: 'mL',
        concentration: '0.05M',
        components: [
          {
            id: 'tris',
            name: 'Tris(hydroxymethyl)aminomethane',
            formula: 'C₄H₁₁NO₃',
            grade: 'analytical',
            required: true,
            defaultAmount: 6.05,
            unit: 'g',
            min: 6.0,
            max: 6.1,
            precision: 0.01
          },
          {
            id: 'hcl',
            name: 'Hydrochloric acid (1M)',
            formula: 'HCl',
            grade: 'analytical',
            required: true,
            defaultAmount: 43,
            unit: 'mL',
            min: 40,
            max: 45,
            precision: 0.1
          },
          {
            id: 'water',
            name: 'Type I Ultrapure Water',
            formula: 'H₂O',
            grade: 'ultrapure',
            required: true,
            defaultAmount: 1000,
            unit: 'mL',
            min: 990,
            max: 1010,
            precision: 1
          }
        ]
      }
    ],
    'enzymatic': [
      {
        id: 'glucose-reagent',
        name: 'Glucose Reagent (Hexokinase Method)',
        pH: 7.5,
        volume: 500,
        unit: 'mL',
        concentration: 'Working Reagent',
        components: [
          {
            id: 'buffer',
            name: 'PIPES buffer, pH 7.5',
            formula: 'C8H18N2O6S2',
            grade: 'analytical',
            required: true,
            defaultAmount: 100,
            unit: 'mL',
            min: 99,
            max: 101,
            precision: 0.1
          },
          {
            id: 'atp',
            name: 'ATP (Adenosine Triphosphate)',
            formula: 'C10H16N5O13P3',
            grade: 'analytical',
            required: true,
            defaultAmount: 0.25,
            unit: 'g',
            min: 0.24,
            max: 0.26,
            precision: 0.001
          },
          {
            id: 'nad',
            name: 'NAD (Nicotinamide Adenine Dinucleotide)',
            formula: 'C21H27N7O14P2',
            grade: 'analytical',
            required: true,
            defaultAmount: 0.15,
            unit: 'g',
            min: 0.14,
            max: 0.16,
            precision: 0.001
          },
          {
            id: 'hexokinase',
            name: 'Hexokinase',
            formula: 'Enzyme',
            grade: 'reagent',
            required: true,
            defaultAmount: 1000,
            unit: 'U',
            min: 990,
            max: 1010,
            precision: 1
          },
          {
            id: 'g6pd',
            name: 'Glucose-6-Phosphate Dehydrogenase',
            formula: 'Enzyme',
            grade: 'reagent',
            required: true,
            defaultAmount: 1000,
            unit: 'U',
            min: 990,
            max: 1010,
            precision: 1
          },
          {
            id: 'preservative',
            name: 'Sodium Azide (Preservative)',
            formula: 'NaN3',
            grade: 'analytical',
            required: true,
            defaultAmount: 0.05,
            unit: 'g',
            min: 0.04,
            max: 0.06,
            precision: 0.001
          },
          {
            id: 'water',
            name: 'Type I Ultrapure Water',
            formula: 'H₂O',
            grade: 'ultrapure',
            required: true,
            defaultAmount: 400,
            unit: 'mL',
            min: 395,
            max: 405,
            precision: 1
          }
        ]
      }
    ],
    'standard': [
      {
        id: 'glucose-standard',
        name: 'Glucose Standard Solution (200 mg/dL)',
        pH: null,
        volume: 100,
        unit: 'mL',
        concentration: '200 mg/dL',
        components: [
          {
            id: 'glucose',
            name: 'D-Glucose, Anhydrous',
            formula: 'C6H12O6',
            grade: 'reference',
            required: true,
            defaultAmount: 0.2,
            unit: 'g',
            min: 0.199,
            max: 0.201,
            precision: 0.0001
          },
          {
            id: 'benzoic-acid',
            name: 'Benzoic Acid (Preservative)',
            formula: 'C7H6O2',
            grade: 'analytical',
            required: true,
            defaultAmount: 0.01,
            unit: 'g',
            min: 0.009,
            max: 0.011,
            precision: 0.0001
          },
          {
            id: 'water',
            name: 'Type I Ultrapure Water',
            formula: 'H₂O',
            grade: 'ultrapure',
            required: true,
            defaultAmount: 100,
            unit: 'mL',
            min: 99,
            max: 101,
            precision: 0.1
          }
        ]
      }
    ],
    'calibrator': [
      {
        id: 'multi-analyte-calibrator',
        name: 'Multi-Analyte Calibrator Level 2',
        pH: null,
        volume: 50,
        unit: 'mL',
        concentration: 'Level 2 Calibrator',
        components: [
          {
            id: 'glucose',
            name: 'D-Glucose, Anhydrous',
            formula: 'C6H12O6',
            grade: 'reference',
            required: true,
            defaultAmount: 0.15,
            unit: 'g',
            min: 0.149,
            max: 0.151,
            precision: 0.0001
          },
          {
            id: 'urea',
            name: 'Urea',
            formula: 'CH4N2O',
            grade: 'reference',
            required: true,
            defaultAmount: 0.03,
            unit: 'g',
            min: 0.0295,
            max: 0.0305,
            precision: 0.0001
          },
          {
            id: 'creatinine',
            name: 'Creatinine',
            formula: 'C4H7N3O',
            grade: 'reference',
            required: true,
            defaultAmount: 0.002,
            unit: 'g',
            min: 0.00195,
            max: 0.00205,
            precision: 0.00001
          },
          {
            id: 'human-serum',
            name: 'Human Serum Base',
            formula: 'Biological',
            grade: 'reference',
            required: true,
            defaultAmount: 50,
            unit: 'mL',
            min: 49.5,
            max: 50.5,
            precision: 0.1
          }
        ]
      }
    ]
  };

  // Initialize with first solution of selected type
  useEffect(() => {
    if (reagentTemplates[reagentType] && reagentTemplates[reagentType].length > 0) {
      const solution = reagentTemplates[reagentType][0];
      setCurrentSolution(solution);
      setTargetVolume(solution.volume);
      
      // Initialize component measurements with default values
      const initialMeasurements: Record<string, number> = {};
      solution.components.forEach(component => {
        initialMeasurements[component.id] = component.defaultAmount;
      });
      setComponentMeasurements(initialMeasurements);
      
      // Set pH measurement for solutions with pH requirement
      if (solution.pH !== null) {
        setPhMeasurement(solution.pH);
      }
    }
  }, [reagentType]);

  // Track progress
  useEffect(() => {
    if (isPreparationStarted) {
      const completedCount = Object.values(completedSteps).filter(Boolean).length;
      const totalSteps = Object.keys(completedSteps).length;
      const newProgress = Math.round((completedCount / totalSteps) * 100);
      setProgress(newProgress);
      
      if (newProgress === 100) {
        setIsPreparationComplete(true);
        toast({
          title: 'Reagent Preparation Complete',
          description: 'All preparation steps have been completed. You can now validate the reagent.'
        });
      }
    }
  }, [completedSteps, isPreparationStarted, toast]);

  // Update timer for stirring
  useEffect(() => {
    if (isStirring && timer !== null && timer > 0) {
      const interval = setInterval(() => {
        setTimer(prevTimer => {
          if (prevTimer === null || prevTimer <= 0) {
            clearInterval(interval);
            setIsStirring(false);
            return null;
          }
          return prevTimer - 1;
        });
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [isStirring, timer]);

  // Change current solution
  const selectSolution = (solutionId: string) => {
    const solution = reagentTemplates[reagentType].find(s => s.id === solutionId);
    if (solution) {
      setCurrentSolution(solution);
      setTargetVolume(solution.volume);
      setPhMeasurement(solution.pH);
      
      // Reset state for new solution
      setPreparedSolution({});
      setComponentMeasurements({});
      setIsPreparationStarted(false);
      setIsPreparationComplete(false);
      setIsValidationStarted(false);
      setIsValidationComplete(false);
      setValidationResults([]);
      setCompletedSteps({
        'weighing': false,
        'dissolution': false,
        'ph_adjustment': false,
        'volume_adjustment': false,
        'filtration': false,
        'labeling': false
      });
      setReagentLabel({
        name: '',
        preparer: '',
        date: '',
        expiration: '',
        lotNumber: '',
        storage: ''
      });
      setErrors([]);
      
      // Initialize component measurements with default values
      const initialMeasurements: Record<string, number> = {};
      solution.components.forEach(component => {
        initialMeasurements[component.id] = component.defaultAmount;
      });
      setComponentMeasurements(initialMeasurements);
    }
  };

  // Update component measurement
  const updateComponentMeasurement = (componentId: string, value: number) => {
    setComponentMeasurements(prev => ({
      ...prev,
      [componentId]: value
    }));
  };

  // Start reagent preparation
  const startPreparation = () => {
    setIsPreparationStarted(true);
    toast({
      title: 'Preparation Started',
      description: 'Follow the step-by-step procedure to prepare the reagent.'
    });
  };

  // Complete a preparation step
  const completeStep = (step: string) => {
    setCompletedSteps(prev => ({
      ...prev,
      [step]: true
    }));
    
    // Specific actions for certain steps
    if (step === 'weighing') {
      // Copy measurements to prepared solution
      setPreparedSolution({...componentMeasurements});
      
      toast({
        title: 'Components Weighed',
        description: 'All components have been accurately weighed and measured.'
      });
    }
    
    if (step === 'dissolution') {
      // Check stirring time
      if (timer === null || timer <= 0) {
        toast({
          title: 'Dissolution Complete',
          description: 'Components have been properly dissolved.'
        });
      }
    }
    
    if (step === 'ph_adjustment') {
      // Check if pH is within acceptable range
      if (currentSolution?.pH && phMeasurement) {
        const targetPh = currentSolution.pH;
        const phDifference = Math.abs(targetPh - phMeasurement);
        
        if (phDifference <= 0.1) {
          toast({
            title: 'pH Adjustment Complete',
            description: `pH successfully adjusted to ${phMeasurement.toFixed(1)}`
          });
        } else {
          toast({
            title: 'pH Adjustment Warning',
            description: `pH is ${phMeasurement.toFixed(1)}, which is outside the optimal range.`,
            variant: 'destructive'
          });
        }
      }
    }
    
    if (step === 'volume_adjustment') {
      // Check if final volume is correct
      const volumeDifference = Math.abs(targetVolume - finalVolume);
      const allowedError = targetVolume * 0.02; // 2% error margin
      
      if (volumeDifference <= allowedError) {
        toast({
          title: 'Volume Adjustment Complete',
          description: `Final volume adjusted to ${finalVolume} ${currentSolution?.unit}`
        });
      } else {
        toast({
          title: 'Volume Adjustment Warning',
          description: `Final volume is ${finalVolume} ${currentSolution?.unit}, which differs from the target.`,
          variant: 'destructive'
        });
      }
    }
    
    if (step === 'labeling') {
      // Check if all required label fields are filled
      const requiredFields = ['name', 'preparer', 'date', 'expiration'];
      const missingFields = requiredFields.filter(field => !reagentLabel[field as keyof typeof reagentLabel]);
      
      if (missingFields.length === 0) {
        toast({
          title: 'Labeling Complete',
          description: 'Reagent has been properly labeled with all required information.'
        });
      } else {
        toast({
          title: 'Labeling Warning',
          description: 'Some required label information is missing.',
          variant: 'destructive'
        });
      }
    }
  };

  // Start stirring the solution
  const startStirring = (duration: number) => {
    setIsStirring(true);
    setTimer(duration);
    
    toast({
      title: 'Stirring Started',
      description: `Stirring for ${duration} seconds at ${stirringSpeed} RPM`
    });
  };

  // Start validation procedure
  const startValidation = () => {
    if (!isPreparationComplete) {
      toast({
        title: 'Complete Preparation First',
        description: 'You must complete all preparation steps before validation.',
        variant: 'destructive'
      });
      return;
    }
    
    setIsValidationStarted(true);
    
    // Simulate validation procedure
    setTimeout(() => {
      // Generate validation results
      const results: ValidationResult[] = [];
      
      // Validate component measurements
      if (currentSolution) {
        currentSolution.components.forEach(component => {
          const actual = preparedSolution[component.id] || 0;
          const expected = component.defaultAmount;
          const allowedError = component.precision * 5; // 5x precision as error margin
          const difference = Math.abs(actual - expected);
          
          let status: 'pass' | 'fail' | 'warning';
          if (difference <= allowedError * 0.5) {
            status = 'pass';
          } else if (difference <= allowedError) {
            status = 'warning';
          } else {
            status = 'fail';
          }
          
          results.push({
            parameter: `${component.name} (${component.unit})`,
            expected: expected.toFixed(component.precision.toString().split('.')[1]?.length || 0),
            actual: actual.toFixed(component.precision.toString().split('.')[1]?.length || 0),
            status
          });
        });
        
        // Validate pH if applicable
        if (currentSolution.pH !== null && phMeasurement !== null) {
          const phDifference = Math.abs(currentSolution.pH - phMeasurement);
          
          let status: 'pass' | 'fail' | 'warning';
          if (phDifference <= 0.1) {
            status = 'pass';
          } else if (phDifference <= 0.2) {
            status = 'warning';
          } else {
            status = 'fail';
          }
          
          results.push({
            parameter: 'pH',
            expected: currentSolution.pH.toFixed(1),
            actual: phMeasurement.toFixed(1),
            status
          });
        }
        
        // Validate final volume
        const volumeDifference = Math.abs(targetVolume - finalVolume);
        const allowedVolumeError = targetVolume * 0.02; // 2% error margin
        
        let volumeStatus: 'pass' | 'fail' | 'warning';
        if (volumeDifference <= allowedVolumeError * 0.5) {
          volumeStatus = 'pass';
        } else if (volumeDifference <= allowedVolumeError) {
          volumeStatus = 'warning';
        } else {
          volumeStatus = 'fail';
        }
        
        results.push({
          parameter: `Final Volume (${currentSolution.unit})`,
          expected: targetVolume.toString(),
          actual: finalVolume.toString(),
          status: volumeStatus
        });
      }
      
      setValidationResults(results);
      setIsValidationComplete(true);
      
      // Calculate overall result
      const failCount = results.filter(r => r.status === 'fail').length;
      const warningCount = results.filter(r => r.status === 'warning').length;
      
      if (failCount === 0 && warningCount === 0) {
        toast({
          title: 'Validation Successful',
          description: 'All parameters meet the acceptance criteria. The reagent is ready for use.'
        });
        
        // If this is part of a guided workflow, report completion
        if (onComplete) {
          onComplete({
            type: 'reagent_preparation',
            reagentType,
            reagentName: currentSolution?.name,
            prepared: preparedSolution,
            validationResults: results,
            success: true,
            notes: 'Reagent preparation and validation completed successfully'
          });
        }
      } else if (failCount === 0) {
        toast({
          title: 'Validation Warning',
          description: `${warningCount} parameter(s) have minor deviations but are acceptable for use.`,
          variant: 'default'
        });
        
        // Report with warnings
        if (onComplete) {
          onComplete({
            type: 'reagent_preparation',
            reagentType,
            reagentName: currentSolution?.name,
            prepared: preparedSolution,
            validationResults: results,
            success: true,
            warnings: warningCount,
            notes: 'Reagent preparation completed with minor deviations'
          });
        }
      } else {
        toast({
          title: 'Validation Failed',
          description: `${failCount} parameter(s) do not meet acceptance criteria. The reagent cannot be used.`,
          variant: 'destructive'
        });
        
        // Report failure
        if (onComplete) {
          onComplete({
            type: 'reagent_preparation',
            reagentType,
            reagentName: currentSolution?.name,
            prepared: preparedSolution,
            validationResults: results,
            success: false,
            failures: failCount,
            notes: 'Reagent preparation failed validation'
          });
        }
      }
    }, 2000);
  };

  // Start over
  const resetPreparation = () => {
    // Reset all state
    setPreparedSolution({});
    setIsPreparationStarted(false);
    setIsPreparationComplete(false);
    setIsValidationStarted(false);
    setIsValidationComplete(false);
    setValidationResults([]);
    setCompletedSteps({
      'weighing': false,
      'dissolution': false,
      'ph_adjustment': false,
      'volume_adjustment': false,
      'filtration': false,
      'labeling': false
    });
    setErrors([]);
    
    // Reset to default measurements
    if (currentSolution) {
      const initialMeasurements: Record<string, number> = {};
      currentSolution.components.forEach(component => {
        initialMeasurements[component.id] = component.defaultAmount;
      });
      setComponentMeasurements(initialMeasurements);
      setPhMeasurement(currentSolution.pH);
    }
    
    toast({
      title: 'Preparation Reset',
      description: 'All progress has been reset. You can start again.'
    });
  };

  // Format label for reagent
  const formatLabel = () => {
    const today = new Date();
    const expirationDate = new Date(today);
    expirationDate.setMonth(expirationDate.getMonth() + 3); // Default 3 month expiration
    
    return `
      ${reagentLabel.name || currentSolution?.name || 'Reagent'}
      Prepared by: ${reagentLabel.preparer || 'Lab Technician'}
      Date: ${reagentLabel.date || today.toLocaleDateString()}
      Expiration: ${reagentLabel.expiration || expirationDate.toLocaleDateString()}
      Lot: ${reagentLabel.lotNumber || `LAB-${Date.now().toString().slice(-6)}`}
      Storage: ${reagentLabel.storage || 'Store at 2-8°C'}
    `;
  };

  // Determine solution appearance based on preparation steps
  useEffect(() => {
    if (!isPreparationStarted) {
      setSolutionAppearance('');
      return;
    }
    
    if (completedSteps.weighing && !completedSteps.dissolution) {
      setSolutionAppearance('Undissolved components visible in solution');
    } else if (completedSteps.dissolution && !completedSteps.filtration) {
      setSolutionAppearance('Components dissolved but solution appears slightly cloudy');
    } else if (completedSteps.filtration) {
      setSolutionAppearance('Clear solution with no visible particles');
    }
  }, [completedSteps, isPreparationStarted]);

  return (
    <div className="h-full flex flex-col">
      <div className="bg-gray-100 p-4 dark:bg-gray-800 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-2">
              <span className="material-icons text-white text-xs">science</span>
            </div>
            <div>
              <h2 className="text-lg font-medium">Reagent Preparation Station</h2>
              <p className="text-xs text-muted-foreground">
                {reagentType === 'buffer' ? 'Buffer Solutions' : 
                 reagentType === 'enzymatic' ? 'Enzymatic Reagents' :
                 reagentType === 'standard' ? 'Standard Solutions' : 
                 'Calibrator Preparation'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {!isPreparationStarted ? (
              <Button 
                onClick={startPreparation}
                className="bg-green-600 hover:bg-green-700"
              >
                Begin Preparation
              </Button>
            ) : (
              <div className="flex items-center">
                <Progress 
                  value={progress} 
                  className="w-32 h-2 mr-2" 
                />
                <span className="text-xs">{progress}% Complete</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="p-4 mb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">
            {currentSolution?.name || 'Select a solution'}
          </h2>
          
          <Select
            value={currentSolution?.id}
            onValueChange={selectSolution}
            disabled={isPreparationStarted}
          >
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Select a solution" />
            </SelectTrigger>
            <SelectContent>
              {reagentTemplates[reagentType].map((solution) => (
                <SelectItem key={solution.id} value={solution.id}>
                  {solution.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {currentSolution && (
          <div className="mt-2 text-sm text-muted-foreground">
            <p>
              {currentSolution.concentration} • {currentSolution.volume} {currentSolution.unit}
              {currentSolution.pH !== null && ` • pH ${currentSolution.pH}`}
            </p>
          </div>
        )}
      </div>
      
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col"
      >
        <TabsList className="justify-start rounded-none border-b bg-transparent p-0">
          <TabsTrigger
            value="components"
            className="rounded-none border-b-2 border-b-transparent px-4 py-2 data-[state=active]:border-b-primary"
          >
            Components
          </TabsTrigger>
          <TabsTrigger
            value="procedure"
            className="rounded-none border-b-2 border-b-transparent px-4 py-2 data-[state=active]:border-b-primary"
          >
            Procedure
          </TabsTrigger>
          <TabsTrigger
            value="validation"
            className="rounded-none border-b-2 border-b-transparent px-4 py-2 data-[state=active]:border-b-primary"
          >
            Validation
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="components" className="flex-1 p-4 overflow-auto">
          {currentSolution ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-medium mb-4">Reagent Components</h3>
                    
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Component</TableHead>
                          <TableHead>Formula</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentSolution.components.map(component => (
                          <TableRow key={component.id}>
                            <TableCell className="font-medium">{component.name}</TableCell>
                            <TableCell>{component.formula}</TableCell>
                            <TableCell className="text-right">
                              {!isPreparationStarted ? (
                                <div className="flex justify-end">
                                  <Input
                                    type="number"
                                    value={componentMeasurements[component.id] || component.defaultAmount}
                                    onChange={(e) => updateComponentMeasurement(component.id, parseFloat(e.target.value))}
                                    className="w-24 text-right"
                                    step={component.precision}
                                    min={0}
                                  />
                                  <span className="ml-2 flex items-center">{component.unit}</span>
                                </div>
                              ) : (
                                <span>
                                  {componentMeasurements[component.id]?.toFixed(
                                    component.precision.toString().split('.')[1]?.length || 0
                                  )} {component.unit}
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    
                    {!isPreparationStarted && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium mb-2">Reagent Grade Selection</h4>
                        
                        <RadioGroup 
                          value={selectedGrade} 
                          onValueChange={setSelectedGrade}
                          className="flex space-x-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="analytical" id="analytical" />
                            <Label htmlFor="analytical">Analytical Grade</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="reagent" id="reagent" />
                            <Label htmlFor="reagent">Reagent Grade</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="technical" id="technical" />
                            <Label htmlFor="technical">Technical Grade</Label>
                          </div>
                        </RadioGroup>
                        
                        <h4 className="text-sm font-medium mb-2 mt-4">Water Type Selection</h4>
                        
                        <RadioGroup 
                          value={selectedWaterType} 
                          onValueChange={setSelectedWaterType}
                          className="flex space-x-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="type1" id="type1" />
                            <Label htmlFor="type1">Type I (Ultrapure)</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="type2" id="type2" />
                            <Label htmlFor="type2">Type II (Analytical)</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="distilled" id="distilled" />
                            <Label htmlFor="distilled">Distilled</Label>
                          </div>
                        </RadioGroup>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                {isPreparationStarted && (
                  <Card className="mt-4">
                    <CardContent className="p-4">
                      <h3 className="font-medium mb-2">Solution Status</h3>
                      
                      <div className="space-y-3">
                        <div>
                          <Label className="text-sm">Appearance</Label>
                          <p className="text-sm text-muted-foreground">{solutionAppearance || 'N/A'}</p>
                        </div>
                        
                        {currentSolution.pH !== null && (
                          <div>
                            <div className="flex justify-between items-center">
                              <Label className="text-sm">pH Measurement</Label>
                              <div className="flex items-center">
                                <Input
                                  type="number"
                                  value={phMeasurement || ''}
                                  onChange={(e) => setPhMeasurement(parseFloat(e.target.value))}
                                  className="w-20 text-right"
                                  step={0.1}
                                  min={0}
                                  max={14}
                                  disabled={!completedSteps.dissolution || completedSteps.ph_adjustment}
                                />
                              </div>
                            </div>
                            {phMeasurement !== null && currentSolution.pH !== null && (
                              <div className="flex items-center mt-1">
                                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full ${
                                      Math.abs(phMeasurement - currentSolution.pH) <= 0.1
                                        ? 'bg-green-500'
                                        : Math.abs(phMeasurement - currentSolution.pH) <= 0.3
                                          ? 'bg-yellow-500'
                                          : 'bg-red-500'
                                    }`}
                                    style={{ 
                                      width: `${Math.min(phMeasurement / 14 * 100, 100)}%` 
                                    }}
                                  ></div>
                                </div>
                                <span className="ml-2 text-xs">
                                  Target: {currentSolution.pH}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                        
                        <div>
                          <div className="flex justify-between items-center">
                            <Label className="text-sm">Final Volume</Label>
                            <div className="flex items-center">
                              <Input
                                type="number"
                                value={finalVolume || ''}
                                onChange={(e) => setFinalVolume(parseFloat(e.target.value))}
                                className="w-20 text-right"
                                step={1}
                                min={0}
                                disabled={!completedSteps.dissolution || completedSteps.volume_adjustment}
                              />
                              <span className="ml-2">{currentSolution.unit}</span>
                            </div>
                          </div>
                          {finalVolume > 0 && (
                            <div className="flex items-center mt-1">
                              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full ${
                                    Math.abs(finalVolume - targetVolume) <= targetVolume * 0.01
                                      ? 'bg-green-500'
                                      : Math.abs(finalVolume - targetVolume) <= targetVolume * 0.05
                                        ? 'bg-yellow-500'
                                        : 'bg-red-500'
                                  }`}
                                  style={{ 
                                    width: `${Math.min(finalVolume / (targetVolume * 1.5) * 100, 100)}%` 
                                  }}
                                ></div>
                              </div>
                              <span className="ml-2 text-xs">
                                Target: {targetVolume} {currentSolution.unit}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {(isStirring || timer !== null) && (
                          <div>
                            <Label className="text-sm">Stirring</Label>
                            <div className="flex items-center mt-1">
                              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                <div 
                                  className="bg-blue-600 h-2.5 rounded-full" 
                                  style={{ 
                                    width: timer !== null ? `${100 - (timer / 30 * 100)}%` : '0%' 
                                  }}
                                ></div>
                              </div>
                              <span className="ml-2 text-xs">
                                {timer !== null ? `${timer}s` : 'Idle'}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
              
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium mb-2">Specifications</h3>
                  <div className="space-y-3 text-sm">
                    <p>{currentSolution.name} is a {currentSolution.concentration} solution used for {
                      reagentType === 'buffer' ? 'maintaining pH stability in various analytical procedures.' :
                      reagentType === 'enzymatic' ? 'enzymatic reactions in clinical chemistry assays.' :
                      reagentType === 'standard' ? 'calibration and quality control of analytical instruments.' :
                      'multi-point calibration of clinical chemistry analyzers.'
                    }</p>
                    
                    <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-md">
                      <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">Storage Conditions</h4>
                      <p className="text-xs text-blue-800 dark:text-blue-300">
                        {reagentType === 'buffer' ? 'Store at room temperature (15-25°C) in a tightly closed container.' :
                         reagentType === 'enzymatic' ? 'Store at 2-8°C. Protect from light and avoid freezing.' :
                         reagentType === 'standard' ? 'Store at 2-8°C. Avoid contamination and evaporation.' :
                         'Store at 2-8°C. Once opened, stable for 7 days when properly stored.'}
                      </p>
                    </div>
                    
                    <div className="bg-amber-50 dark:bg-amber-950 p-3 rounded-md">
                      <h4 className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-1">Stability</h4>
                      <p className="text-xs text-amber-800 dark:text-amber-300">
                        {reagentType === 'buffer' ? 'Stable for 3 months at room temperature or 6 months at 2-8°C.' :
                         reagentType === 'enzymatic' ? 'Stable for 14 days at 2-8°C or 12 hours at room temperature.' :
                         reagentType === 'standard' ? 'Stable for 30 days at 2-8°C when properly stored.' :
                         'Stable for 7 days at 2-8°C after opening. Discard if visible contamination occurs.'}
                      </p>
                    </div>
                    
                    {isPreparationStarted && (
                      <div className="mt-4">
                        <Label className="text-sm font-medium">Reagent Label</Label>
                        <div className="mt-2 p-3 border rounded-md bg-gray-50 dark:bg-gray-900 font-mono text-xs whitespace-pre-line">
                          {formatLabel()}
                        </div>
                        
                        {!completedSteps.labeling && (
                          <div className="mt-4 space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <Label className="text-xs">Reagent Name</Label>
                                <Input
                                  value={reagentLabel.name}
                                  onChange={(e) => setReagentLabel({...reagentLabel, name: e.target.value})}
                                  placeholder={currentSolution.name}
                                  className="h-8 text-xs mt-1"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Prepared By</Label>
                                <Input
                                  value={reagentLabel.preparer}
                                  onChange={(e) => setReagentLabel({...reagentLabel, preparer: e.target.value})}
                                  placeholder="Your Name"
                                  className="h-8 text-xs mt-1"
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <Label className="text-xs">Date Prepared</Label>
                                <Input
                                  value={reagentLabel.date}
                                  onChange={(e) => setReagentLabel({...reagentLabel, date: e.target.value})}
                                  placeholder={new Date().toLocaleDateString()}
                                  className="h-8 text-xs mt-1"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Expiration Date</Label>
                                <Input
                                  value={reagentLabel.expiration}
                                  onChange={(e) => setReagentLabel({...reagentLabel, expiration: e.target.value})}
                                  placeholder={new Date(new Date().setMonth(new Date().getMonth() + 3)).toLocaleDateString()}
                                  className="h-8 text-xs mt-1"
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <Label className="text-xs">Lot Number</Label>
                                <Input
                                  value={reagentLabel.lotNumber}
                                  onChange={(e) => setReagentLabel({...reagentLabel, lotNumber: e.target.value})}
                                  placeholder={`LAB-${Date.now().toString().slice(-6)}`}
                                  className="h-8 text-xs mt-1"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Storage Conditions</Label>
                                <Input
                                  value={reagentLabel.storage}
                                  onChange={(e) => setReagentLabel({...reagentLabel, storage: e.target.value})}
                                  placeholder="Store at 2-8°C"
                                  className="h-8 text-xs mt-1"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Select a solution to begin</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="procedure" className="flex-1 p-4 overflow-auto">
          {currentSolution && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-medium mb-4">Preparation Steps</h3>
                    
                    <div className="space-y-6">
                      {/* Step 1: Weighing and Measuring */}
                      <div className={`border rounded-md p-4 ${completedSteps.weighing ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800' : ''}`}>
                        <div className="flex items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                            completedSteps.weighing 
                              ? 'bg-green-500 text-white' 
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                          }`}>
                            <span className="material-icons text-sm">1</span>
                          </div>
                          <h4 className="font-medium">Weighing and Measuring Components</h4>
                        </div>
                        
                        <div className="mt-3 ml-11 space-y-3">
                          <p className="text-sm">
                            Accurately weigh and measure all components according to the specified amounts.
                            Use an analytical balance for precise measurements.
                          </p>
                          
                          {isPreparationStarted && !completedSteps.weighing && (
                            <div className="space-y-3">
                              <div className="flex justify-between">
                                <span className="text-sm">Component weighing status</span>
                                <span className="text-sm font-medium">Ready</span>
                              </div>
                              
                              <Button onClick={() => completeStep('weighing')}>
                                Complete Weighing
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Step 2: Dissolution */}
                      <div className={`border rounded-md p-4 ${completedSteps.dissolution ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800' : ''}`}>
                        <div className="flex items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                            completedSteps.dissolution 
                              ? 'bg-green-500 text-white' 
                              : completedSteps.weighing
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                          }`}>
                            <span className="material-icons text-sm">2</span>
                          </div>
                          <h4 className="font-medium">Component Dissolution</h4>
                        </div>
                        
                        <div className="mt-3 ml-11 space-y-3">
                          <p className="text-sm">
                            Add components to approximately 80% of the final volume of {selectedWaterType === 'type1' ? 'Type I ultrapure' : selectedWaterType === 'type2' ? 'Type II analytical' : 'distilled'} water.
                            Stir until completely dissolved.
                          </p>
                          
                          {isPreparationStarted && completedSteps.weighing && !completedSteps.dissolution && (
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <Label>Stirring Speed (RPM)</Label>
                                <div className="w-40">
                                  <Slider
                                    value={[stirringSpeed]}
                                    onValueChange={(value) => setStirringSpeed(value[0])}
                                    min={0}
                                    max={1000}
                                    step={50}
                                  />
                                </div>
                                <span className="w-12 text-right">{stirringSpeed}</span>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <Label>Water Temperature</Label>
                                <div className="w-40">
                                  <Slider
                                    value={[waterTemperature]}
                                    onValueChange={(value) => setWaterTemperature(value[0])}
                                    min={15}
                                    max={80}
                                    step={1}
                                  />
                                </div>
                                <span className="w-12 text-right">{waterTemperature}°C</span>
                              </div>
                              
                              <div className="flex space-x-2">
                                <Button 
                                  variant="outline" 
                                  onClick={() => startStirring(30)}
                                  disabled={isStirring || stirringSpeed === 0}
                                >
                                  Stir (30s)
                                </Button>
                                <Button 
                                  onClick={() => completeStep('dissolution')}
                                  disabled={isStirring}
                                >
                                  Complete Dissolution
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Step 3: pH Adjustment (if applicable) */}
                      {currentSolution.pH !== null && (
                        <div className={`border rounded-md p-4 ${completedSteps.ph_adjustment ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800' : ''}`}>
                          <div className="flex items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                              completedSteps.ph_adjustment 
                                ? 'bg-green-500 text-white' 
                                : completedSteps.dissolution
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                            }`}>
                              <span className="material-icons text-sm">3</span>
                            </div>
                            <h4 className="font-medium">pH Adjustment</h4>
                          </div>
                          
                          <div className="mt-3 ml-11 space-y-3">
                            <p className="text-sm">
                              Adjust the pH to {currentSolution.pH} using appropriate acid or base.
                              Verify with a calibrated pH meter.
                            </p>
                            
                            {isPreparationStarted && completedSteps.dissolution && !completedSteps.ph_adjustment && (
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <Label>Current pH</Label>
                                  <div className="flex items-center">
                                    <Input
                                      type="number"
                                      value={phMeasurement || ''}
                                      onChange={(e) => setPhMeasurement(parseFloat(e.target.value))}
                                      className="w-20 text-right"
                                      step={0.1}
                                      min={0}
                                      max={14}
                                    />
                                  </div>
                                </div>
                                
                                <div className="flex items-center mt-1">
                                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div 
                                      className={`h-full ${
                                        phMeasurement !== null && Math.abs(phMeasurement - currentSolution.pH) <= 0.1
                                          ? 'bg-green-500'
                                          : phMeasurement !== null && Math.abs(phMeasurement - currentSolution.pH) <= 0.3
                                            ? 'bg-yellow-500'
                                            : 'bg-red-500'
                                      }`}
                                      style={{ 
                                        width: `${phMeasurement !== null ? Math.min(phMeasurement / 14 * 100, 100) : 0}%` 
                                      }}
                                    ></div>
                                  </div>
                                  <span className="ml-2 text-xs">
                                    Target: {currentSolution.pH}
                                  </span>
                                </div>
                                
                                <div className="flex space-x-2">
                                  <Button 
                                    variant="outline" 
                                    onClick={() => {
                                      const currentPh = phMeasurement || 7;
                                      const targetPh = currentSolution.pH;
                                      // Move pH closer to target
                                      if (currentPh < targetPh) {
                                        setPhMeasurement(Math.min(currentPh + 0.1, targetPh));
                                      } else if (currentPh > targetPh) {
                                        setPhMeasurement(Math.max(currentPh - 0.1, targetPh));
                                      }
                                    }}
                                    disabled={phMeasurement === currentSolution.pH}
                                  >
                                    Adjust pH
                                  </Button>
                                  <Button onClick={() => completeStep('ph_adjustment')}>
                                    Complete pH Adjustment
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Step 4: Volume Adjustment */}
                      <div className={`border rounded-md p-4 ${completedSteps.volume_adjustment ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800' : ''}`}>
                        <div className="flex items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                            completedSteps.volume_adjustment 
                              ? 'bg-green-500 text-white' 
                              : (currentSolution.pH === null ? completedSteps.dissolution : completedSteps.ph_adjustment)
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                          }`}>
                            <span className="material-icons text-sm">{currentSolution.pH === null ? '3' : '4'}</span>
                          </div>
                          <h4 className="font-medium">Volume Adjustment</h4>
                        </div>
                        
                        <div className="mt-3 ml-11 space-y-3">
                          <p className="text-sm">
                            Adjust the final volume to {targetVolume} {currentSolution.unit} with {selectedWaterType === 'type1' ? 'Type I ultrapure' : selectedWaterType === 'type2' ? 'Type II analytical' : 'distilled'} water.
                            Use a volumetric flask for precise measurement.
                          </p>
                          
                          {isPreparationStarted && 
                           (currentSolution.pH === null ? completedSteps.dissolution : completedSteps.ph_adjustment) && 
                           !completedSteps.volume_adjustment && (
                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <Label>Final Volume</Label>
                                <div className="flex items-center">
                                  <Input
                                    type="number"
                                    value={finalVolume || ''}
                                    onChange={(e) => setFinalVolume(parseFloat(e.target.value))}
                                    className="w-20 text-right"
                                    step={1}
                                    min={0}
                                  />
                                  <span className="ml-2">{currentSolution.unit}</span>
                                </div>
                              </div>
                              
                              {finalVolume > 0 && (
                                <div className="flex items-center mt-1">
                                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div 
                                      className={`h-full ${
                                        Math.abs(finalVolume - targetVolume) <= targetVolume * 0.01
                                          ? 'bg-green-500'
                                          : Math.abs(finalVolume - targetVolume) <= targetVolume * 0.05
                                            ? 'bg-yellow-500'
                                            : 'bg-red-500'
                                      }`}
                                      style={{ 
                                        width: `${Math.min(finalVolume / (targetVolume * 1.5) * 100, 100)}%` 
                                      }}
                                    ></div>
                                  </div>
                                  <span className="ml-2 text-xs">
                                    Target: {targetVolume} {currentSolution.unit}
                                  </span>
                                </div>
                              )}
                              
                              <div className="flex space-x-2">
                                <Button 
                                  variant="outline" 
                                  onClick={() => {
                                    // Adjust volume closer to target
                                    const currentVol = finalVolume || 0;
                                    if (currentVol < targetVolume) {
                                      setFinalVolume(Math.min(currentVol + 10, targetVolume));
                                    } else if (currentVol > targetVolume) {
                                      setFinalVolume(Math.max(currentVol - 10, targetVolume));
                                    }
                                  }}
                                  disabled={finalVolume === targetVolume}
                                >
                                  Adjust Volume
                                </Button>
                                <Button onClick={() => completeStep('volume_adjustment')}>
                                  Complete Volume Adjustment
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Step 5: Filtration */}
                      <div className={`border rounded-md p-4 ${completedSteps.filtration ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800' : ''}`}>
                        <div className="flex items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                            completedSteps.filtration 
                              ? 'bg-green-500 text-white' 
                              : completedSteps.volume_adjustment
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                          }`}>
                            <span className="material-icons text-sm">{currentSolution.pH === null ? '4' : '5'}</span>
                          </div>
                          <h4 className="font-medium">Filtration</h4>
                        </div>
                        
                        <div className="mt-3 ml-11 space-y-3">
                          <p className="text-sm">
                            Filter the solution through a 0.22 μm filter to remove particulates and ensure sterility.
                          </p>
                          
                          {isPreparationStarted && completedSteps.volume_adjustment && !completedSteps.filtration && (
                            <div className="space-y-3">
                              <div className="flex space-x-4">
                                <div className="flex items-center space-x-2">
                                  <Checkbox id="filter-022" checked={true} />
                                  <Label htmlFor="filter-022" className="text-sm">0.22 μm Filter</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Checkbox id="filter-045" checked={false} />
                                  <Label htmlFor="filter-045" className="text-sm">0.45 μm Filter</Label>
                                </div>
                              </div>
                              
                              <Button onClick={() => completeStep('filtration')}>
                                Complete Filtration
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Step 6: Labeling */}
                      <div className={`border rounded-md p-4 ${completedSteps.labeling ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800' : ''}`}>
                        <div className="flex items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                            completedSteps.labeling 
                              ? 'bg-green-500 text-white' 
                              : completedSteps.filtration
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                          }`}>
                            <span className="material-icons text-sm">{currentSolution.pH === null ? '5' : '6'}</span>
                          </div>
                          <h4 className="font-medium">Labeling and Storage</h4>
                        </div>
                        
                        <div className="mt-3 ml-11 space-y-3">
                          <p className="text-sm">
                            Label the container with reagent name, concentration, preparation date, expiration date, and storage conditions.
                            Store according to requirements.
                          </p>
                          
                          {isPreparationStarted && completedSteps.filtration && !completedSteps.labeling && (
                            <div className="space-y-3">
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <Label className="text-xs">Reagent Name</Label>
                                  <Input
                                    value={reagentLabel.name}
                                    onChange={(e) => setReagentLabel({...reagentLabel, name: e.target.value})}
                                    placeholder={currentSolution.name}
                                    className="h-8 text-xs mt-1"
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs">Prepared By</Label>
                                  <Input
                                    value={reagentLabel.preparer}
                                    onChange={(e) => setReagentLabel({...reagentLabel, preparer: e.target.value})}
                                    placeholder="Your Name"
                                    className="h-8 text-xs mt-1"
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <Label className="text-xs">Date Prepared</Label>
                                  <Input
                                    value={reagentLabel.date}
                                    onChange={(e) => setReagentLabel({...reagentLabel, date: e.target.value})}
                                    placeholder={new Date().toLocaleDateString()}
                                    className="h-8 text-xs mt-1"
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs">Expiration Date</Label>
                                  <Input
                                    value={reagentLabel.expiration}
                                    onChange={(e) => setReagentLabel({...reagentLabel, expiration: e.target.value})}
                                    placeholder={new Date(new Date().setMonth(new Date().getMonth() + 3)).toLocaleDateString()}
                                    className="h-8 text-xs mt-1"
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <Label className="text-xs">Lot Number</Label>
                                  <Input
                                    value={reagentLabel.lotNumber}
                                    onChange={(e) => setReagentLabel({...reagentLabel, lotNumber: e.target.value})}
                                    placeholder={`LAB-${Date.now().toString().slice(-6)}`}
                                    className="h-8 text-xs mt-1"
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs">Storage Conditions</Label>
                                  <Input
                                    value={reagentLabel.storage}
                                    onChange={(e) => setReagentLabel({...reagentLabel, storage: e.target.value})}
                                    placeholder="Store at 2-8°C"
                                    className="h-8 text-xs mt-1"
                                  />
                                </div>
                              </div>
                              
                              <Button onClick={() => completeStep('labeling')}>
                                Complete Labeling
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between mt-6">
                      {isPreparationStarted && !isPreparationComplete && (
                        <Button variant="outline" onClick={resetPreparation}>
                          Reset Preparation
                        </Button>
                      )}
                      
                      {isPreparationComplete && !isValidationStarted && (
                        <Button 
                          className="bg-green-600 hover:bg-green-700 ml-auto"
                          onClick={startValidation}
                        >
                          Validate Reagent
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium mb-2">Procedure Guidelines</h3>
                  <div className="space-y-3 text-sm">
                    <p>Follow these guidelines for proper reagent preparation:</p>
                    
                    <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-md">
                      <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">Quality Considerations</h4>
                      <ul className="list-disc ml-4 text-xs text-blue-800 dark:text-blue-300 space-y-1">
                        <li>Use the proper grade of chemicals for the intended purpose</li>
                        <li>Ensure all glassware is clean and dry before use</li>
                        <li>Use calibrated instruments for all measurements</li>
                        <li>Document all preparation steps for traceability</li>
                      </ul>
                    </div>
                    
                    <div className="bg-amber-50 dark:bg-amber-950 p-3 rounded-md">
                      <h4 className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-1">Common Errors</h4>
                      <ul className="list-disc ml-4 text-xs text-amber-800 dark:text-amber-300 space-y-1">
                        <li>Using incorrect grade of chemicals</li>
                        <li>Inadequate dissolution of components</li>
                        <li>Incorrect pH adjustment</li>
                        <li>Inaccurate final volume</li>
                        <li>Missing or incorrect labeling information</li>
                      </ul>
                    </div>
                    
                    <div className="bg-red-50 dark:bg-red-950 p-3 rounded-md">
                      <h4 className="text-sm font-medium text-red-800 dark:text-red-300 mb-1">Safety Precautions</h4>
                      <ul className="list-disc ml-4 text-xs text-red-800 dark:text-red-300 space-y-1">
                        <li>Wear appropriate PPE (gloves, lab coat, eye protection)</li>
                        <li>Handle hazardous chemicals in a fume hood</li>
                        <li>Be aware of chemical incompatibilities</li>
                        <li>Know the location of safety equipment</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="validation" className="flex-1 p-4 overflow-auto">
          {currentSolution && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-medium mb-4">Reagent Validation</h3>
                    
                    {!isPreparationComplete ? (
                      <div className="text-center py-12">
                        <p className="text-muted-foreground mb-4">
                          Complete the reagent preparation process before validation.
                        </p>
                        <Button 
                          variant="outline" 
                          onClick={() => setActiveTab('procedure')}
                        >
                          Go to Procedure
                        </Button>
                      </div>
                    ) : !isValidationStarted ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground mb-4">
                          Validate the prepared reagent to ensure it meets all specifications.
                        </p>
                        <Button 
                          className="bg-green-600 hover:bg-green-700"
                          onClick={startValidation}
                        >
                          Start Validation
                        </Button>
                      </div>
                    ) : !isValidationComplete ? (
                      <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100 mb-4"></div>
                        <p className="text-muted-foreground">Performing validation tests...</p>
                      </div>
                    ) : (
                      <div>
                        <h4 className="text-sm font-medium mb-3">Validation Results</h4>
                        
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Parameter</TableHead>
                              <TableHead>Expected</TableHead>
                              <TableHead>Actual</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {validationResults.map((result, index) => (
                              <TableRow key={index}>
                                <TableCell>{result.parameter}</TableCell>
                                <TableCell>{result.expected}</TableCell>
                                <TableCell>{result.actual}</TableCell>
                                <TableCell>
                                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${
                                    result.status === 'pass'
                                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                      : result.status === 'warning'
                                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                  }`}>
                                    {result.status === 'pass' ? 'Pass' : 
                                     result.status === 'warning' ? 'Warning' : 'Fail'}
                                  </span>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                        
                        <div className="mt-6">
                          <h4 className="text-sm font-medium mb-2">Validation Summary</h4>
                          
                          {(() => {
                            const failCount = validationResults.filter(r => r.status === 'fail').length;
                            const warningCount = validationResults.filter(r => r.status === 'warning').length;
                            
                            if (failCount === 0 && warningCount === 0) {
                              return (
                                <Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300">
                                  <AlertDescription>
                                    All parameters meet the acceptance criteria. The reagent is ready for use.
                                  </AlertDescription>
                                </Alert>
                              );
                            } else if (failCount === 0) {
                              return (
                                <Alert className="bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-300">
                                  <AlertDescription>
                                    {warningCount} parameter(s) have minor deviations but are acceptable for use.
                                    Monitor reagent performance closely during use.
                                  </AlertDescription>
                                </Alert>
                              );
                            } else {
                              return (
                                <Alert className="bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300">
                                  <AlertDescription>
                                    {failCount} parameter(s) do not meet acceptance criteria.
                                    The reagent cannot be used. Prepare a new batch following the procedure more carefully.
                                  </AlertDescription>
                                </Alert>
                              );
                            }
                          })()}
                        </div>
                        
                        <div className="flex justify-end mt-6">
                          <Button
                            onClick={resetPreparation}
                            variant="outline"
                            className="mr-2"
                          >
                            Prepare New Batch
                          </Button>
                          
                          <Button
                            className="bg-green-600 hover:bg-green-700"
                            disabled={validationResults.some(r => r.status === 'fail')}
                            onClick={() => {
                              toast({
                                title: 'Reagent Approved',
                                description: 'The reagent has been approved for use in the laboratory.'
                              });
                              
                              // If this is part of a guided workflow, report completion
                              if (onComplete) {
                                onComplete({
                                  type: 'reagent_preparation',
                                  reagentType,
                                  reagentName: currentSolution?.name,
                                  prepared: preparedSolution,
                                  validationResults,
                                  success: !validationResults.some(r => r.status === 'fail'),
                                  notes: 'Reagent preparation and validation completed'
                                });
                              }
                            }}
                          >
                            Approve for Use
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium mb-2">Validation Guidelines</h3>
                  <div className="space-y-3 text-sm">
                    <p>Validation ensures the reagent meets specifications before use in patient testing.</p>
                    
                    <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-md">
                      <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">Acceptance Criteria</h4>
                      <ul className="list-disc ml-4 text-xs text-blue-800 dark:text-blue-300 space-y-1">
                        <li>Component measurements within ±0.5% of specified amounts</li>
                        <li>pH within ±0.1 units of target (if applicable)</li>
                        <li>Final volume within ±2% of target</li>
                        <li>Clear appearance with no visible particles</li>
                        <li>Complete and accurate labeling</li>
                      </ul>
                    </div>
                    
                    <div className="bg-green-50 dark:bg-green-950 p-3 rounded-md">
                      <h4 className="text-sm font-medium text-green-800 dark:text-green-300 mb-1">Quality Assurance</h4>
                      <p className="text-xs text-green-800 dark:text-green-300 mb-1">
                        For critical reagents, additional tests may include:
                      </p>
                      <ul className="list-disc ml-4 text-xs text-green-800 dark:text-green-300 space-y-1">
                        <li>Performance testing with control materials</li>
                        <li>Comparison with previous lot performance</li>
                        <li>Stability testing under storage conditions</li>
                        <li>Sterility testing for reagents requiring sterility</li>
                      </ul>
                    </div>
                    
                    <div className="mt-6">
                      <h4 className="text-sm font-medium mb-1">Documentation Requirements</h4>
                      <ul className="list-disc ml-4 text-xs text-muted-foreground space-y-1">
                        <li>Preparation worksheet with all measurements</li>
                        <li>Lot numbers of all components used</li>
                        <li>Validation test results</li>
                        <li>Approval signature and date</li>
                        <li>Expiration date assignment</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}