import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LabEquipmentViewer } from '@/components/3d/LabEquipmentViewer';

interface EquipmentInfo {
  type: 'microscope' | 'centrifuge' | 'spectrophotometer' | 'pipette' | 'incubator';
  name: string;
  description: string;
  usedFor: string[];
  specifications: Record<string, string>;
  safetyNotes: string[];
}

const equipmentData: EquipmentInfo[] = [
  {
    type: 'microscope',
    name: 'Laboratory Microscope',
    description: 'A high-resolution compound microscope used for observing microbial cultures, cell structures, and tissue samples.',
    usedFor: [
      'Examining bacterial morphology',
      'Cell counting and viability assessment',
      'Tissue histology examination',
      'Parasite identification'
    ],
    specifications: {
      'Magnification': '40x - 1000x',
      'Objective Lenses': '4x, 10x, 40x, 100x (oil immersion)',
      'Illumination': 'LED with adjustable intensity',
      'Stage': 'Mechanical with x-y movement'
    },
    safetyNotes: [
      'Always use both hands when carrying the microscope',
      'Begin focusing with the lowest power objective',
      'Never use organic solvents to clean lenses',
      'Turn off illumination when not in use'
    ]
  },
  {
    type: 'centrifuge',
    name: 'Laboratory Centrifuge',
    description: 'A device used to separate components of a liquid based on density through centrifugal force, essential for sample preparation.',
    usedFor: [
      'Separating blood components',
      'Isolating bacterial cells from culture media',
      'Concentrating suspended particles',
      'Separating immiscible liquids'
    ],
    specifications: {
      'Maximum Speed': '15,000 RPM',
      'Maximum RCF': '21,000 x g',
      'Capacity': '24 x 1.5/2.0 mL tubes',
      'Temperature Range': '4°C to 40°C'
    },
    safetyNotes: [
      'Always ensure the rotor is balanced before operation',
      'Never open the lid while the rotor is spinning',
      'Check tubes for cracks before centrifugation',
      'Use appropriate PPE when handling biological samples',
      'Secure the lid properly before starting'
    ]
  },
  {
    type: 'spectrophotometer',
    name: 'UV-Visible Spectrophotometer',
    description: 'An analytical instrument that measures the intensity of light absorbed by a sample across the ultraviolet and visible light spectrum.',
    usedFor: [
      'Protein concentration determination',
      'DNA/RNA quantification',
      'Enzyme activity assays',
      'Growth measurements of bacterial cultures'
    ],
    specifications: {
      'Wavelength Range': '190-1100 nm',
      'Bandwidth': '1.8 nm',
      'Photometric Range': '-3.0 to 3.0 Abs',
      'Light Source': 'Xenon flash lamp'
    },
    safetyNotes: [
      'Avoid direct exposure to UV light',
      'Handle quartz cuvettes with care',
      'Clean up spills immediately',
      'Dispose of chemical waste properly',
      'Never use damaged cuvettes'
    ]
  },
  {
    type: 'pipette',
    name: 'Adjustable Micropipette',
    description: 'A precision instrument used to transfer small, accurately measured volumes of liquid in laboratory procedures.',
    usedFor: [
      'Precise reagent dispensing',
      'Sample preparation',
      'PCR setup',
      'Serial dilutions'
    ],
    specifications: {
      'Volume Range': '10-100 µL',
      'Accuracy': '±0.8%',
      'Precision': '≤0.15%',
      'Channels': 'Single channel'
    },
    safetyNotes: [
      'Never rotate volume adjustment beyond the specified range',
      'Avoid pipetting corrosive solutions',
      'Release plunger slowly when aspirating',
      'Use appropriate tips for the volume range',
      'Calibrate regularly for accuracy'
    ]
  },
  {
    type: 'incubator',
    name: 'Laboratory Incubator',
    description: 'A device that maintains optimal temperature, humidity and other conditions for microbial growth, cell culture, or biochemical reactions.',
    usedFor: [
      'Bacterial culture growth',
      'Cell and tissue culture',
      'Enzyme reaction studies',
      'Egg incubation for vaccine production'
    ],
    specifications: {
      'Temperature Range': '5°C above ambient to 75°C',
      'Temperature Accuracy': '±0.1°C',
      'Capacity': '150 L',
      'Shelves': '3 adjustable'
    },
    safetyNotes: [
      'Ensure proper ventilation in the laboratory',
      'Avoid storing flammable materials inside',
      'Clean and decontaminate regularly',
      'Monitor temperature with secondary thermometer',
      'Never block air vents'
    ]
  }
];

export function EquipmentGallery() {
  const [selectedEquipment, setSelectedEquipment] = useState<string>(equipmentData[0].type);
  const [infoTab, setInfoTab] = useState<'description' | 'specs' | 'safety'>('description');
  
  const currentEquipment = equipmentData.find(eq => eq.type === selectedEquipment) || equipmentData[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* 3D Viewer Section */}
        <div className="lg:w-2/3">
          <Card className="h-full">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle>{currentEquipment.name}</CardTitle>
                <Badge variant="outline" className="text-xs">Interactive 3D Model</Badge>
              </div>
              <CardDescription>
                Rotate: Click and drag | Zoom: Scroll wheel
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative overflow-hidden rounded-md bg-muted/30">
                <LabEquipmentViewer
                  equipmentType={currentEquipment.type}
                  width={800}
                  height={400}
                  interactive={true}
                />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Information Section */}
        <div className="lg:w-1/3">
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle>Equipment Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs value={infoTab} onValueChange={(v) => setInfoTab(v as any)}>
                <TabsList className="w-full">
                  <TabsTrigger value="description">Description</TabsTrigger>
                  <TabsTrigger value="specs">Specifications</TabsTrigger>
                  <TabsTrigger value="safety">Safety</TabsTrigger>
                </TabsList>
                
                <TabsContent value="description" className="space-y-4 pt-4">
                  <p className="text-sm text-muted-foreground">
                    {currentEquipment.description}
                  </p>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2">Used For:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {currentEquipment.usedFor.map((use, i) => (
                        <li key={i} className="text-sm text-muted-foreground">{use}</li>
                      ))}
                    </ul>
                  </div>
                </TabsContent>
                
                <TabsContent value="specs" className="pt-4">
                  <div className="space-y-2">
                    {Object.entries(currentEquipment.specifications).map(([key, value], i) => (
                      <div key={i} className="flex justify-between py-1 border-b border-border">
                        <span className="text-sm font-medium">{key}</span>
                        <span className="text-sm text-muted-foreground">{value}</span>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="safety" className="pt-4">
                  <div className="p-3 border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950 rounded-md">
                    <h4 className="text-sm font-medium mb-2 text-amber-800 dark:text-amber-400">Important Safety Guidelines</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {currentEquipment.safetyNotes.map((note, i) => (
                        <li key={i} className="text-sm text-muted-foreground">{note}</li>
                      ))}
                    </ul>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Equipment Selection */}
      <div className="flex flex-wrap gap-2">
        {equipmentData.map(equipment => (
          <Button
            key={equipment.type}
            variant={selectedEquipment === equipment.type ? "default" : "outline"}
            onClick={() => setSelectedEquipment(equipment.type)}
            className="flex-1"
          >
            {equipment.name}
          </Button>
        ))}
      </div>
    </div>
  );
}