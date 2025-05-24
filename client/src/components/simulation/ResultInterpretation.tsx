import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { getDemoImage } from '@/data/images';

interface ResultInterpretationProps {
  patientData?: PatientData;
  resultSet?: LaboratoryResult[];
  onComplete: (results: any) => void;
}

interface PatientData {
  id: string;
  age: number;
  gender: string;
  symptoms: string[];
  medicalHistory: string;
  currentMedications: string[];
}

interface LaboratoryResult {
  id: string;
  test: string;
  value: number;
  units: string;
  referenceRange: {
    low: number;
    high: number;
  };
  category: 'chemistry' | 'hematology' | 'urinalysis' | 'serology';
  timestamp: Date;
  flags?: string[];
}

interface InterpretationAnswer {
  question: string;
  answer: string;
  correctAnswer?: string;
  isCorrect?: boolean;
  feedback?: string;
}

export function ResultInterpretation({ 
  patientData = defaultPatientData, 
  resultSet = diabeticPatientResults,
  onComplete 
}: ResultInterpretationProps) {
  const [activeTab, setActiveTab] = useState<string>('patient-info');
  const [interpretations, setInterpretations] = useState<InterpretationAnswer[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<string>('');
  
  const { toast } = useToast();

  // Questions for this case
  const interpretationQuestions = [
    {
      id: 'diagnosis',
      question: 'Based on the laboratory results, what is the most likely diagnosis?',
      expectedAnswer: 'Poorly controlled diabetes mellitus with diabetic nephropathy and dyslipidemia.',
      rubric: [
        { keyword: 'diabetes', points: 2 },
        { keyword: 'nephropathy', points: 1 },
        { keyword: 'dyslipidemia', points: 1 },
        { keyword: 'poorly controlled', points: 1 }
      ]
    },
    {
      id: 'explanation',
      question: 'Explain the pathophysiological relationship between the elevated glucose, HbA1c, and the abnormal lipid profile.',
      expectedAnswer: 'Insulin resistance or deficiency in diabetes mellitus leads to hyperglycemia (elevated glucose and HbA1c). This also affects lipid metabolism, causing increased triglycerides, decreased HDL, and potentially increased LDL, known as diabetic dyslipidemia. The high HbA1c indicates chronic hyperglycemia over the past 2-3 months.',
      rubric: [
        { keyword: 'insulin resistance', points: 1 },
        { keyword: 'hyperglycemia', points: 1 },
        { keyword: 'lipid metabolism', points: 1 },
        { keyword: 'triglycerides', points: 1 },
        { keyword: 'HDL', points: 1 }
      ]
    },
    {
      id: 'kidney',
      question: 'What do the BUN, creatinine, and urine albumin results indicate about this patient\'s kidney function?',
      expectedAnswer: 'The elevated BUN and creatinine suggest early renal impairment. The presence of microalbuminuria (elevated urine albumin) is an early indicator of diabetic nephropathy, showing glomerular damage that allows albumin to leak into the urine. This is a common complication of longstanding diabetes, especially with poor glycemic control.',
      rubric: [
        { keyword: 'renal impairment', points: 1 },
        { keyword: 'microalbuminuria', points: 1 },
        { keyword: 'glomerular', points: 1 },
        { keyword: 'nephropathy', points: 1 },
        { keyword: 'complication', points: 1 }
      ]
    },
    {
      id: 'interference',
      question: 'Identify any potential analytical interferences that might affect the interpretation of these results.',
      expectedAnswer: 'The slight lipemia noted in the sample may interfere with certain tests, particularly triglycerides, which might be falsely elevated. Hemolysis could affect potassium levels. Medications like metformin can sometimes cause mild lactate elevation.',
      rubric: [
        { keyword: 'lipemia', points: 1 },
        { keyword: 'triglycerides', points: 1 },
        { keyword: 'hemolysis', points: 1 },
        { keyword: 'metformin', points: 1 },
        { keyword: 'interference', points: 1 }
      ]
    },
    {
      id: 'recommendations',
      question: 'What additional laboratory tests would you recommend for this patient, and why?',
      expectedAnswer: 'Recommended additional tests include: estimated glomerular filtration rate (eGFR) to better assess kidney function; urine albumin-to-creatinine ratio for more quantitative assessment of albuminuria; lipid fractionation with direct LDL measurement for cardiovascular risk assessment; and potentially liver function tests to monitor for metformin effects and rule out non-alcoholic fatty liver disease which is common in diabetics.',
      rubric: [
        { keyword: 'eGFR', points: 1 },
        { keyword: 'albumin-to-creatinine', points: 1 },
        { keyword: 'LDL', points: 1 },
        { keyword: 'liver function', points: 1 },
        { keyword: 'cardiovascular', points: 1 }
      ]
    }
  ];

  // Initialize interpretations array
  useEffect(() => {
    setInterpretations(
      interpretationQuestions.map(q => ({
        question: q.question,
        answer: '',
      }))
    );
  }, []);

  // Check if all questions have been answered
  useEffect(() => {
    if (isSubmitted) {
      const answeredCount = interpretations.filter(i => i.isCorrect !== undefined).length;
      if (answeredCount === interpretationQuestions.length) {
        setIsCompleted(true);
        
        // Calculate final score
        const totalScore = interpretations.reduce((sum, interp) => {
          return sum + (interp.isCorrect ? 1 : 0);
        }, 0);
        
        setScore(totalScore);
        
        // Generate feedback based on score
        const scorePercentage = (totalScore / interpretationQuestions.length) * 100;
        
        let feedbackMessage = '';
        if (scorePercentage >= 90) {
          feedbackMessage = 'Excellent work! Your interpretation demonstrates thorough understanding of the clinical biochemistry and pathophysiology involved in this case.';
        } else if (scorePercentage >= 70) {
          feedbackMessage = 'Good job! You have a solid understanding of the case, with just a few areas for improvement.';
        } else if (scorePercentage >= 50) {
          feedbackMessage = 'You\'ve demonstrated basic understanding of the case, but there are important concepts that need more attention.';
        } else {
          feedbackMessage = 'You need to review the fundamental concepts of clinical chemistry interpretation. Focus on understanding the relationships between different analytes and their clinical significance.';
        }
        
        setFeedback(feedbackMessage);
        
        // Report completion
        if (onComplete) {
          onComplete({
            type: 'result_interpretation',
            patientId: patientData.id,
            interpretations: interpretations,
            score: totalScore,
            maxScore: interpretationQuestions.length,
            percentageScore: scorePercentage,
            feedback: feedbackMessage
          });
        }
      }
    }
  }, [isSubmitted, interpretations, interpretationQuestions.length, onComplete, patientData]);

  // Submit the current answer
  const submitAnswer = () => {
    if (!currentAnswer.trim()) {
      toast({
        title: 'Empty Answer',
        description: 'Please provide an answer before submitting.',
        variant: 'destructive'
      });
      return;
    }
    
    // Store the answer
    const newInterpretations = [...interpretations];
    newInterpretations[currentQuestion] = {
      ...newInterpretations[currentQuestion],
      answer: currentAnswer
    };
    setInterpretations(newInterpretations);
    
    // Move to next question or finish
    if (currentQuestion < interpretationQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setCurrentAnswer('');
    } else {
      setIsSubmitted(true);
      
      toast({
        title: 'Interpretation Submitted',
        description: 'Your answers have been submitted for evaluation.'
      });
    }
  };

  // Evaluate all answers
  const evaluateAnswers = () => {
    const evaluatedInterpretations = interpretations.map((interp, index) => {
      const question = interpretationQuestions[index];
      
      // Evaluate the answer based on rubric
      let points = 0;
      const maxPoints = question.rubric.reduce((sum, item) => sum + item.points, 0);
      
      question.rubric.forEach(item => {
        if (interp.answer.toLowerCase().includes(item.keyword.toLowerCase())) {
          points += item.points;
        }
      });
      
      // Consider it correct if they get at least 60% of the points
      const threshold = maxPoints * 0.6;
      const isCorrect = points >= threshold;
      
      return {
        ...interp,
        correctAnswer: question.expectedAnswer,
        isCorrect,
        feedback: isCorrect 
          ? 'Good answer! You correctly identified the key concepts.'
          : `Your answer missed some key concepts. Remember to consider: ${question.rubric
              .map(r => r.keyword)
              .join(', ')}.`
      };
    });
    
    setInterpretations(evaluatedInterpretations);
  };

  // Reset the assessment
  const resetAssessment = () => {
    setInterpretations(
      interpretationQuestions.map(q => ({
        question: q.question,
        answer: '',
      }))
    );
    setCurrentQuestion(0);
    setCurrentAnswer('');
    setIsSubmitted(false);
    setIsCompleted(false);
    setScore(0);
    setFeedback('');
    
    toast({
      title: 'Assessment Reset',
      description: 'You can now start the interpretation assessment again.'
    });
  };

  // Format a laboratory result with appropriate styling
  const formatResult = (result: LaboratoryResult) => {
    const isHigh = result.value > result.referenceRange.high;
    const isLow = result.value < result.referenceRange.low;
    const isAbnormal = isHigh || isLow;
    
    return {
      value: result.value.toFixed(
        // Determine appropriate decimal places based on test
        result.test.includes('Glucose') || 
        result.test.includes('BUN') || 
        result.test.includes('ALT') || 
        result.test.includes('AST') ? 0 : 1
      ),
      className: isAbnormal
        ? isHigh
          ? 'text-red-600 dark:text-red-400 font-medium'
          : 'text-blue-600 dark:text-blue-400 font-medium'
        : '',
      flag: isAbnormal
        ? isHigh
          ? 'H'
          : 'L'
        : ''
    };
  };

  return (
    <div className="h-full flex flex-col">
      <div className="bg-gray-100 p-4 dark:bg-gray-800 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mr-2">
              <span className="material-icons text-white text-xs">analytics</span>
            </div>
            <div>
              <h2 className="text-lg font-medium">Clinical Chemistry Result Interpretation</h2>
              <p className="text-xs text-muted-foreground">
                Case Study: {patientData.gender === 'Male' ? 'M' : 'F'}, {patientData.age} years
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isCompleted && (
              <div className="flex items-center bg-muted rounded-md px-2 py-1">
                <span className="text-sm mr-1">Score:</span>
                <span className="text-sm font-medium">
                  {score}/{interpretationQuestions.length} ({Math.round((score/interpretationQuestions.length)*100)}%)
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col"
      >
        <TabsList className="justify-start rounded-none border-b bg-transparent p-0">
          <TabsTrigger
            value="patient-info"
            className="rounded-none border-b-2 border-b-transparent px-4 py-2 data-[state=active]:border-b-primary"
          >
            Patient Information
          </TabsTrigger>
          <TabsTrigger
            value="lab-results"
            className="rounded-none border-b-2 border-b-transparent px-4 py-2 data-[state=active]:border-b-primary"
          >
            Laboratory Results
          </TabsTrigger>
          <TabsTrigger
            value="interpretation"
            className="rounded-none border-b-2 border-b-transparent px-4 py-2 data-[state=active]:border-b-primary"
          >
            Interpretation
          </TabsTrigger>
          {isCompleted && (
            <TabsTrigger
              value="feedback"
              className="rounded-none border-b-2 border-b-transparent px-4 py-2 data-[state=active]:border-b-primary"
            >
              Feedback
            </TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="patient-info" className="flex-1 p-4 overflow-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium mb-4">Patient History</h3>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-muted-foreground text-sm">Patient ID</Label>
                        <p>{patientData.id}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground text-sm">Age</Label>
                        <p>{patientData.age} years</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground text-sm">Gender</Label>
                        <p>{patientData.gender}</p>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-muted-foreground text-sm">Presenting Symptoms</Label>
                      <ul className="list-disc ml-5 mt-1">
                        {patientData.symptoms.map((symptom, index) => (
                          <li key={index}>{symptom}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <Label className="text-muted-foreground text-sm">Medical History</Label>
                      <p className="mt-1">{patientData.medicalHistory}</p>
                    </div>
                    
                    <div>
                      <Label className="text-muted-foreground text-sm">Current Medications</Label>
                      {patientData.currentMedications.length > 0 ? (
                        <ul className="list-disc ml-5 mt-1">
                          {patientData.currentMedications.map((medication, index) => (
                            <li key={index}>{medication}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-1">None</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium mb-2">Specimen Information</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <Label className="text-muted-foreground text-xs">Collection Time</Label>
                    <p>08:15 AM (fasting)</p>
                  </div>
                  
                  <div>
                    <Label className="text-muted-foreground text-xs">Serum Appearance</Label>
                    <p>Clear, slight lipemia</p>
                  </div>
                  
                  <div>
                    <Label className="text-muted-foreground text-xs">Sample Integrity</Label>
                    <p>Acceptable</p>
                  </div>
                  
                  <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-md mt-4">
                    <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">Clinical Notes</h4>
                    <p className="text-xs text-blue-800 dark:text-blue-300">
                      Patient reports increased thirst and urination for the past month. 
                      No recent change in diet or medication.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="lab-results" className="flex-1 p-4 overflow-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium mb-4">Laboratory Results</h3>
                  
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Test</TableHead>
                        <TableHead className="text-right">Result</TableHead>
                        <TableHead className="text-right">Units</TableHead>
                        <TableHead className="text-right">Reference Range</TableHead>
                        <TableHead className="text-center">Flag</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow className="bg-muted/50">
                        <TableCell colSpan={5} className="font-medium">
                          Basic Metabolic Panel
                        </TableCell>
                      </TableRow>
                      
                      {resultSet
                        .filter(r => ['Glucose', 'BUN', 'Creatinine', 'Sodium', 'Potassium', 'Chloride', 'CO2', 'Calcium'].includes(r.test))
                        .map(result => {
                          const formatted = formatResult(result);
                          return (
                            <TableRow key={result.id}>
                              <TableCell>{result.test}</TableCell>
                              <TableCell className={`text-right ${formatted.className}`}>
                                {formatted.value}
                              </TableCell>
                              <TableCell className="text-right">{result.units}</TableCell>
                              <TableCell className="text-right">
                                {result.referenceRange.low} - {result.referenceRange.high}
                              </TableCell>
                              <TableCell className="text-center">
                                <span className={formatted.className}>{formatted.flag}</span>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      }
                      
                      <TableRow className="bg-muted/50">
                        <TableCell colSpan={5} className="font-medium">
                          Lipid Panel
                        </TableCell>
                      </TableRow>
                      
                      {resultSet
                        .filter(r => ['Total Cholesterol', 'Triglycerides', 'HDL Cholesterol', 'LDL Cholesterol'].includes(r.test))
                        .map(result => {
                          const formatted = formatResult(result);
                          return (
                            <TableRow key={result.id}>
                              <TableCell>{result.test}</TableCell>
                              <TableCell className={`text-right ${formatted.className}`}>
                                {formatted.value}
                              </TableCell>
                              <TableCell className="text-right">{result.units}</TableCell>
                              <TableCell className="text-right">
                                {result.referenceRange.low} - {result.referenceRange.high}
                              </TableCell>
                              <TableCell className="text-center">
                                <span className={formatted.className}>{formatted.flag}</span>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      }
                      
                      <TableRow className="bg-muted/50">
                        <TableCell colSpan={5} className="font-medium">
                          Liver Function Tests
                        </TableCell>
                      </TableRow>
                      
                      {resultSet
                        .filter(r => ['AST', 'ALT', 'ALP', 'Total Bilirubin', 'Albumin'].includes(r.test))
                        .map(result => {
                          const formatted = formatResult(result);
                          return (
                            <TableRow key={result.id}>
                              <TableCell>{result.test}</TableCell>
                              <TableCell className={`text-right ${formatted.className}`}>
                                {formatted.value}
                              </TableCell>
                              <TableCell className="text-right">{result.units}</TableCell>
                              <TableCell className="text-right">
                                {result.referenceRange.low} - {result.referenceRange.high}
                              </TableCell>
                              <TableCell className="text-center">
                                <span className={formatted.className}>{formatted.flag}</span>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      }
                      
                      <TableRow className="bg-muted/50">
                        <TableCell colSpan={5} className="font-medium">
                          Diabetes Markers
                        </TableCell>
                      </TableRow>
                      
                      {resultSet
                        .filter(r => ['HbA1c', 'Urine Albumin'].includes(r.test))
                        .map(result => {
                          const formatted = formatResult(result);
                          return (
                            <TableRow key={result.id}>
                              <TableCell>{result.test}</TableCell>
                              <TableCell className={`text-right ${formatted.className}`}>
                                {formatted.value}
                              </TableCell>
                              <TableCell className="text-right">{result.units}</TableCell>
                              <TableCell className="text-right">
                                {result.referenceRange.low} - {result.referenceRange.high}
                              </TableCell>
                              <TableCell className="text-center">
                                <span className={formatted.className}>{formatted.flag}</span>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      }
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium mb-2">Result Summary</h3>
                  <div className="space-y-3 text-sm">
                    <div className="bg-red-50 dark:bg-red-950 p-3 rounded-md">
                      <h4 className="text-sm font-medium text-red-800 dark:text-red-300 mb-1">Critical Values</h4>
                      <ul className="list-disc ml-4 text-xs text-red-800 dark:text-red-300 space-y-1">
                        <li>Glucose: 287 mg/dL (Critical High)</li>
                        <li>HbA1c: 9.8% (Critical High)</li>
                      </ul>
                    </div>
                    
                    <div className="bg-yellow-50 dark:bg-yellow-950 p-3 rounded-md">
                      <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-300 mb-1">Abnormal Values</h4>
                      <ul className="list-disc ml-4 text-xs text-yellow-800 dark:text-yellow-300 space-y-1">
                        <li>Triglycerides: 320 mg/dL (High)</li>
                        <li>HDL Cholesterol: 32 mg/dL (Low)</li>
                        <li>BUN: 25 mg/dL (High)</li>
                        <li>Creatinine: 1.4 mg/dL (High)</li>
                        <li>ALT: 62 U/L (High)</li>
                        <li>AST: 48 U/L (High)</li>
                        <li>Urine Albumin: 45 mg/L (High)</li>
                      </ul>
                    </div>
                    
                    <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-md">
                      <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">Related Patterns</h4>
                      <ul className="list-disc ml-4 text-xs text-blue-800 dark:text-blue-300 space-y-1">
                        <li>Elevated glucose with high HbA1c suggests chronic hyperglycemia</li>
                        <li>Lipid pattern consistent with diabetic dyslipidemia</li>
                        <li>Elevated BUN/creatinine with microalbuminuria suggests early diabetic nephropathy</li>
                        <li>Mild transaminitis may be medication-related</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="mt-4">
                <CardContent className="p-4">
                  <h3 className="font-medium mb-2">Sample Quality</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Hemolysis Index:</span>
                      <span className="font-medium">0 (None)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Icterus Index:</span>
                      <span className="font-medium">0 (None)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Lipemia Index:</span>
                      <span className="font-medium text-yellow-600">1+ (Slight)</span>
                    </div>
                    
                    <div className="mt-4 text-xs text-muted-foreground">
                      <p>Slight lipemia may affect certain analytes, particularly triglycerides.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="interpretation" className="flex-1 p-4 overflow-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium mb-4">
                    {isSubmitted ? 'Case Interpretation Review' : 'Case Interpretation Questions'}
                  </h3>
                  
                  {isSubmitted ? (
                    <div className="space-y-6">
                      {interpretations.map((interp, index) => (
                        <div key={index} className="space-y-2">
                          <div className="font-medium">{interp.question}</div>
                          
                          <div>
                            <Label className="text-sm text-muted-foreground">Your Answer:</Label>
                            <div className="p-3 bg-muted/30 rounded-md mt-1">
                              {interp.answer || 'No answer provided.'}
                            </div>
                          </div>
                          
                          {interp.correctAnswer && (
                            <div>
                              <Label className="text-sm text-muted-foreground">Expected Answer:</Label>
                              <div className="p-3 bg-muted rounded-md mt-1 text-sm">
                                {interp.correctAnswer}
                              </div>
                            </div>
                          )}
                          
                          {interp.feedback && (
                            <Alert className={`mt-2 ${
                              interp.isCorrect 
                                ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800' 
                                : 'bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800'
                            }`}>
                              <AlertDescription className={
                                interp.isCorrect 
                                  ? 'text-green-800 dark:text-green-300' 
                                  : 'text-amber-800 dark:text-amber-300'
                              }>
                                {interp.feedback}
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>
                      ))}
                      
                      <div className="flex justify-between pt-4">
                        <Button 
                          variant="outline" 
                          onClick={resetAssessment}
                        >
                          Reset Assessment
                        </Button>
                        
                        {!isCompleted && (
                          <Button onClick={evaluateAnswers}>
                            Evaluate Answers
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="font-medium">
                        Question {currentQuestion + 1} of {interpretationQuestions.length}
                      </div>
                      
                      <div>{interpretationQuestions[currentQuestion].question}</div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="answer">Your interpretation:</Label>
                        <Textarea
                          id="answer"
                          value={currentAnswer}
                          onChange={(e) => setCurrentAnswer(e.target.value)}
                          placeholder="Type your answer here..."
                          className="min-h-[150px]"
                        />
                      </div>
                      
                      <div className="flex justify-between">
                        <Button
                          variant="outline"
                          onClick={() => {
                            if (currentQuestion > 0) {
                              setCurrentQuestion(currentQuestion - 1);
                              setCurrentAnswer(interpretations[currentQuestion - 1].answer);
                            }
                          }}
                          disabled={currentQuestion === 0}
                        >
                          Previous
                        </Button>
                        
                        <Button onClick={submitAnswer}>
                          {currentQuestion < interpretationQuestions.length - 1 ? 'Next' : 'Submit'}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium mb-2">Interpretation Guidelines</h3>
                  <div className="space-y-3 text-sm">
                    <p>
                      When interpreting laboratory results, consider the following:
                    </p>
                    
                    <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-md">
                      <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">Clinical Context</h4>
                      <ul className="list-disc ml-4 text-xs text-blue-800 dark:text-blue-300 space-y-1">
                        <li>Correlate results with patient's symptoms</li>
                        <li>Consider impact of medical history</li>
                        <li>Review medication effects on results</li>
                        <li>Assess for patterns across related tests</li>
                      </ul>
                    </div>
                    
                    <div className="bg-amber-50 dark:bg-amber-950 p-3 rounded-md">
                      <h4 className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-1">Analytical Considerations</h4>
                      <ul className="list-disc ml-4 text-xs text-amber-800 dark:text-amber-300 space-y-1">
                        <li>Evaluate sample quality and interferences</li>
                        <li>Understand limitations of testing methods</li>
                        <li>Consider biological and analytical variation</li>
                        <li>Check for delta checks with previous results</li>
                      </ul>
                    </div>
                    
                    <div className="bg-green-50 dark:bg-green-950 p-3 rounded-md">
                      <h4 className="text-sm font-medium text-green-800 dark:text-green-300 mb-1">Reporting Best Practices</h4>
                      <ul className="list-disc ml-4 text-xs text-green-800 dark:text-green-300 space-y-1">
                        <li>Be specific in your interpretation</li>
                        <li>Explain pathophysiological relationships</li>
                        <li>Suggest confirmatory or follow-up testing</li>
                        <li>Provide clinical recommendations when appropriate</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {isSubmitted && (
                <Card className="mt-4">
                  <CardContent className="p-4">
                    <h3 className="font-medium mb-2">Progress</h3>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Questions Answered:</span>
                        <span className="font-medium">
                          {interpretations.filter(i => i.answer).length}/{interpretationQuestions.length}
                        </span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span>Questions Evaluated:</span>
                        <span className="font-medium">
                          {interpretations.filter(i => i.isCorrect !== undefined).length}/{interpretationQuestions.length}
                        </span>
                      </div>
                      
                      {isCompleted && (
                        <div className="flex justify-between text-sm">
                          <span>Correct Answers:</span>
                          <span className="font-medium">
                            {interpretations.filter(i => i.isCorrect).length}/{interpretationQuestions.length}
                          </span>
                        </div>
                      )}
                      
                      {!isCompleted && !interpretations.some(i => i.isCorrect !== undefined) && (
                        <Button 
                          onClick={evaluateAnswers}
                          className="w-full mt-2"
                        >
                          Evaluate Answers
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
        
        {isCompleted && (
          <TabsContent value="feedback" className="flex-1 p-4 overflow-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-medium mb-4">Performance Summary</h3>
                    
                    <div className="space-y-6">
                      <div className="p-4 rounded-md bg-muted">
                        <div className="text-center mb-4">
                          <div className="text-2xl font-bold">
                            {score}/{interpretationQuestions.length} ({Math.round((score/interpretationQuestions.length)*100)}%)
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Overall Score
                          </div>
                        </div>
                        
                        <div className="h-4 bg-muted-foreground/20 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${
                              score/interpretationQuestions.length >= 0.7 ? 'bg-green-500' :
                              score/interpretationQuestions.length >= 0.5 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${(score/interpretationQuestions.length) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Feedback Summary</h4>
                        <p className="text-sm">{feedback}</p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Areas of Strength</h4>
                        <ul className="list-disc ml-5 text-sm space-y-1">
                          {interpretations.filter(i => i.isCorrect).map((interp, index) => (
                            <li key={index}>{interp.question.split('?')[0]}?</li>
                          ))}
                        </ul>
                      </div>
                      
                      {interpretations.filter(i => !i.isCorrect).length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Areas for Improvement</h4>
                          <ul className="list-disc ml-5 text-sm space-y-1">
                            {interpretations.filter(i => !i.isCorrect).map((interp, index) => (
                              <li key={index}>{interp.question.split('?')[0]}?</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      <div className="flex justify-end">
                        <Button 
                          variant="outline" 
                          onClick={resetAssessment}
                        >
                          Start New Assessment
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div>
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-medium mb-2">Learning Resources</h3>
                    <div className="space-y-4 text-sm">
                      <div>
                        <h4 className="text-sm font-medium mb-1">Clinical Chemistry Interpretation</h4>
                        <ul className="list-disc ml-4 text-xs text-muted-foreground space-y-1">
                          <li>Tietz Textbook of Clinical Chemistry and Molecular Diagnostics</li>
                          <li>Clinical Chemistry: Principles, Techniques, and Correlations</li>
                          <li>Laboratory Test Handbook with Key Word Index</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-1">Diabetes Management Guidelines</h4>
                        <ul className="list-disc ml-4 text-xs text-muted-foreground space-y-1">
                          <li>American Diabetes Association Standards of Medical Care</li>
                          <li>Diabetes Care Clinical Practice Guidelines</li>
                          <li>Management of Hyperglycemia in Type 2 Diabetes</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-1">Related Case Studies</h4>
                        <ul className="list-disc ml-4 text-xs text-muted-foreground space-y-1">
                          <li>Diabetic Ketoacidosis Clinical Presentation</li>
                          <li>Lipid Disorders in Diabetes Mellitus</li>
                          <li>Diabetic Nephropathy: Laboratory Markers</li>
                        </ul>
                      </div>
                      
                      <Button 
                        variant="outline" 
                        className="w-full mt-2"
                        onClick={() => {
                          toast({
                            title: 'Resources Accessed',
                            description: 'Learning resources will open in a new tab when available.'
                          });
                        }}
                      >
                        Access Resources
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="mt-4">
                  <CardContent className="p-4">
                    <h3 className="font-medium mb-2">Key Takeaways</h3>
                    <div className="space-y-2 text-sm">
                      <p>
                        This case demonstrates the importance of recognizing patterns in laboratory results
                        that indicate related pathophysiological processes.
                      </p>
                      <ul className="list-disc ml-4 text-xs text-muted-foreground space-y-1 mt-2">
                        <li>Multiple abnormal results often reflect a single underlying disease process</li>
                        <li>Always correlate laboratory findings with clinical presentation</li>
                        <li>Consider pre-analytical factors that may affect test results</li>
                        <li>Think about next steps in patient management when interpreting results</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

// Default patient data
const defaultPatientData: PatientData = {
  id: 'PT-10045872',
  age: 68,
  gender: 'Male',
  symptoms: [
    'Fatigue',
    'Weight loss',
    'Increased thirst',
    'Frequent urination',
    'Blurred vision occasionally'
  ],
  medicalHistory: 'Hypertension for 10 years, recently diagnosed type 2 diabetes mellitus (3 months ago)',
  currentMedications: [
    'Metformin 1000mg twice daily',
    'Lisinopril 20mg once daily',
    'Aspirin 81mg once daily'
  ]
};

// Sample results for a diabetic patient
const diabeticPatientResults: LaboratoryResult[] = [
  {
    id: 'result-1',
    test: 'Glucose',
    value: 287,
    units: 'mg/dL',
    referenceRange: { low: 70, high: 99 },
    category: 'chemistry',
    timestamp: new Date(),
    flags: ['H', 'Critical']
  },
  {
    id: 'result-2',
    test: 'BUN',
    value: 25,
    units: 'mg/dL',
    referenceRange: { low: 7, high: 20 },
    category: 'chemistry',
    timestamp: new Date(),
    flags: ['H']
  },
  {
    id: 'result-3',
    test: 'Creatinine',
    value: 1.4,
    units: 'mg/dL',
    referenceRange: { low: 0.7, high: 1.3 },
    category: 'chemistry',
    timestamp: new Date(),
    flags: ['H']
  },
  {
    id: 'result-4',
    test: 'Sodium',
    value: 138,
    units: 'mmol/L',
    referenceRange: { low: 135, high: 145 },
    category: 'chemistry',
    timestamp: new Date()
  },
  {
    id: 'result-5',
    test: 'Potassium',
    value: 4.5,
    units: 'mmol/L',
    referenceRange: { low: 3.5, high: 5.0 },
    category: 'chemistry',
    timestamp: new Date()
  },
  {
    id: 'result-6',
    test: 'Chloride',
    value: 102,
    units: 'mmol/L',
    referenceRange: { low: 98, high: 107 },
    category: 'chemistry',
    timestamp: new Date()
  },
  {
    id: 'result-7',
    test: 'CO2',
    value: 24,
    units: 'mmol/L',
    referenceRange: { low: 22, high: 29 },
    category: 'chemistry',
    timestamp: new Date()
  },
  {
    id: 'result-8',
    test: 'Calcium',
    value: 9.5,
    units: 'mg/dL',
    referenceRange: { low: 8.5, high: 10.5 },
    category: 'chemistry',
    timestamp: new Date()
  },
  {
    id: 'result-9',
    test: 'Total Cholesterol',
    value: 228,
    units: 'mg/dL',
    referenceRange: { low: 0, high: 200 },
    category: 'chemistry',
    timestamp: new Date(),
    flags: ['H']
  },
  {
    id: 'result-10',
    test: 'Triglycerides',
    value: 320,
    units: 'mg/dL',
    referenceRange: { low: 0, high: 150 },
    category: 'chemistry',
    timestamp: new Date(),
    flags: ['H']
  },
  {
    id: 'result-11',
    test: 'HDL Cholesterol',
    value: 32,
    units: 'mg/dL',
    referenceRange: { low: 40, high: 60 },
    category: 'chemistry',
    timestamp: new Date(),
    flags: ['L']
  },
  {
    id: 'result-12',
    test: 'LDL Cholesterol',
    value: 132,
    units: 'mg/dL',
    referenceRange: { low: 0, high: 130 },
    category: 'chemistry',
    timestamp: new Date(),
    flags: ['H']
  },
  {
    id: 'result-13',
    test: 'AST',
    value: 48,
    units: 'U/L',
    referenceRange: { low: 10, high: 40 },
    category: 'chemistry',
    timestamp: new Date(),
    flags: ['H']
  },
  {
    id: 'result-14',
    test: 'ALT',
    value: 62,
    units: 'U/L',
    referenceRange: { low: 10, high: 55 },
    category: 'chemistry',
    timestamp: new Date(),
    flags: ['H']
  },
  {
    id: 'result-15',
    test: 'ALP',
    value: 85,
    units: 'U/L',
    referenceRange: { low: 40, high: 130 },
    category: 'chemistry',
    timestamp: new Date()
  },
  {
    id: 'result-16',
    test: 'Total Bilirubin',
    value: 0.8,
    units: 'mg/dL',
    referenceRange: { low: 0.1, high: 1.2 },
    category: 'chemistry',
    timestamp: new Date()
  },
  {
    id: 'result-17',
    test: 'Albumin',
    value: 3.8,
    units: 'g/dL',
    referenceRange: { low: 3.5, high: 5.0 },
    category: 'chemistry',
    timestamp: new Date()
  },
  {
    id: 'result-18',
    test: 'HbA1c',
    value: 9.8,
    units: '%',
    referenceRange: { low: 4.0, high: 5.6 },
    category: 'chemistry',
    timestamp: new Date(),
    flags: ['H', 'Critical']
  },
  {
    id: 'result-19',
    test: 'Urine Albumin',
    value: 45,
    units: 'mg/L',
    referenceRange: { low: 0, high: 20 },
    category: 'chemistry',
    timestamp: new Date(),
    flags: ['H']
  }
];