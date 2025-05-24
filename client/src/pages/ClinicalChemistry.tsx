import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";

import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { LabCard } from "@/components/ui/lab-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Department, Simulation } from "@shared/schema";
import { getDemoImage } from "@/data/images";
import { clinicalChemistryScenarios } from "@/data/clinicalChemistryScenarios";

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
              
              <Tabs defaultValue="all" className="mb-8">
                <TabsList className="mb-4">
                  <TabsTrigger value="all">All Simulations</TabsTrigger>
                  <TabsTrigger value="calibration">Analyzer Calibration</TabsTrigger>
                  <TabsTrigger value="reagents">Reagent Preparation</TabsTrigger>
                  <TabsTrigger value="interpretation">Result Interpretation</TabsTrigger>
                </TabsList>
                
                <TabsContent value="all">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {clinicalChemistryScenarios.map((scenario) => (
                      <Link key={scenario.id} href={`/simulations/${scenario.id}`}>
                        <a className="block">
                          <LabCard
                            id={scenario.id}
                            title={scenario.title}
                            description={scenario.description}
                            department={{
                              id: 2, // Assuming Clinical Chemistry department ID is 2
                              name: "Clinical Chemistry"
                            }}
                            duration="30-45 min"
                            imagePath={scenario.specimens[0]?.image || getDemoImage('clinicalChemistry')}
                          />
                        </a>
                      </Link>
                    ))}
                    
                    {isLoadingSimulations ? (
                      <p>Loading additional simulations...</p>
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
                </TabsContent>
                
                <TabsContent value="calibration">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <Link href={`/simulations/${clinicalChemistryScenarios[0]?.id}`}>
                      <a className="block">
                        <LabCard
                          id={clinicalChemistryScenarios[0]?.id || 10}
                          title={clinicalChemistryScenarios[0]?.title || "Analyzer Calibration & Quality Control"}
                          description={clinicalChemistryScenarios[0]?.description || "Learn how to perform proper calibration and quality control procedures for a clinical chemistry analyzer."}
                          department={{
                            id: 2,
                            name: "Clinical Chemistry"
                          }}
                          duration="30-45 min"
                          imagePath={clinicalChemistryScenarios[0]?.specimens[0]?.image || getDemoImage('clinicalChemistry')}
                        />
                      </a>
                    </Link>
                    
                    {/* Featured calibration procedures */}
                    <Card className="overflow-hidden border-dashed border-2 hover:border-chemistry hover:bg-chemistry/5 transition-colors">
                      <CardContent className="p-6">
                        <div className="flex flex-col h-full justify-center items-center text-center p-4">
                          <div className="w-16 h-16 bg-chemistry/10 rounded-full flex items-center justify-center mb-4">
                            <span className="material-icons text-chemistry text-2xl">science</span>
                          </div>
                          <h3 className="text-lg font-heading font-medium mb-2">Daily QC Procedures</h3>
                          <p className="text-sm text-muted-foreground mb-4">Perform and monitor daily quality control procedures using Levey-Jennings charts.</p>
                          <Button variant="outline" className="text-chemistry border-chemistry hover:bg-chemistry/10 mt-auto">
                            Coming Soon
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="overflow-hidden border-dashed border-2 hover:border-chemistry hover:bg-chemistry/5 transition-colors">
                      <CardContent className="p-6">
                        <div className="flex flex-col h-full justify-center items-center text-center p-4">
                          <div className="w-16 h-16 bg-chemistry/10 rounded-full flex items-center justify-center mb-4">
                            <span className="material-icons text-chemistry text-2xl">analytics</span>
                          </div>
                          <h3 className="text-lg font-heading font-medium mb-2">Method Validation</h3>
                          <p className="text-sm text-muted-foreground mb-4">Learn how to validate a new analytical method using accuracy, precision, and linearity studies.</p>
                          <Button variant="outline" className="text-chemistry border-chemistry hover:bg-chemistry/10 mt-auto">
                            Coming Soon
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="reagents">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <Link href={`/simulations/${clinicalChemistryScenarios[1]?.id}`}>
                      <a className="block">
                        <LabCard
                          id={clinicalChemistryScenarios[1]?.id || 11}
                          title={clinicalChemistryScenarios[1]?.title || "Reagent Preparation & Storage"}
                          description={clinicalChemistryScenarios[1]?.description || "Learn proper techniques for preparing, validating, and storing reagents used in clinical chemistry testing."}
                          department={{
                            id: 2,
                            name: "Clinical Chemistry"
                          }}
                          duration="30-45 min"
                          imagePath={clinicalChemistryScenarios[1]?.specimens[0]?.image || getDemoImage('clinicalChemistry')}
                        />
                      </a>
                    </Link>
                    
                    <Card className="overflow-hidden border-dashed border-2 hover:border-chemistry hover:bg-chemistry/5 transition-colors">
                      <CardContent className="p-6">
                        <div className="flex flex-col h-full justify-center items-center text-center p-4">
                          <div className="w-16 h-16 bg-chemistry/10 rounded-full flex items-center justify-center mb-4">
                            <span className="material-icons text-chemistry text-2xl">opacity</span>
                          </div>
                          <h3 className="text-lg font-heading font-medium mb-2">Buffer Preparation</h3>
                          <p className="text-sm text-muted-foreground mb-4">Master the preparation of common laboratory buffers with precise pH adjustment and validation.</p>
                          <Button variant="outline" className="text-chemistry border-chemistry hover:bg-chemistry/10 mt-auto">
                            Coming Soon
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="overflow-hidden border-dashed border-2 hover:border-chemistry hover:bg-chemistry/5 transition-colors">
                      <CardContent className="p-6">
                        <div className="flex flex-col h-full justify-center items-center text-center p-4">
                          <div className="w-16 h-16 bg-chemistry/10 rounded-full flex items-center justify-center mb-4">
                            <span className="material-icons text-chemistry text-2xl">science</span>
                          </div>
                          <h3 className="text-lg font-heading font-medium mb-2">Working Calibrators</h3>
                          <p className="text-sm text-muted-foreground mb-4">Prepare multi-level calibrators for chemistry analyzers following proper dilution techniques.</p>
                          <Button variant="outline" className="text-chemistry border-chemistry hover:bg-chemistry/10 mt-auto">
                            Coming Soon
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="interpretation">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <Link href={`/simulations/${clinicalChemistryScenarios[2]?.id}`}>
                      <a className="block">
                        <LabCard
                          id={clinicalChemistryScenarios[2]?.id || 12}
                          title={clinicalChemistryScenarios[2]?.title || "Interpreting Abnormal Chemistry Results"}
                          description={clinicalChemistryScenarios[2]?.description || "Learn to recognize patterns of abnormal laboratory results and interpret their clinical significance."}
                          department={{
                            id: 2,
                            name: "Clinical Chemistry"
                          }}
                          duration="30-45 min"
                          imagePath={clinicalChemistryScenarios[2]?.specimens[0]?.image || getDemoImage('clinicalChemistry')}
                        />
                      </a>
                    </Link>
                    
                    <Card className="overflow-hidden border-dashed border-2 hover:border-chemistry hover:bg-chemistry/5 transition-colors">
                      <CardContent className="p-6">
                        <div className="flex flex-col h-full justify-center items-center text-center p-4">
                          <div className="w-16 h-16 bg-chemistry/10 rounded-full flex items-center justify-center mb-4">
                            <span className="material-icons text-chemistry text-2xl">healing</span>
                          </div>
                          <h3 className="text-lg font-heading font-medium mb-2">Diabetes Case Studies</h3>
                          <p className="text-sm text-muted-foreground mb-4">Analyze complex diabetes cases with glucose, HbA1c, and lipid abnormalities requiring clinical correlation.</p>
                          <Button variant="outline" className="text-chemistry border-chemistry hover:bg-chemistry/10 mt-auto">
                            Coming Soon
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="overflow-hidden border-dashed border-2 hover:border-chemistry hover:bg-chemistry/5 transition-colors">
                      <CardContent className="p-6">
                        <div className="flex flex-col h-full justify-center items-center text-center p-4">
                          <div className="w-16 h-16 bg-chemistry/10 rounded-full flex items-center justify-center mb-4">
                            <span className="material-icons text-chemistry text-2xl">favorite</span>
                          </div>
                          <h3 className="text-lg font-heading font-medium mb-2">Cardiac Markers</h3>
                          <p className="text-sm text-muted-foreground mb-4">Interpret cardiac marker patterns in acute coronary syndrome and differentiate from non-cardiac causes.</p>
                          <Button variant="outline" className="text-chemistry border-chemistry hover:bg-chemistry/10 mt-auto">
                            Coming Soon
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>

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
