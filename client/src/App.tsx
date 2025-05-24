import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Microbiology from "@/pages/Microbiology";
import ClinicalChemistry from "@/pages/ClinicalChemistry";
import Histopathology from "@/pages/Histopathology";
import Simulation from "@/pages/Simulation";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/departments/microbiology" component={Microbiology} />
      <Route path="/departments/clinical-chemistry" component={ClinicalChemistry} />
      <Route path="/departments/histopathology" component={Histopathology} />
      <Route path="/simulations/:id" component={Simulation} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
