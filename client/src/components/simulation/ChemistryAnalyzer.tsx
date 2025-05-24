import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
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
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { getDemoImage } from '@/data/images';

interface ChemistryAnalyzerProps {
  mode: 'calibration' | 'qc' | 'patient';
  onComplete: (results: any) => void;
}

interface CalibrationMaterial {
  id: string;
  name: string;
  level: string;
  analytes: Record<string, number>;
}

interface QCMaterial {
  id: string;
  name: string;
  level: string;
  ranges: Record<string, { min: number; max: number; target: number }>;
  values?: Record<string, number>;
}

interface AnalyteConfig {
  name: string;
  units: string;
  decimalPlaces: number;
  displayName: string;
}

export function ChemistryAnalyzer({ mode, onComplete }: ChemistryAnalyzerProps) {
  const [activeTab, setActiveTab] = useState<string>('status');
  const [analyzerState, setAnalyzerState] = useState<'idle' | 'initializing' | 'ready' | 'running' | 'error' | 'maintenance'>('idle');
  const [progress, setProgress] = useState(0);
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null);
  const [rackPositions, setRackPositions] = useState<Array<string | null>>(Array(10).fill(null));
  const [systemErrors, setSystemErrors] = useState<string[]>([]);
  const [isCalibrated, setIsCalibrated] = useState<Record<string, boolean>>({
    'glucose': false,
    'creatinine': false,
    'urea': false,
    'alt': false,
    'cholesterol': false,
    'triglycerides': false
  });
  const [calibrationCurves, setCalibrationCurves] = useState<Record<string, {slope: number, intercept: number, r2: number}>>({});
  const [qcResults, setQcResults] = useState<Record<string, {value: number, status: 'pass' | 'fail' | 'warning'}>>({});
  const [runningTest, setRunningTest] = useState(false);
  const [maintenanceNeeded, setMaintenanceNeeded] = useState<string[]>([]);
  const [reagentLevels, setReagentLevels] = useState<Record<string, number>>({
    'glucose': 95,
    'creatinine': 80,
    'urea': 70,
    'alt': 85,
    'cholesterol': 90,
    'triglycerides': 65
  });
  const [waterLevel, setWaterLevel] = useState(85);
  const [wasteLevel, setWasteLevel] = useState(30);
  const [selectedAnalytes, setSelectedAnalytes] = useState<string[]>([]);
  const [runHistory, setRunHistory] = useState<Array<{
    id: string,
    type: string,
    material: string,
    timestamp: Date,
    results: Record<string, number>
  }>>([]);

  const { toast } = useToast();

  const calibrationMaterials: CalibrationMaterial[] = [
    {
      id: 'cal-0',
      name: 'Zero Calibrator',
      level: '0',
      analytes: {
        'glucose': 0,
        'creatinine': 0,
        'urea': 0,
        'alt': 0,
        'cholesterol': 0,
        'triglycerides': 0
      }
    },
    {
      id: 'cal-1',
      name: 'Calibrator Level 1',
      level: '1',
      analytes: {
        'glucose': 50,
        'creatinine': 0.5,
        'urea': 10,
        'alt': 20,
        'cholesterol': 100,
        'triglycerides': 50
      }
    },
    {
      id: 'cal-2',
      name: 'Calibrator Level 2',
      level: '2',
      analytes: {
        'glucose': 150,
        'creatinine': 2.0,
        'urea': 30,
        'alt': 60,
        'cholesterol': 200,
        'triglycerides': 150
      }
    },
    {
      id: 'cal-3',
      name: 'Calibrator Level 3',
      level: '3',
      analytes: {
        'glucose': 300,
        'creatinine': 5.0,
        'urea': 60,
        'alt': 120,
        'cholesterol': 300,
        'triglycerides': 300
      }
    }
  ];

  const qcMaterials: QCMaterial[] = [
    {
      id: 'qc-normal',
      name: 'Normal Control',
      level: 'Normal',
      ranges: {
        'glucose': { min: 70, max: 110, target: 90 },
        'creatinine': { min: 0.6, max: 1.2, target: 0.9 },
        'urea': { min: 10, max: 20, target: 15 },
        'alt': { min: 10, max: 40, target: 25 },
        'cholesterol': { min: 140, max: 200, target: 170 },
        'triglycerides': { min: 50, max: 150, target: 100 }
      }
    },
    {
      id: 'qc-abnormal',
      name: 'Abnormal Control',
      level: 'Abnormal',
      ranges: {
        'glucose': { min: 240, max: 280, target: 260 },
        'creatinine': { min: 3.5, max: 4.5, target: 4.0 },
        'urea': { min: 45, max: 55, target: 50 },
        'alt': { min: 90, max: 110, target: 100 },
        'cholesterol': { min: 240, max: 280, target: 260 },
        'triglycerides': { min: 240, max: 280, target: 260 }
      }
    }
  ];

  const analytes: Record<string, AnalyteConfig> = {
    'glucose': { name: 'glucose', units: 'mg/dL', decimalPlaces: 0, displayName: 'Glucose' },
    'creatinine': { name: 'creatinine', units: 'mg/dL', decimalPlaces: 1, displayName: 'Creatinine' },
    'urea': { name: 'urea', units: 'mg/dL', decimalPlaces: 0, displayName: 'Urea' },
    'alt': { name: 'alt', units: 'U/L', decimalPlaces: 0, displayName: 'ALT' },
    'cholesterol': { name: 'cholesterol', units: 'mg/dL', decimalPlaces: 0, displayName: 'Cholesterol' },
    'triglycerides': { name: 'triglycerides', units: 'mg/dL', decimalPlaces: 0, displayName: 'Triglycerides' }
  };

  // Initialize the analyzer
  useEffect(() => {
    if (analyzerState === 'idle') {
      setAnalyzerState('initializing');
      
      // Simulate analyzer initialization
      const initTimer = setTimeout(() => {
        // Check for system issues
        const errors = [];
        if (waterLevel < 20) errors.push('Water level low');
        if (wasteLevel > 80) errors.push('Waste container nearly full');
        
        if (errors.length > 0) {
          setSystemErrors(errors);
          setAnalyzerState('error');
          toast({
            title: 'Analyzer Error',
            description: 'System check failed. Please resolve issues before proceeding.',
            variant: 'destructive'
          });
        } else {
          setAnalyzerState('ready');
          toast({
            title: 'Analyzer Ready',
            description: 'System initialization complete. Ready for operation.'
          });
        }
      }, 3000);
      
      return () => clearTimeout(initTimer);
    }
  }, [analyzerState, waterLevel, wasteLevel, toast]);

  // Handle progress updates when running tests
  useEffect(() => {
    if (analyzerState === 'running') {
      const interval = setInterval(() => {
        setProgress(prevProgress => {
          if (prevProgress >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prevProgress + 5;
        });
      }, 200);
      
      return () => clearInterval(interval);
    }
  }, [analyzerState]);

  // Complete test run when progress reaches 100%
  useEffect(() => {
    if (progress >= 100 && analyzerState === 'running') {
      if (mode === 'calibration') {
        handleCalibrationComplete();
      } else if (mode === 'qc') {
        handleQCComplete();
      }
      
      // Reset progress and state
      setTimeout(() => {
        setProgress(0);
        setAnalyzerState('ready');
        setRunningTest(false);
      }, 1000);
    }
  }, [progress, analyzerState, mode]);

  // Start the analyzer
  const startAnalyzer = () => {
    if (analyzerState === 'idle' || analyzerState === 'error') {
      setSystemErrors([]);
      setAnalyzerState('initializing');
      setProgress(0);
    }
  };

  // Place a calibrator or QC material in a rack position
  const placeInRack = (position: number, materialId: string) => {
    const newRack = [...rackPositions];
    newRack[position] = materialId;
    setRackPositions(newRack);
    
    toast({
      title: 'Sample Loaded',
      description: `Material placed in position ${position + 1}`,
    });
  };

  // Clear a rack position
  const clearRackPosition = (position: number) => {
    const newRack = [...rackPositions];
    newRack[position] = null;
    setRackPositions(newRack);
  };

  // Clear all rack positions
  const clearRack = () => {
    setRackPositions(Array(10).fill(null));
    toast({
      description: 'Sample rack cleared',
    });
  };

  // Run calibration
  const runCalibration = () => {
    if (selectedAnalytes.length === 0) {
      toast({
        title: 'No Analytes Selected',
        description: 'Please select at least one analyte to calibrate.',
        variant: 'destructive'
      });
      return;
    }
    
    // Check if calibrators are placed in rack
    const placedCalibrators = rackPositions.filter(pos => pos?.startsWith('cal-'));
    if (placedCalibrators.length < 3) {
      toast({
        title: 'Insufficient Calibrators',
        description: 'Please place at least 3 calibration levels in the rack.',
        variant: 'destructive'
      });
      return;
    }
    
    // Start calibration run
    setAnalyzerState('running');
    setRunningTest(true);
    setProgress(0);
    
    toast({
      title: 'Calibration Started',
      description: 'Running calibration. Please wait...',
    });
  };

  // Generate calibration curves for selected analytes
  const handleCalibrationComplete = () => {
    // Update calibration status for selected analytes
    const newCalibrationStatus = { ...isCalibrated };
    const newCalibrationCurves = { ...calibrationCurves };
    
    selectedAnalytes.forEach(analyte => {
      // Check which calibrators are in the rack
      const calibratorIds = rackPositions
        .filter(pos => pos?.startsWith('cal-'))
        .map(id => id as string);
      
      // Generate calibration data
      const calibrationPoints = calibratorIds.map(id => {
        const calibrator = calibrationMaterials.find(cal => cal.id === id);
        return {
          concentration: calibrator?.analytes[analyte] || 0,
          response: calibrator?.analytes[analyte] || 0 * (0.95 + Math.random() * 0.1) // Simulated response
        };
      });
      
      // Calculate calibration parameters (simplified linear regression)
      if (calibrationPoints.length >= 2) {
        // Basic linear regression
        const n = calibrationPoints.length;
        const sumX = calibrationPoints.reduce((acc, point) => acc + point.concentration, 0);
        const sumY = calibrationPoints.reduce((acc, point) => acc + point.response, 0);
        const sumXY = calibrationPoints.reduce((acc, point) => acc + point.concentration * point.response, 0);
        const sumXX = calibrationPoints.reduce((acc, point) => acc + point.concentration * point.concentration, 0);
        
        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;
        
        // Calculate R-squared (simplified)
        const r2 = 0.98 + Math.random() * 0.02; // Simulate R² value (typically very high for good calibration)
        
        newCalibrationCurves[analyte] = { slope, intercept, r2 };
        newCalibrationStatus[analyte] = r2 > 0.99; // Acceptable R² for calibration
      }
    });
    
    setIsCalibrated(newCalibrationStatus);
    setCalibrationCurves(newCalibrationCurves);
    
    // Add to run history
    const newRun = {
      id: `run-${Date.now()}`,
      type: 'Calibration',
      material: 'Multi-level Calibrators',
      timestamp: new Date(),
      results: Object.fromEntries(
        Object.entries(newCalibrationCurves)
          .map(([analyte, curve]) => [analyte, curve.r2])
      )
    };
    
    setRunHistory(prev => [newRun, ...prev]);
    
    // Show results notification
    const successfulCalibrations = selectedAnalytes.filter(analyte => newCalibrationStatus[analyte]);
    
    if (successfulCalibrations.length === selectedAnalytes.length) {
      toast({
        title: 'Calibration Complete',
        description: 'All analytes calibrated successfully.',
      });
    } else if (successfulCalibrations.length > 0) {
      toast({
        title: 'Calibration Partially Complete',
        description: `${successfulCalibrations.length} of ${selectedAnalytes.length} analytes calibrated successfully.`,
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Calibration Failed',
        description: 'No analytes were calibrated successfully. Check calibration materials and try again.',
        variant: 'destructive'
      });
    }
    
    // If this is part of a guided workflow, report results
    if (onComplete) {
      onComplete({
        type: 'calibration',
        timestamp: new Date(),
        calibrationStatus: newCalibrationStatus,
        calibrationCurves: newCalibrationCurves,
        notes: 'Calibration procedure completed'
      });
    }
  };

  // Run quality control
  const runQC = () => {
    if (selectedAnalytes.length === 0) {
      toast({
        title: 'No Analytes Selected',
        description: 'Please select at least one analyte to run QC.',
        variant: 'destructive'
      });
      return;
    }
    
    // Check for calibration
    const uncalibratedAnalytes = selectedAnalytes.filter(analyte => !isCalibrated[analyte]);
    if (uncalibratedAnalytes.length > 0) {
      toast({
        title: 'Calibration Required',
        description: `The following analytes need calibration: ${uncalibratedAnalytes.join(', ')}`,
        variant: 'destructive'
      });
      return;
    }
    
    // Check if QC materials are placed in rack
    const placedQC = rackPositions.filter(pos => pos?.startsWith('qc-'));
    if (placedQC.length === 0) {
      toast({
        title: 'No QC Materials',
        description: 'Please place at least one QC material in the rack.',
        variant: 'destructive'
      });
      return;
    }
    
    // Start QC run
    setAnalyzerState('running');
    setRunningTest(true);
    setProgress(0);
    
    toast({
      title: 'QC Started',
      description: 'Running quality control. Please wait...',
    });
  };

  // Complete QC run
  const handleQCComplete = () => {
    const newQcResults: Record<string, {value: number, status: 'pass' | 'fail' | 'warning'}> = {};
    
    // Generate QC results for each material in rack
    rackPositions
      .filter(pos => pos?.startsWith('qc-'))
      .forEach(qcId => {
        const qcMaterial = qcMaterials.find(qc => qc.id === qcId);
        if (!qcMaterial) return;
        
        selectedAnalytes.forEach(analyte => {
          if (!isCalibrated[analyte]) return;
          
          const range = qcMaterial.ranges[analyte];
          
          // Calculate QC value (target ± random variation)
          let qcValue = range.target;
          
          // Add some variation based on calibration quality
          const calibrationQuality = calibrationCurves[analyte]?.r2 || 0;
          const variationFactor = calibrationQuality > 0.99 ? 0.05 : 0.15;
          
          // Add random variation
          qcValue = qcValue * (1 + (Math.random() * 2 - 1) * variationFactor);
          qcValue = parseFloat(qcValue.toFixed(analytes[analyte].decimalPlaces));
          
          // Determine status
          let status: 'pass' | 'fail' | 'warning';
          if (qcValue >= range.min && qcValue <= range.max) {
            status = 'pass';
          } else if (
            qcValue >= range.min * 0.9 && qcValue <= range.max * 1.1
          ) {
            status = 'warning';
          } else {
            status = 'fail';
          }
          
          // Store result
          const resultKey = `${analyte}-${qcMaterial.level}`;
          newQcResults[resultKey] = { value: qcValue, status };
        });
      });
    
    setQcResults(newQcResults);
    
    // Add to run history
    const qcMaterialNames = rackPositions
      .filter(pos => pos?.startsWith('qc-'))
      .map(id => {
        const material = qcMaterials.find(qc => qc.id === id);
        return material?.name || 'Unknown QC';
      })
      .join(', ');
    
    const newRun = {
      id: `run-${Date.now()}`,
      type: 'Quality Control',
      material: qcMaterialNames,
      timestamp: new Date(),
      results: Object.fromEntries(
        Object.entries(newQcResults).map(([key, result]) => [key, result.value])
      )
    };
    
    setRunHistory(prev => [newRun, ...prev]);
    
    // Show results notification
    const failedQC = Object.values(newQcResults).filter(result => result.status === 'fail').length;
    const warningQC = Object.values(newQcResults).filter(result => result.status === 'warning').length;
    
    if (failedQC === 0 && warningQC === 0) {
      toast({
        title: 'QC Complete',
        description: 'All QC results within acceptable ranges.',
      });
    } else if (failedQC === 0) {
      toast({
        title: 'QC Complete with Warnings',
        description: `${warningQC} result(s) outside target range but within acceptable limits.`,
        variant: 'default'
      });
    } else {
      toast({
        title: 'QC Failed',
        description: `${failedQC} result(s) outside acceptable ranges. Recalibration may be needed.`,
        variant: 'destructive'
      });
    }
    
    // If this is part of a guided workflow, report results
    if (onComplete) {
      onComplete({
        type: 'qc',
        timestamp: new Date(),
        qcResults: newQcResults,
        notes: 'Quality control procedure completed'
      });
    }
  };

  // Perform system maintenance
  const performMaintenance = () => {
    setAnalyzerState('maintenance');
    
    // Simulate maintenance operations
    setTimeout(() => {
      // Reset maintenance indicators
      setMaintenanceNeeded([]);
      
      // Reset water and waste levels
      setWaterLevel(100);
      setWasteLevel(0);
      
      setAnalyzerState('ready');
      
      toast({
        title: 'Maintenance Complete',
        description: 'System maintenance completed successfully.',
      });
    }, 3000);
  };

  // Format numeric values
  const formatValue = (value: number, decimalPlaces: number) => {
    return value.toFixed(decimalPlaces);
  };

  // Check if a specific analyte is selected
  const isAnalyteSelected = (analyte: string) => {
    return selectedAnalytes.includes(analyte);
  };

  // Toggle selection of an analyte
  const toggleAnalyteSelection = (analyte: string) => {
    if (isAnalyteSelected(analyte)) {
      setSelectedAnalytes(selectedAnalytes.filter(a => a !== analyte));
    } else {
      setSelectedAnalytes([...selectedAnalytes, analyte]);
    }
  };

  // Select all analytes
  const selectAllAnalytes = () => {
    setSelectedAnalytes(Object.keys(analytes));
  };

  // Clear all selected analytes
  const clearSelectedAnalytes = () => {
    setSelectedAnalytes([]);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="bg-gray-100 p-4 dark:bg-gray-800 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-2">
              <span className="material-icons text-white text-xs">biotech</span>
            </div>
            <div>
              <h2 className="text-lg font-medium">ChemStar 2000</h2>
              <p className="text-xs text-muted-foreground">Clinical Chemistry Analyzer</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-1 ${
                analyzerState === 'ready' ? 'bg-green-500' :
                analyzerState === 'running' ? 'bg-blue-500 animate-pulse' :
                analyzerState === 'error' ? 'bg-red-500' :
                analyzerState === 'maintenance' ? 'bg-yellow-500' :
                'bg-gray-500'
              }`}></div>
              <span className="text-xs font-medium capitalize">{analyzerState}</span>
            </div>
            
            {analyzerState === 'error' && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={startAnalyzer}
                className="text-xs h-7"
              >
                Restart
              </Button>
            )}
            
            {analyzerState === 'idle' && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={startAnalyzer}
                className="text-xs h-7"
              >
                Initialize
              </Button>
            )}
            
            {maintenanceNeeded.length > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={performMaintenance}
                className="text-xs h-7 text-yellow-600 border-yellow-600"
              >
                <span className="material-icons mr-1 text-xs">build</span>
                Maintenance
              </Button>
            )}
          </div>
        </div>
        
        {analyzerState === 'running' && (
          <div className="mt-4">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-center mt-1">
              {progress === 100 ? 'Processing complete' : 'Processing samples...'}
            </p>
          </div>
        )}
        
        {systemErrors.length > 0 && (
          <Alert variant="destructive" className="mt-4">
            <AlertDescription>
              <ul className="text-sm">
                {systemErrors.map((error, index) => (
                  <li key={index} className="flex items-center">
                    <span className="material-icons mr-1 text-sm">error</span>
                    {error}
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}
      </div>
      
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col"
      >
        <TabsList className="justify-start rounded-none border-b bg-transparent p-0">
          <TabsTrigger
            value="status"
            className="rounded-none border-b-2 border-b-transparent px-4 py-2 data-[state=active]:border-b-primary"
          >
            Status
          </TabsTrigger>
          <TabsTrigger
            value="sample-rack"
            className="rounded-none border-b-2 border-b-transparent px-4 py-2 data-[state=active]:border-b-primary"
          >
            Sample Rack
          </TabsTrigger>
          <TabsTrigger
            value={mode === 'calibration' ? 'calibration' : 'qc'}
            className="rounded-none border-b-2 border-b-transparent px-4 py-2 data-[state=active]:border-b-primary"
          >
            {mode === 'calibration' ? 'Calibration' : 'Quality Control'}
          </TabsTrigger>
          <TabsTrigger
            value="results"
            className="rounded-none border-b-2 border-b-transparent px-4 py-2 data-[state=active]:border-b-primary"
          >
            Results
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="status" className="flex-1 p-4 overflow-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium mb-2">System Status</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <Label>Water</Label>
                      <span className="text-xs">{waterLevel}%</span>
                    </div>
                    <Progress value={waterLevel} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <Label>Waste</Label>
                      <span className="text-xs">{wasteLevel}%</span>
                    </div>
                    <Progress value={wasteLevel} className="h-2" />
                  </div>
                  
                  <div className="pt-2">
                    <Label className="mb-1 block">System Temperature</Label>
                    <div className="flex items-center">
                      <span className="material-icons text-blue-500 mr-1">thermostat</span>
                      <span>37.0°C</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium mb-2">Reagent Status</h3>
                <div className="space-y-3">
                  {Object.entries(reagentLevels).map(([reagent, level]) => (
                    <div key={reagent}>
                      <div className="flex justify-between items-center mb-1">
                        <Label>{analytes[reagent]?.displayName || reagent}</Label>
                        <span className="text-xs">{level}%</span>
                      </div>
                      <Progress 
                        value={level} 
                        className={`h-2 ${level < 20 ? 'bg-red-500' : level < 40 ? 'bg-yellow-500' : ''}`}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardContent className="p-4">
                <h3 className="font-medium mb-2">Calibration Status</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(isCalibrated).map(([analyte, calibrated]) => (
                    <div key={analyte} className="flex items-center p-2 rounded border">
                      <div className={`w-3 h-3 rounded-full mr-2 ${calibrated ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span>{analytes[analyte]?.displayName || analyte}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="sample-rack" className="flex-1 p-4 overflow-auto">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Card>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium">Sample Rack</h3>
                    <Button variant="outline" size="sm" onClick={clearRack}>
                      Clear Rack
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-5 gap-2">
                    {rackPositions.map((material, index) => (
                      <div
                        key={index}
                        className={`aspect-square border rounded-md flex flex-col items-center justify-center p-1 cursor-pointer ${
                          material ? 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800' : 'bg-gray-50 dark:bg-gray-900'
                        }`}
                        onClick={() => {
                          if (selectedMaterial && !material) {
                            placeInRack(index, selectedMaterial);
                          } else if (material) {
                            clearRackPosition(index);
                          }
                        }}
                      >
                        <div className="text-xs font-medium mb-1">Pos {index + 1}</div>
                        {material ? (
                          <>
                            <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-1">
                              <span className="material-icons text-blue-600 dark:text-blue-400 text-xs">
                                {material.startsWith('cal-') ? 'science' : 'opacity'}
                              </span>
                            </div>
                            <div className="text-[10px] text-center truncate w-full">
                              {material.startsWith('cal-')
                                ? calibrationMaterials.find(cal => cal.id === material)?.name
                                : qcMaterials.find(qc => qc.id === material)?.name}
                            </div>
                          </>
                        ) : (
                          <div className="text-[10px] text-muted-foreground">Empty</div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="md:w-64">
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium mb-2">Available Materials</h3>
                  
                  <div className="space-y-1 mb-4">
                    <h4 className="text-xs font-medium text-muted-foreground">Calibrators</h4>
                    {calibrationMaterials.map(cal => (
                      <div
                        key={cal.id}
                        className={`flex items-center p-2 rounded-md cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950 ${
                          selectedMaterial === cal.id ? 'bg-blue-100 dark:bg-blue-900' : ''
                        }`}
                        onClick={() => setSelectedMaterial(cal.id)}
                      >
                        <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-2">
                          <span className="material-icons text-blue-600 dark:text-blue-400 text-xs">science</span>
                        </div>
                        <div className="flex-1">
                          <div className="text-xs font-medium">{cal.name}</div>
                          <div className="text-[10px] text-muted-foreground">Level {cal.level}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="space-y-1">
                    <h4 className="text-xs font-medium text-muted-foreground">Quality Controls</h4>
                    {qcMaterials.map(qc => (
                      <div
                        key={qc.id}
                        className={`flex items-center p-2 rounded-md cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950 ${
                          selectedMaterial === qc.id ? 'bg-blue-100 dark:bg-blue-900' : ''
                        }`}
                        onClick={() => setSelectedMaterial(qc.id)}
                      >
                        <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-2">
                          <span className="material-icons text-blue-600 dark:text-blue-400 text-xs">opacity</span>
                        </div>
                        <div className="flex-1">
                          <div className="text-xs font-medium">{qc.name}</div>
                          <div className="text-[10px] text-muted-foreground">{qc.level} Range</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="calibration" className="flex-1 p-4 overflow-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Card>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium">Analyte Selection</h3>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={selectAllAnalytes}>
                        Select All
                      </Button>
                      <Button variant="outline" size="sm" onClick={clearSelectedAnalytes}>
                        Clear
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                    {Object.entries(analytes).map(([id, analyte]) => (
                      <div
                        key={id}
                        className={`flex items-center p-2 rounded-md cursor-pointer border ${
                          isAnalyteSelected(id) 
                            ? 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800' 
                            : 'bg-transparent'
                        }`}
                        onClick={() => toggleAnalyteSelection(id)}
                      >
                        <div className={`w-4 h-4 rounded border mr-2 flex items-center justify-center ${
                          isAnalyteSelected(id) 
                            ? 'bg-blue-500 border-blue-500' 
                            : 'border-gray-300 dark:border-gray-600'
                        }`}>
                          {isAnalyteSelected(id) && (
                            <span className="material-icons text-white text-xs">check</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm">{analyte.displayName}</div>
                          <div className="text-xs text-muted-foreground">{analyte.units}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {Object.keys(calibrationCurves).length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-2">Current Calibration Parameters</h4>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Analyte</TableHead>
                            <TableHead>Slope</TableHead>
                            <TableHead>Intercept</TableHead>
                            <TableHead>R²</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {Object.entries(calibrationCurves).map(([analyte, curve]) => (
                            <TableRow key={analyte}>
                              <TableCell>{analytes[analyte]?.displayName || analyte}</TableCell>
                              <TableCell>{formatValue(curve.slope, 4)}</TableCell>
                              <TableCell>{formatValue(curve.intercept, 4)}</TableCell>
                              <TableCell>{formatValue(curve.r2, 4)}</TableCell>
                              <TableCell>
                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${
                                  isCalibrated[analyte]
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                }`}>
                                  {isCalibrated[analyte] ? 'Valid' : 'Invalid'}
                                </span>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                  
                  <div className="flex justify-end">
                    <Button
                      onClick={runCalibration}
                      disabled={analyzerState !== 'ready' || runningTest}
                    >
                      Run Calibration
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium mb-2">Calibration Notes</h3>
                <div className="space-y-3 text-sm">
                  <p>Follow these steps for proper calibration:</p>
                  <ol className="list-decimal ml-4 space-y-1">
                    <li>Place calibrators in sample rack positions</li>
                    <li>Select analytes to be calibrated</li>
                    <li>Run calibration procedure</li>
                    <li>Verify calibration parameters are acceptable</li>
                  </ol>
                  
                  <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-md mt-4">
                    <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">Important</h4>
                    <p className="text-xs text-blue-800 dark:text-blue-300">
                      A valid calibration should have an R² value greater than 0.99 and include at least 3 calibration levels.
                    </p>
                  </div>
                  
                  <div className="bg-amber-50 dark:bg-amber-950 p-3 rounded-md">
                    <h4 className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-1">Troubleshooting</h4>
                    <p className="text-xs text-amber-800 dark:text-amber-300">
                      If calibration fails, check reagent levels, verify calibrator placement, and ensure system is properly maintained.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="qc" className="flex-1 p-4 overflow-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Card>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium">Quality Control</h3>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={selectAllAnalytes}>
                        Select All
                      </Button>
                      <Button variant="outline" size="sm" onClick={clearSelectedAnalytes}>
                        Clear
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                    {Object.entries(analytes).map(([id, analyte]) => (
                      <div
                        key={id}
                        className={`flex items-center p-2 rounded-md cursor-pointer border ${
                          isAnalyteSelected(id) 
                            ? 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800' 
                            : 'bg-transparent'
                        }`}
                        onClick={() => toggleAnalyteSelection(id)}
                      >
                        <div className={`w-4 h-4 rounded border mr-2 flex items-center justify-center ${
                          isAnalyteSelected(id) 
                            ? 'bg-blue-500 border-blue-500' 
                            : 'border-gray-300 dark:border-gray-600'
                        }`}>
                          {isAnalyteSelected(id) && (
                            <span className="material-icons text-white text-xs">check</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm">{analyte.displayName}</div>
                          <div className="text-xs text-muted-foreground">{analyte.units}</div>
                        </div>
                        {!isCalibrated[id] && (
                          <div className="text-xs text-red-500">Not calibrated</div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {Object.keys(qcResults).length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-2">QC Results</h4>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Analyte</TableHead>
                            <TableHead>Level</TableHead>
                            <TableHead>Result</TableHead>
                            <TableHead>Range</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {Object.entries(qcResults).map(([key, result]) => {
                            const [analyteId, level] = key.split('-');
                            const analyte = analytes[analyteId];
                            
                            if (!analyte) return null;
                            
                            const qcMaterial = qcMaterials.find(qc => qc.level === level);
                            const range = qcMaterial?.ranges[analyteId];
                            
                            if (!range) return null;
                            
                            return (
                              <TableRow key={key}>
                                <TableCell>{analyte.displayName}</TableCell>
                                <TableCell>{level}</TableCell>
                                <TableCell>
                                  {formatValue(result.value, analyte.decimalPlaces)} {analyte.units}
                                </TableCell>
                                <TableCell>
                                  {formatValue(range.min, analyte.decimalPlaces)} - {formatValue(range.max, analyte.decimalPlaces)}
                                </TableCell>
                                <TableCell>
                                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${
                                    result.status === 'pass'
                                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                      : result.status === 'warning'
                                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                  }`}>
                                    {result.status === 'pass' ? 'Pass' : result.status === 'warning' ? 'Warning' : 'Fail'}
                                  </span>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                  
                  <div className="flex justify-end">
                    <Button
                      onClick={runQC}
                      disabled={analyzerState !== 'ready' || runningTest}
                    >
                      Run QC
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium mb-2">QC Guidelines</h3>
                <div className="space-y-3 text-sm">
                  <p>Follow these steps for quality control:</p>
                  <ol className="list-decimal ml-4 space-y-1">
                    <li>Place QC materials in sample rack positions</li>
                    <li>Select analytes to run QC</li>
                    <li>Run QC procedure</li>
                    <li>Evaluate results against acceptable ranges</li>
                  </ol>
                  
                  <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-md mt-4">
                    <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">Westgard Rules</h4>
                    <p className="text-xs text-blue-800 dark:text-blue-300">
                      Apply Westgard multi-rule QC procedures to detect random and systematic errors:
                    </p>
                    <ul className="list-disc ml-4 text-xs text-blue-800 dark:text-blue-300 mt-1">
                      <li>1<sub>2s</sub>: Warning when a result exceeds 2SD</li>
                      <li>1<sub>3s</sub>: Reject when a result exceeds 3SD</li>
                      <li>2<sub>2s</sub>: Reject when 2 consecutive results exceed 2SD in same direction</li>
                    </ul>
                  </div>
                  
                  <div className="bg-amber-50 dark:bg-amber-950 p-3 rounded-md">
                    <h4 className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-1">QC Failure Actions</h4>
                    <p className="text-xs text-amber-800 dark:text-amber-300">
                      If QC fails, verify calibration, check reagents, run maintenance, and repeat QC before running patient samples.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="results" className="flex-1 p-4 overflow-auto">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-4">Run History</h3>
              
              {runHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No run history available. Run calibration or QC to see results.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date/Time</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Material</TableHead>
                      <TableHead>Results</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {runHistory.map(run => (
                      <TableRow key={run.id}>
                        <TableCell>
                          {run.timestamp.toLocaleDateString()} {run.timestamp.toLocaleTimeString()}
                        </TableCell>
                        <TableCell>{run.type}</TableCell>
                        <TableCell>{run.material}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" className="h-7 text-xs">
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}