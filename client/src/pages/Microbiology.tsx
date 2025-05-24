import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { LabCard } from "@/components/ui/lab-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Department, Simulation } from "@shared/schema";
import { getDemoImage } from "@/data/images";

export default function Microbiology() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fetch departments
  const { data: departments } = useQuery<Department[]>({
    queryKey: ["/api/departments"],
  });

  // Find microbiology department
  const microbiologyDept = departments?.find(
    (dept) => dept.name.toLowerCase() === "microbiology"
  );

  // Fetch simulations for microbiology department
  const { data: simulations, isLoading: isLoadingSimulations } = useQuery<Simulation[]>({
    queryKey: ["/api/simulations", { departmentId: microbiologyDept?.id }],
    enabled: !!microbiologyDept?.id,
  });

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-black/20" onClick={toggleSidebar}></div>
          <div className="fixed inset-y-0 left-0 w-64 bg-card shadow-lg">
            <Sidebar />
          </div>
        </div>
      )}
      <Sidebar />

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header toggleSidebar={toggleSidebar} />

        {/* Content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-microbiology rounded-md flex items-center justify-center mr-4">
                    <span className="material-icons text-white text-2xl">biotech</span>
                  </div>
                  <div>
                    <h1 className="text-2xl font-heading font-bold text-foreground">Microbiology Department</h1>
                    <p className="text-muted-foreground">{microbiologyDept?.simulationCount || 0} simulations available</p>
                  </div>
                </div>
                <div className="mt-3 md:mt-0">
                  <Button variant="default" className="bg-microbiology hover:bg-microbiology/90 text-white">
                    <span className="material-icons mr-2 text-sm">add</span>
                    New Microbiology Lab
                  </Button>
                </div>
              </div>

              {/* Department Overview */}
              <Card className="mb-8">
                <CardContent className="p-6 flex flex-col md:flex-row items-center">
                  <div className="flex-1">
                    <h2 className="text-xl font-heading font-bold text-foreground mb-2">Microbiology Laboratory</h2>
                    <p className="text-foreground mb-4">{microbiologyDept?.description || "Loading department information..."}</p>
                    <p className="text-foreground mb-4">Practice essential microbiology techniques including sample processing, culture preparation, staining, microscopy, and identification of pathogens.</p>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" className="text-microbiology border-microbiology hover:bg-microbiology/10">
                        <span className="material-icons mr-2 text-sm">school</span>
                        Learning Resources
                      </Button>
                      <Button variant="outline" className="text-microbiology border-microbiology hover:bg-microbiology/10">
                        <span className="material-icons mr-2 text-sm">help_outline</span>
                        Department Guide
                      </Button>
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0 md:ml-6 flex-shrink-0">
                    <img 
                      src={getDemoImage('microbiology')} 
                      alt="Microbiology laboratory workstation" 
                      className="h-40 w-auto rounded-md shadow-sm" 
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Laboratory Simulations */}
              <h2 className="text-lg font-heading font-semibold text-foreground mb-4">Available Simulations</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
                {isLoadingSimulations ? (
                  <p>Loading simulations...</p>
                ) : (
                  simulations?.map((simulation) => (
                    <LabCard
                      key={simulation.id}
                      id={simulation.id}
                      title={simulation.title}
                      description={simulation.description}
                      department={{
                        id: simulation.departmentId,
                        name: "Microbiology"
                      }}
                      duration={simulation.duration}
                      imagePath={getDemoImage('microbiology')}
                    />
                  ))
                )}
              </div>

              {/* Equipment and Techniques */}
              <h2 className="text-lg font-heading font-semibold text-foreground mb-4">Equipment & Techniques</h2>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-heading">Microscopy</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Learn to use bright-field, dark-field, and fluorescence microscopy for microbial identification.</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-heading">Culture Techniques</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Practice preparing media, streaking plates, and isolating pure cultures.</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-heading">Staining Methods</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Master Gram stain, acid-fast stain, and other critical staining procedures.</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-heading">Antimicrobial Testing</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Perform disk diffusion and MIC tests to determine antibiotic susceptibility.</p>
                  </CardContent>
                </Card>
              </div>

              {/* Common Specimens */}
              <h2 className="text-lg font-heading font-semibold text-foreground mb-4">Common Specimens</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-8">
                <Card className="overflow-hidden">
                  <div className="h-36 bg-microbiology bg-opacity-10 relative">
                    <img 
                      src={getDemoImage('specimens', 0)} 
                      alt="Blood culture specimen" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-heading font-medium mb-1">Blood Cultures</h3>
                    <p className="text-sm text-muted-foreground">Detect bacteremia and fungemia in bloodstream infections.</p>
                  </CardContent>
                </Card>
                
                <Card className="overflow-hidden">
                  <div className="h-36 bg-microbiology bg-opacity-10 relative">
                    <img 
                      src={getDemoImage('specimens', 2)} 
                      alt="Urine specimen" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-heading font-medium mb-1">Respiratory Samples</h3>
                    <p className="text-sm text-muted-foreground">Identify pathogens in sputum, throat swabs, and BAL specimens.</p>
                  </CardContent>
                </Card>
                
                <Card className="overflow-hidden">
                  <div className="h-36 bg-microbiology bg-opacity-10 relative">
                    <img 
                      src={getDemoImage('specimens', 3)} 
                      alt="Wound swab specimen" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-heading font-medium mb-1">Wound Cultures</h3>
                    <p className="text-sm text-muted-foreground">Process and analyze swabs from wounds, abscesses, and lesions.</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
