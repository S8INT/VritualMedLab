import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { HexColorPicker } from 'react-colorful';
import { MoreHorizontal, X, Edit, MessageCircle } from 'lucide-react';

interface Annotation {
  id: string;
  x: number;
  y: number;
  text: string;
  author: string;
  color: string;
  timestamp: Date;
}

interface AnnotationLayerProps {
  annotations: Annotation[];
  username: string;
  onAddAnnotation: (x: number, y: number, text: string, color: string) => void;
  readOnly?: boolean;
  containerRef: React.RefObject<HTMLDivElement>;
}

export function AnnotationLayer({
  annotations,
  username,
  onAddAnnotation,
  readOnly = false,
  containerRef
}: AnnotationLayerProps) {
  const [isAnnotating, setIsAnnotating] = useState(false);
  const [annotationText, setAnnotationText] = useState('');
  const [annotationColor, setAnnotationColor] = useState('#ff5733');
  const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const layerRef = useRef<HTMLDivElement>(null);

  // Update container size on resize
  useEffect(() => {
    if (!containerRef.current) return;

    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        });
      }
    };

    // Initial size
    updateSize();

    // Add resize observer
    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(containerRef.current);

    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
    };
  }, [containerRef]);

  // Handle clicking on the annotation layer
  const handleLayerClick = (e: React.MouseEvent) => {
    if (!isAnnotating || readOnly) return;

    // Get click coordinates relative to the layer
    const rect = layerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Create annotation
    if (annotationText.trim()) {
      onAddAnnotation(x, y, annotationText, annotationColor);
      setAnnotationText('');
      setIsAnnotating(false);
    } else {
      // If no text, show input at click position
      setSelectedAnnotation('new');
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: Date | string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      <div
        ref={layerRef}
        className={`absolute inset-0 z-10 ${isAnnotating && !readOnly ? 'cursor-crosshair' : ''}`}
        onClick={handleLayerClick}
      >
        {annotations.map(annotation => (
          <div
            key={annotation.id}
            className="absolute"
            style={{
              left: `${annotation.x}%`,
              top: `${annotation.y}%`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-white cursor-pointer"
              style={{ backgroundColor: annotation.color }}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedAnnotation(selectedAnnotation === annotation.id ? null : annotation.id);
              }}
            >
              <MessageCircle size={14} />
            </div>

            {selectedAnnotation === annotation.id && (
              <div
                className="absolute bg-background border rounded-md p-3 shadow-md z-20 w-[200px]"
                style={{ 
                  top: '100%', 
                  left: '50%', 
                  transform: 'translateX(-50%)',
                  marginTop: '0.5rem'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="font-medium">{annotation.author}</div>
                  <div 
                    className="text-muted-foreground cursor-pointer" 
                    onClick={() => setSelectedAnnotation(null)}
                  >
                    <X size={14} />
                  </div>
                </div>
                <div className="text-sm mb-2">{annotation.text}</div>
                <div className="text-xs text-muted-foreground">
                  {formatTimestamp(annotation.timestamp)}
                </div>
              </div>
            )}
          </div>
        ))}

        {selectedAnnotation === 'new' && (
          <div
            className="absolute bg-background border rounded-md p-3 shadow-md z-20 w-[250px]"
            style={{ 
              left: '50%', 
              top: '50%', 
              transform: 'translate(-50%, -50%)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-2">
              <div className="font-medium">New Annotation</div>
              <div 
                className="text-muted-foreground cursor-pointer" 
                onClick={() => setSelectedAnnotation(null)}
              >
                <X size={14} />
              </div>
            </div>
            <div className="space-y-2">
              <Input
                placeholder="Enter annotation text..."
                value={annotationText}
                onChange={(e) => setAnnotationText(e.target.value)}
                autoFocus
              />
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-5 h-5 rounded-full cursor-pointer"
                    style={{ backgroundColor: annotationColor }}
                    onClick={() => setShowColorPicker(!showColorPicker)}
                  />
                  {showColorPicker && (
                    <div className="absolute mt-2 z-30">
                      <HexColorPicker color={annotationColor} onChange={setAnnotationColor} />
                    </div>
                  )}
                </div>
                <Button 
                  size="sm"
                  onClick={() => {
                    if (annotationText.trim()) {
                      const rect = layerRef.current?.getBoundingClientRect();
                      if (!rect) return;
                      
                      // Get center of layer
                      const x = 50;
                      const y = 50;
                      
                      onAddAnnotation(x, y, annotationText, annotationColor);
                      setAnnotationText('');
                      setSelectedAnnotation(null);
                      setIsAnnotating(false);
                    }
                  }}
                >
                  Add
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {!readOnly && (
        <div className="absolute bottom-4 right-4 z-20">
          <Button
            variant={isAnnotating ? 'default' : 'outline'}
            size="sm"
            onClick={() => setIsAnnotating(!isAnnotating)}
          >
            <Edit className="mr-2 h-4 w-4" />
            {isAnnotating ? 'Cancel' : 'Add Annotation'}
          </Button>
        </div>
      )}
    </>
  );
}