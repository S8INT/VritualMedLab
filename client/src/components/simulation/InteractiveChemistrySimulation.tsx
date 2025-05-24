import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ChemistryAnalyzer } from './ChemistryAnalyzer';
import { ReagentPreparation } from './ReagentPreparation';
import { ResultInterpretation } from './ResultInterpretation';

interface InteractiveChemistrySimulationProps {
  simulationId: number;
  scenarioType: 'calibration' | 'reagent' | 'interpretation';
  onComplete: (results: any) => void;
}

export function InteractiveChemistrySimulation({
  simulationId,
  scenarioType = 'calibration',
  onComplete
}: InteractiveChemistrySimulationProps) {
  const [activeTab, setActiveTab] = useState<string>(getDefaultTab());
  const [stepResults, setStepResults] = useState<any[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  
  const { toast } = useToast();

  function getDefaultTab() {
    switch (scenarioType) {
      case 'calibration':
        return 'analyzer';
      case 'reagent':
        return 'reagent';
      case 'interpretation':
        return 'results';
      default:
        return 'analyzer';
    }
  }

  function getScenarioTitle() {
    switch (scenarioType) {
      case 'calibration':
        return 'Analyzer Calibration & Quality Control';
      case 'reagent':
        return 'Reagent Preparation & Validation';
      case 'interpretation':
        return 'Abnormal Result Interpretation';
      default:
        return 'Clinical Chemistry Simulation';
    }
  }

  const handleStepComplete = (stepData: any) => {
    // Add to results
    setStepResults(prev => [...prev, stepData]);
    
    // Check if all required steps are completed
    if (stepData.type === 'calibration' && scenarioType === 'calibration') {
      if (stepData.calibrationStatus && Object.values(stepData.calibrationStatus).some(val => val === true)) {
        toast({
          title: 'Calibration Completed',
          description: 'You have successfully calibrated the analyzer. Now run quality control checks.'
        });
        
        // Don't mark as complete yet, they should run QC too
      }
    } else if (stepData.type === 'qc' && scenarioType === 'calibration') {
      // Now we can mark calibration scenario as complete
      setIsComplete(true);
      
      if (onComplete) {
        onComplete({
          simulationId,
          scenarioType,
          steps: [...stepResults, stepData],
          success: true,
          date: new Date()
        });
      }
      
      toast({
        title: 'Scenario Completed',
        description: 'You have successfully completed the analyzer calibration and quality control scenario.'
      });
    } else if (stepData.type === 'reagent_preparation' && scenarioType === 'reagent') {
      setIsComplete(true);
      
      if (onComplete) {
        onComplete({
          simulationId,
          scenarioType,
          steps: [...stepResults, stepData],
          success: stepData.success,
          date: new Date()
        });
      }
      
      toast({
        title: 'Scenario Completed',
        description: 'You have completed the reagent preparation and validation scenario.'
      });
    } else if (stepData.type === 'result_interpretation' && scenarioType === 'interpretation') {
      setIsComplete(true);
      
      if (onComplete) {
        onComplete({
          simulationId,
          scenarioType,
          steps: [...stepResults, stepData],
          success: stepData.percentageScore >= 70, // Pass if they got at least 70%
          score: stepData.percentageScore,
          date: new Date()
        });
      }
      
      const scoreMessage = stepData.percentageScore >= 90 ? 'Excellent work!' :
                           stepData.percentageScore >= 70 ? 'Good job!' :
                           stepData.percentageScore >= 50 ? 'You passed, but review the feedback to improve.' :
                           'Review the fundamental concepts and try again.';
      
      toast({
        title: 'Interpretation Completed',
        description: `${scoreMessage} Score: ${Math.round(stepData.percentageScore)}%`
      });
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="bg-gradient-to-r from-chemistry/20 to-chemistry/5 p-4 border-b">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-medium">{getScenarioTitle()}</h2>
            <p className="text-sm text-muted-foreground">
              Clinical Chemistry Simulation - ID: {simulationId}
            </p>
          </div>
          
          {isComplete && (
            <div className="flex items-center">
              <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center mr-2">
                <span className="material-icons text-white text-xs">check</span>
              </div>
              <span className="text-sm font-medium">Scenario Completed</span>
            </div>
          )}
        </div>
      </div>
      
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col"
      >
        <TabsList className="justify-start rounded-none border-b bg-transparent p-0">
          {scenarioType === 'calibration' && (
            <TabsTrigger
              value="analyzer"
              className="rounded-none border-b-2 border-b-transparent px-4 py-2 data-[state=active]:border-b-primary"
            >
              Chemistry Analyzer
            </TabsTrigger>
          )}
          
          {scenarioType === 'reagent' && (
            <TabsTrigger
              value="reagent"
              className="rounded-none border-b-2 border-b-transparent px-4 py-2 data-[state=active]:border-b-primary"
            >
              Reagent Preparation
            </TabsTrigger>
          )}
          
          {scenarioType === 'interpretation' && (
            <TabsTrigger
              value="results"
              className="rounded-none border-b-2 border-b-transparent px-4 py-2 data-[state=active]:border-b-primary"
            >
              Result Interpretation
            </TabsTrigger>
          )}
          
          <TabsTrigger
            value="guide"
            className="rounded-none border-b-2 border-b-transparent px-4 py-2 data-[state=active]:border-b-primary"
          >
            Simulation Guide
          </TabsTrigger>
        </TabsList>
        
        {scenarioType === 'calibration' && (
          <TabsContent value="analyzer" className="flex-1 overflow-auto p-0">
            <ChemistryAnalyzer 
              mode={stepResults.some(r => r.type === 'calibration') ? 'qc' : 'calibration'} 
              onComplete={handleStepComplete} 
            />
          </TabsContent>
        )}
        
        {scenarioType === 'reagent' && (
          <TabsContent value="reagent" className="flex-1 overflow-auto p-0">
            <ReagentPreparation
              reagentType="buffer"
              onComplete={handleStepComplete}
            />
          </TabsContent>
        )}
        
        {scenarioType === 'interpretation' && (
          <TabsContent value="results" className="flex-1 overflow-auto p-0">
            <ResultInterpretation
              onComplete={handleStepComplete}
            />
          </TabsContent>
        )}
        
        <TabsContent value="guide" className="flex-1 p-6 overflow-auto">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-medium mb-4">{getScenarioTitle()} - Simulation Guide</h2>
              
              <div className="space-y-4">
                {scenarioType === 'calibration' && (
                  <>
                    <div>
                      <h3 className="text-lg font-medium mb-2">Objectives</h3>
                      <p>In this simulation, you will learn how to properly calibrate a clinical chemistry analyzer and run quality control procedures to ensure accurate and reliable patient results.</p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Instructions</h3>
                      <ol className="list-decimal ml-5 space-y-2">
                        <li>Initialize the chemistry analyzer</li>
                        <li>Check system status (water, waste, reagent levels)</li>
                        <li>Place calibration materials in the sample rack</li>
                        <li>Select analytes to calibrate</li>
                        <li>Run calibration procedure</li>
                        <li>Verify calibration results</li>
                        <li>Run quality control materials</li>
                        <li>Evaluate QC results using acceptance criteria</li>
                      </ol>
                    </div>
                    
                    <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-md">
                      <h3 className="text-lg font-medium mb-2 text-blue-800 dark:text-blue-300">Learning Points</h3>
                      <ul className="list-disc ml-5 space-y-1 text-blue-800 dark:text-blue-300">
                        <li>Understanding the calibration process in clinical chemistry</li>
                        <li>Interpreting calibration curves and parameters</li>
                        <li>Recognizing proper quality control procedures</li>
                        <li>Troubleshooting calibration and QC failures</li>
                        <li>Applying Westgard rules for quality control</li>
                      </ul>
                    </div>
                  </>
                )}
                
                {scenarioType === 'reagent' && (
                  <>
                    <div>
                      <h3 className="text-lg font-medium mb-2">Objectives</h3>
                      <p>In this simulation, you will learn how to properly prepare, validate, and document reagents used in clinical chemistry testing to ensure accurate and consistent analytical performance.</p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Instructions</h3>
                      <ol className="list-decimal ml-5 space-y-2">
                        <li>Select the appropriate reagent to prepare</li>
                        <li>Measure components accurately according to specifications</li>
                        <li>Follow proper dissolution procedures</li>
                        <li>Adjust pH if required</li>
                        <li>Adjust final volume</li>
                        <li>Filter the solution if necessary</li>
                        <li>Properly label the reagent</li>
                        <li>Validate the prepared reagent</li>
                      </ol>
                    </div>
                    
                    <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-md">
                      <h3 className="text-lg font-medium mb-2 text-blue-800 dark:text-blue-300">Learning Points</h3>
                      <ul className="list-disc ml-5 space-y-1 text-blue-800 dark:text-blue-300">
                        <li>Understanding reagent composition and purpose</li>
                        <li>Applying precision measurement techniques</li>
                        <li>Following proper laboratory preparation procedures</li>
                        <li>Recognizing the importance of proper labeling</li>
                        <li>Implementing validation procedures to ensure reagent quality</li>
                      </ul>
                    </div>
                  </>
                )}
                
                {scenarioType === 'interpretation' && (
                  <>
                    <div>
                      <h3 className="text-lg font-medium mb-2">Objectives</h3>
                      <p>In this simulation, you will develop skills in interpreting abnormal clinical chemistry results, recognizing patterns of disease, identifying analytical interferences, and making appropriate clinical correlations.</p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Instructions</h3>
                      <ol className="list-decimal ml-5 space-y-2">
                        <li>Review the patient information carefully</li>
                        <li>Examine the laboratory results</li>
                        <li>Identify abnormal values and patterns</li>
                        <li>Consider pre-analytical variables that might affect results</li>
                        <li>Correlate results with patient history and symptoms</li>
                        <li>Answer interpretation questions</li>
                        <li>Review feedback on your answers</li>
                      </ol>
                    </div>
                    
                    <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-md">
                      <h3 className="text-lg font-medium mb-2 text-blue-800 dark:text-blue-300">Learning Points</h3>
                      <ul className="list-disc ml-5 space-y-1 text-blue-800 dark:text-blue-300">
                        <li>Recognizing patterns of abnormal results in common diseases</li>
                        <li>Identifying potential analytical interferences</li>
                        <li>Understanding the pathophysiological basis of laboratory abnormalities</li>
                        <li>Applying clinical correlation to laboratory data</li>
                        <li>Recommending appropriate follow-up testing</li>
                      </ul>
                    </div>
                  </>
                )}
                
                <div className="flex justify-end mt-4">
                  <Button 
                    onClick={() => setActiveTab(getDefaultTab())}
                    className="bg-chemistry hover:bg-chemistry/90 text-white"
                  >
                    Begin Simulation
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}