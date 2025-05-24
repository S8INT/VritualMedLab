import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { LabCard } from "@/components/ui/lab-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Department, Simulation } from "@shared/schema";
import { getDemoImage } from "@/data/images";

export default function ClinicalChemistry() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fetch departments
  const { data: departments } = useQuery<Department[]>({
    queryKey: ["/api/departments"],
  });

  // Find clinical chemistry department
  const chemistryDept = departments?.find(
    (dept) => dept.name.toLowerCase() === "clinical chemistry"
  );

  // Fetch simulations for clinical chemistry department
  const { data: simulations, isLoading: isLoadingSimulations } = useQuery<Simulation[]>({
    queryKey: ["/api/simulations", { departmentId: chemistryDept?.id }],
    enabled: !!chemistryDept?.id,
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
                  <div className="w-12 h-12 bg-chemistry rounded-md flex items-center justify-center mr-4">
                    <span className="material-icons text-white text-2xl">science</span>
                  </div>
                  <div>
                    <h1 className="text-2xl font-heading font-bold text-foreground">Clinical Chemistry Department</h1>
                    <p className="text-muted-foreground">{chemistryDept?.simulationCount || 0} simulations available</p>
                  </div>
                </div>
                <div className="mt-3 md:mt-0">
                  <Button variant="default" className="bg-chemistry hover:bg-chemistry/90 text-white">
                    <span className="material-icons mr-2 text-sm">add</span>
                    New Chemistry Lab
                  </Button>
                </div>
              </div>

              {/* Department Overview */}
              <Card className="mb-8">
                <CardContent className="p-6 flex flex-col md:flex-row items-center">
                  <div className="flex-1">
                    <h2 className="text-xl font-heading font-bold text-foreground mb-2">Clinical Chemistry Laboratory</h2>
                    <p className="text-foreground mb-4">{chemistryDept?.description || "Loading department information..."}</p>
                    <p className="text-foreground mb-4">Learn to analyze biochemical components in body fluids, interpret test results, and understand their clinical significance in diagnosing diseases.</p>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" className="text-chemistry border-chemistry hover:bg-chemistry/10">
                        <span className="material-icons mr-2 text-sm">school</span>
                        Learning Resources
                      </Button>
                      <Button variant="outline" className="text-chemistry border-chemistry hover:bg-chemistry/10">
                        <span className="material-icons mr-2 text-sm">help_outline</span>
                        Department Guide
                      </Button>
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0 md:ml-6 flex-shrink-0">
                    <img 
                      src={getDemoImage('clinicalChemistry')} 
                      alt="Clinical chemistry analyzer" 
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
                        name: "Clinical Chemistry"
                      }}
                      duration={simulation.duration}
                      imagePath={getDemoImage('clinicalChemistry')}
                    />
                  ))
                )}
              </div>

              {/* Common Tests */}
              <h2 className="text-lg font-heading font-semibold text-foreground mb-4">Common Tests</h2>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-heading">Glucose Testing</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Fasting glucose, glucose tolerance tests, and HbA1c for diabetes diagnosis and monitoring.</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-heading">Lipid Profile</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Total cholesterol, HDL, LDL, and triglycerides for cardiovascular risk assessment.</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-heading">Liver Function Tests</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">ALT, AST, bilirubin, albumin, and other markers for liver health evaluation.</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-heading">Kidney Function Tests</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Creatinine, BUN, eGFR, and electrolytes to assess renal function.</p>
                  </CardContent>
                </Card>
              </div>

              {/* Equipment */}
              <h2 className="text-lg font-heading font-semibold text-foreground mb-4">Laboratory Equipment</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-8">
                <Card className="overflow-hidden">
                  <div className="h-36 bg-chemistry bg-opacity-10 relative">
                    <img 
                      src={getDemoImage('equipment', 3)} 
                      alt="Clinical chemistry analyzer" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-heading font-medium mb-1">Chemistry Analyzers</h3>
                    <p className="text-sm text-muted-foreground">Automated systems for rapid analysis of multiple chemical parameters.</p>
                  </CardContent>
                </Card>
                
                <Card className="overflow-hidden">
                  <div className="h-36 bg-chemistry bg-opacity-10 relative">
                    <img 
                      src={getDemoImage('equipment', 1)} 
                      alt="Spectrophotometer" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-heading font-medium mb-1">Spectrophotometers</h3>
                    <p className="text-sm text-muted-foreground">Measure light absorption for quantitative analysis of biochemical substances.</p>
                  </CardContent>
                </Card>
                
                <Card className="overflow-hidden">
                  <div className="h-36 bg-chemistry bg-opacity-10 relative">
                    <img 
                      src={getDemoImage('equipment', 2)} 
                      alt="Centrifuge" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-heading font-medium mb-1">Centrifuges</h3>
                    <p className="text-sm text-muted-foreground">Separate serum or plasma from whole blood for analysis.</p>
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
