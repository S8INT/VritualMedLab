import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";

import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { LabCard } from "@/components/ui/lab-card";
import { DepartmentCard } from "@/components/ui/department-card";
import { ResourceCard } from "@/components/ui/resource-card";
import { ProgressCard } from "@/components/ui/progress-card";
import { CaseStudyCard } from "@/components/ui/case-study-card";
import { TestimonialCard } from "@/components/ui/testimonial-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";

import { Department, Simulation, CaseStudy, Resource, Testimonial } from "@shared/schema";
import { getDemoImage } from "@/data/images";

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fetch departments
  const { data: departments, isLoading: isLoadingDepartments } = useQuery<Department[]>({
    queryKey: ["/api/departments"],
  });

  // Fetch quick start simulations
  const { data: quickStartSimulations, isLoading: isLoadingSimulations } = useQuery<Simulation[]>({
    queryKey: ["/api/simulations/quickstart"],
  });

  // Fetch featured simulation
  const { data: featuredSimulation, isLoading: isLoadingFeatured } = useQuery<Simulation>({
    queryKey: ["/api/simulations/featured"],
  });

  // Fetch recent case studies
  const { data: recentCaseStudies, isLoading: isLoadingCases } = useQuery<CaseStudy[]>({
    queryKey: ["/api/case-studies/recent"],
  });

  // Fetch resources
  const { data: resources, isLoading: isLoadingResources } = useQuery<Resource[]>({
    queryKey: ["/api/resources"],
  });

  // Fetch testimonials
  const { data: testimonials, isLoading: isLoadingTestimonials } = useQuery<Testimonial[]>({
    queryKey: ["/api/testimonials"],
  });

  // Sample progress data - in a real app, this would come from the user's session
  const progressModules = [
    {
      id: 1,
      title: "Module 3: Specimen Collection & Processing",
      completed: 3,
      total: 5,
      status: "in-progress" as const,
    },
    {
      id: 2,
      title: "Module 4: Microscopy Techniques",
      completed: 0,
      total: 4,
      status: "not-started" as const,
    },
    {
      id: 3,
      title: "Module 5: Basic Hematology Tests",
      completed: 0,
      total: 6,
      status: "locked" as const,
      prerequisiteId: 2,
    },
  ];

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
                <h1 className="text-2xl font-heading font-bold text-foreground">Dashboard</h1>
                <div className="mt-3 md:mt-0">
                  <Button variant="default" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    <span className="material-icons mr-2 text-sm">add</span>
                    New Lab Session
                  </Button>
                </div>
              </div>

              {/* Welcome Banner */}
              <Card className="mb-8">
                <CardContent className="p-6 flex flex-col md:flex-row items-center">
                  <div className="flex-1">
                    <h2 className="text-xl font-heading font-bold text-foreground mb-2">Welcome to VirtualLab</h2>
                    <p className="text-foreground mb-4">A comprehensive platform for learning medical laboratory clinical practice through virtual simulations and interactive exercises.</p>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" className="text-primary border-primary hover:bg-primary/10">
                        Tour the Platform
                      </Button>
                      <Button variant="outline" className="text-secondary border-secondary hover:bg-secondary/10">
                        View Tutorial
                      </Button>
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0 md:ml-6 flex-shrink-0">
                    <img 
                      src={getDemoImage('equipment')} 
                      alt="Laboratory microscope" 
                      className="h-32 w-auto rounded-md shadow-sm" 
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Quick Start Lab Simulations */}
              <h2 className="text-lg font-heading font-semibold text-foreground mb-4">Quick Start Lab Simulations</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
                {isLoadingSimulations ? (
                  <p>Loading simulations...</p>
                ) : (
                  quickStartSimulations?.map((lab) => (
                    <LabCard
                      key={lab.id}
                      id={lab.id}
                      title={lab.title}
                      description={lab.description}
                      department={{
                        id: lab.departmentId,
                        name: departments?.find(d => d.id === lab.departmentId)?.name || "Unknown Department"
                      }}
                      duration={lab.duration}
                      imagePath={getDemoImage(departments?.find(d => d.id === lab.departmentId)?.name.toLowerCase() || 'equipment')}
                    />
                  ))
                )}
              </div>

              {/* Current Course Progress */}
              <div className="flex flex-col md:flex-row gap-8 mb-8">
                <div className="w-full md:w-2/3">
                  <h2 className="text-lg font-heading font-semibold text-foreground mb-4">Your Current Progress</h2>
                  <Card>
                    <CardHeader className="pb-2 border-b border-border">
                      <CardTitle className="text-lg font-heading font-medium">Clinical Diagnosis Fundamentals</CardTitle>
                      <p className="mt-1 text-sm text-muted-foreground">Course Progress: 42% Complete</p>
                      <div className="w-full bg-muted rounded-full h-2.5 mt-2">
                        <div className="bg-primary h-2.5 rounded-full" style={{ width: "42%" }}></div>
                      </div>
                    </CardHeader>
                    <ul className="divide-y divide-border">
                      {progressModules.map((module) => (
                        <ProgressCard
                          key={module.id}
                          id={module.id}
                          title={module.title}
                          completed={module.completed}
                          total={module.total}
                          status={module.status}
                          prerequisiteId={module.prerequisiteId}
                        />
                      ))}
                    </ul>
                  </Card>
                </div>

                <div className="w-full md:w-1/3">
                  <h2 className="text-lg font-heading font-semibold text-foreground mb-4">Recent Case Studies</h2>
                  <Card>
                    <CardHeader className="pb-2 border-b border-border">
                      <CardTitle className="text-lg font-heading font-medium">Clinical Cases</CardTitle>
                    </CardHeader>
                    <ul className="divide-y divide-border">
                      {isLoadingCases ? (
                        <p className="p-4">Loading case studies...</p>
                      ) : (
                        recentCaseStudies?.map((caseStudy) => (
                          <CaseStudyCard
                            key={caseStudy.id}
                            id={caseStudy.id}
                            title={caseStudy.title}
                            department={{
                              id: caseStudy.departmentId,
                              name: departments?.find(d => d.id === caseStudy.departmentId)?.name || "Unknown Department"
                            }}
                            duration={caseStudy.duration}
                            status={caseStudy.status}
                          />
                        ))
                      )}
                    </ul>
                    <CardFooter className="bg-muted/50 p-4">
                      <Link 
                        href="/case-studies"
                        className="text-sm font-medium text-primary hover:text-primary/80"
                      >
                        View all cases <span aria-hidden="true">&rarr;</span>
                      </Link>
                    </CardFooter>
                  </Card>
                </div>
              </div>

              {/* Featured Lab Simulation */}
              {featuredSimulation && (
                <>
                  <h2 className="text-lg font-heading font-semibold text-foreground mb-4">Featured Lab Simulation</h2>
                  <Card className="overflow-hidden mb-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3">
                      <div className="lg:col-span-1 h-full">
                        <img 
                          src={getDemoImage('malariaParasite')} 
                          alt={featuredSimulation.title} 
                          className="h-full w-full object-cover" 
                        />
                      </div>
                      <div className="lg:col-span-2 p-6">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-microbiology bg-opacity-10 text-microbiology mb-2">
                              Advanced Simulation
                            </div>
                            <h3 className="text-xl font-heading font-bold text-foreground">{featuredSimulation.title}</h3>
                          </div>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-status-success bg-opacity-10 text-status-success">
                            Popular
                          </span>
                        </div>
                        <p className="mt-2 text-foreground">{featuredSimulation.description}</p>
                        
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-sm font-semibold text-foreground mb-2">Learning Objectives:</h4>
                            <ul className="text-sm text-foreground space-y-1">
                              {(featuredSimulation.objectives as string[]).map((objective, index) => (
                                <li key={index} className="flex items-start">
                                  <span className="material-icons text-primary mr-1 text-sm">check_circle</span>
                                  {objective}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-foreground mb-2">Simulation Details:</h4>
                            <div className="text-sm text-foreground space-y-2">
                              <div className="flex items-center">
                                <span className="material-icons text-muted-foreground mr-2 text-sm">schedule</span>
                                <span>{featuredSimulation.duration}</span>
                              </div>
                              <div className="flex items-center">
                                <span className="material-icons text-muted-foreground mr-2 text-sm">signal_cellular_alt</span>
                                <span>{featuredSimulation.level} level</span>
                              </div>
                              <div className="flex items-center">
                                <span className="material-icons text-muted-foreground mr-2 text-sm">wifi</span>
                                <span>{featuredSimulation.lowBandwidth ? "Low bandwidth mode available" : "Standard bandwidth required"}</span>
                              </div>
                              <div className="flex items-center">
                                <span className="material-icons text-muted-foreground mr-2 text-sm">language</span>
                                <span>Multiple languages</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-6 flex flex-col sm:flex-row gap-3">
                          <Button className="bg-microbiology hover:bg-microbiology/90 text-white">
                            <span className="material-icons mr-2">play_arrow</span>
                            Start Simulation
                          </Button>
                          <Button variant="outline">
                            <span className="material-icons mr-2">info</span>
                            View Details
                          </Button>
                          <Button variant="outline" className="sm:ml-auto">
                            <span className="material-icons mr-2">bookmark_border</span>
                            Save For Later
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </>
              )}

              {/* Explore Laboratory Departments */}
              <h2 className="text-lg font-heading font-semibold text-foreground mb-4">Explore Laboratory Departments</h2>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
                {isLoadingDepartments ? (
                  <p>Loading departments...</p>
                ) : (
                  departments?.map((department) => (
                    <DepartmentCard
                      key={department.id}
                      id={department.id}
                      name={department.name}
                      description={department.description}
                      color={department.color}
                      icon={department.icon}
                      simulationCount={department.simulationCount}
                    />
                  ))
                )}
              </div>

              {/* Educational Resources */}
              <h2 className="text-lg font-heading font-semibold text-foreground mb-4">Educational Resources</h2>
              <Card className="overflow-hidden mb-8">
                <CardHeader className="pb-2 border-b border-border">
                  <CardTitle className="text-lg font-heading font-medium">Reference Materials & Tutorials</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {isLoadingResources ? (
                      <p>Loading resources...</p>
                    ) : (
                      resources?.map((resource) => (
                        <ResourceCard
                          key={resource.id}
                          id={resource.id}
                          title={resource.title}
                          description={resource.description}
                          type={resource.type}
                          icon={resource.icon}
                        />
                      ))
                    )}
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/50 p-4 text-right">
                  <Link href="/resources">
                    <a className="text-sm font-medium text-primary hover:text-primary/80">
                      Browse all resources <span aria-hidden="true">&rarr;</span>
                    </a>
                  </Link>
                </CardFooter>
              </Card>

              {/* Testimonials */}
              <Card className="overflow-hidden mb-8">
                <CardHeader className="pb-2 border-b border-border">
                  <CardTitle className="text-lg font-heading font-medium">What Students Say</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {isLoadingTestimonials ? (
                      <p>Loading testimonials...</p>
                    ) : (
                      testimonials?.map((testimonial) => (
                        <TestimonialCard
                          key={testimonial.id}
                          name={testimonial.name}
                          role={testimonial.role}
                          institution={testimonial.institution}
                          country={testimonial.country}
                          text={testimonial.text}
                          rating={testimonial.rating}
                        />
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
