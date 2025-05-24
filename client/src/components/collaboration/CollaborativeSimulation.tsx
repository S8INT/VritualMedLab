import { useState, useRef, useEffect } from 'react';
import { CollaborativeSession } from './CollaborativeSession';
import { AnnotationLayer } from './AnnotationLayer';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';

interface CollaborativeSimulationProps {
  children: React.ReactNode;
  username: string;
  userId: string;
  simulationId: number;
  departmentType: string;
  currentStep: number;
  onStepChange: (step: number) => void;
}

export function CollaborativeSimulation({
  children,
  username,
  userId,
  simulationId,
  departmentType,
  currentStep,
  onStepChange
}: CollaborativeSimulationProps) {
  const [showCollaboration, setShowCollaboration] = useState(false);
  const [annotations, setAnnotations] = useState<any[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle adding an annotation
  const handleAddAnnotation = (x: number, y: number, text: string, color: string) => {
    const newAnnotation = {
      id: Math.random().toString(36).substring(2, 15),
      x,
      y,
      text,
      author: username,
      color,
      timestamp: new Date()
    };
    
    setAnnotations(prev => [...prev, newAnnotation]);
    
    // This would be handled by the CollaborativeSession component to broadcast to other users
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
      <div className={`lg:col-span-${showCollaboration ? '2' : '3'} relative h-full`} ref={containerRef}>
        {/* Main simulation content */}
        <div className="h-full">
          {children}
        </div>
        
        {/* Annotation layer */}
        <AnnotationLayer
          annotations={annotations}
          username={username}
          onAddAnnotation={handleAddAnnotation}
          containerRef={containerRef}
        />
        
        {/* Collaboration toggle button */}
        <div className="absolute top-4 right-4 z-20">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCollaboration(!showCollaboration)}
          >
            <Users className="mr-2 h-4 w-4" />
            {showCollaboration ? 'Hide Collaboration' : 'Show Collaboration'}
          </Button>
        </div>
      </div>
      
      {/* Collaborative session sidebar */}
      {showCollaboration && (
        <div className="lg:col-span-1 h-full">
          <CollaborativeSession
            username={username}
            userId={userId}
            simulationId={simulationId}
            departmentType={departmentType}
            onStepChange={onStepChange}
            currentStep={currentStep}
          />
        </div>
      )}
    </div>
  );
}