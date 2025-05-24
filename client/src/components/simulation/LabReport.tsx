import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface LabReportProps {
  simulationId: number;
  simulationTitle: string;
  departmentName: string;
  simulationResults: any[];
  onSave: (reportData: any) => void;
}

export function LabReport({
  simulationId,
  simulationTitle,
  departmentName,
  simulationResults,
  onSave
}: LabReportProps) {
  const [activeTab, setActiveTab] = useState('observations');
  const [reportData, setReportData] = useState({
    simulationId,
    title: `Lab Report: ${simulationTitle}`,
    student: '',
    date: new Date().toISOString().split('T')[0],
    department: departmentName,
    observations: '',
    results: '',
    conclusions: '',
    questions: [
      { question: 'What were the most challenging aspects of this procedure?', answer: '' },
      { question: 'How would you modify this procedure to improve results?', answer: '' },
      { question: 'What are the clinical implications of your findings?', answer: '' }
    ]
  });

  // Update report data
  const handleInputChange = (field: string, value: string) => {
    setReportData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Update question answers
  const handleQuestionChange = (index: number, answer: string) => {
    const updatedQuestions = [...reportData.questions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      answer
    };
    
    setReportData(prev => ({
      ...prev,
      questions: updatedQuestions
    }));
  };

  // Save report
  const handleSaveReport = () => {
    // Add timestamps and simulation results
    const finalReport = {
      ...reportData,
      createdAt: new Date().toISOString(),
      simulationResults,
    };
    
    onSave(finalReport);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-heading flex items-center justify-between">
          <span>Lab Report</span>
          <span className="text-sm font-normal text-muted-foreground">{reportData.date}</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Basic information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Report Title</Label>
              <Input 
                id="title" 
                value={reportData.title} 
                onChange={(e) => handleInputChange('title', e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="student">Your Name</Label>
              <Input 
                id="student" 
                placeholder="Enter your name" 
                value={reportData.student} 
                onChange={(e) => handleInputChange('student', e.target.value)} 
              />
            </div>
          </div>
          
          {/* Tabs for different sections */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-6">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="observations">Observations</TabsTrigger>
              <TabsTrigger value="results">Results</TabsTrigger>
              <TabsTrigger value="conclusions">Conclusions</TabsTrigger>
            </TabsList>
            
            <TabsContent value="observations" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="observations">Laboratory Observations</Label>
                <Textarea 
                  id="observations" 
                  placeholder="Record your observations during the procedure..." 
                  className="min-h-[150px]"
                  value={reportData.observations} 
                  onChange={(e) => handleInputChange('observations', e.target.value)} 
                />
              </div>
              
              <div className="bg-muted/30 p-4 rounded-md">
                <h4 className="font-medium mb-2">Observation Tips:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Document any color changes or visible reactions</li>
                  <li>• Note the timing of key procedural steps</li>
                  <li>• Record any unexpected events or anomalies</li>
                  <li>• Describe physical characteristics of specimens/samples</li>
                </ul>
              </div>
            </TabsContent>
            
            <TabsContent value="results" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="results">Results & Data Analysis</Label>
                <Textarea 
                  id="results" 
                  placeholder="Record your results and analysis..." 
                  className="min-h-[150px]"
                  value={reportData.results} 
                  onChange={(e) => handleInputChange('results', e.target.value)} 
                />
              </div>
              
              {simulationResults.length > 0 && (
                <div className="border border-border rounded-md overflow-hidden">
                  <div className="bg-muted p-3 font-medium">Recorded Simulation Data</div>
                  <div className="p-3">
                    <pre className="text-xs overflow-auto whitespace-pre-wrap">
                      {JSON.stringify(simulationResults, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
              
              <div className="bg-muted/30 p-4 rounded-md">
                <h4 className="font-medium mb-2">Result Documentation Tips:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Quantify numerical results when possible</li>
                  <li>• Compare your results to expected reference ranges</li>
                  <li>• Include calculations and formulas used</li>
                  <li>• Note any statistical analysis applied</li>
                </ul>
              </div>
            </TabsContent>
            
            <TabsContent value="conclusions" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="conclusions">Conclusions & Discussion</Label>
                <Textarea 
                  id="conclusions" 
                  placeholder="Write your conclusions and discussion..." 
                  className="min-h-[150px]"
                  value={reportData.conclusions} 
                  onChange={(e) => handleInputChange('conclusions', e.target.value)} 
                />
              </div>
              
              <div className="space-y-4 mt-4">
                <h4 className="font-medium">Reflection Questions</h4>
                {reportData.questions.map((q, idx) => (
                  <div key={idx} className="space-y-2">
                    <Label htmlFor={`question-${idx}`}>{q.question}</Label>
                    <Textarea 
                      id={`question-${idx}`} 
                      placeholder="Enter your answer..."
                      value={q.answer} 
                      onChange={(e) => handleQuestionChange(idx, e.target.value)} 
                    />
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between border-t border-border pt-4 mt-4">
        <Button variant="outline">Preview Report</Button>
        <Button onClick={handleSaveReport}>Save Report</Button>
      </CardFooter>
    </Card>
  );
}