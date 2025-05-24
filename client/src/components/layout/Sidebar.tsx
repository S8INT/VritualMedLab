import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Department } from "@shared/schema";

export function Sidebar() {
  const [location] = useLocation();

  const { data: departments } = useQuery<Department[]>({
    queryKey: ["/api/departments"],
  });

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64 border-r border-border">
        <div className="flex items-center justify-center h-16 px-4 bg-primary text-primary-foreground">
          <h1 className="text-xl font-heading font-bold">VirtualLab</h1>
        </div>
        <div className="flex flex-col flex-grow overflow-y-auto">
          <nav className="flex-1 px-2 py-4 space-y-1">
            <Link href="/" className={`flex items-center px-4 py-3 text-sm font-medium rounded-md hover:bg-primary hover:bg-opacity-10 hover:text-primary sidebar-link ${location === "/" ? "bg-primary bg-opacity-10 text-primary active border-l-4 border-primary" : "text-foreground"}`}>
                <span className="material-icons mr-3">dashboard</span>
                Dashboard
            </Link>
            <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-4">
              Laboratory Departments
            </div>
            
            {departments?.map((dept) => {
              const deptSlug = dept.name.toLowerCase().replace(/\s+/g, '-');
              return (
                <Link 
                  key={dept.id} 
                  href={`/departments/${deptSlug}`}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-md hover:bg-${deptSlug} hover:bg-opacity-10 hover:text-${deptSlug} sidebar-link ${location === `/departments/${deptSlug}` ? `bg-${deptSlug} bg-opacity-10 text-${deptSlug} active border-l-4 border-${deptSlug}` : "text-foreground"}`}
                >
                  <span className={`dept-indicator bg-${deptSlug}`}></span>
                  {dept.name}
                </Link>
              );
            })}
            
            <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-4">
              Learning Resources
            </div>
            <Link 
              href="/library"
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-md hover:bg-muted text-foreground hover:text-primary ${location === "/library" ? "bg-muted text-primary" : ""}`}
            >
              <span className="material-icons mr-3 text-muted-foreground">menu_book</span>
              Library
            </Link>
            <Link 
              href="/tutorials"
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-md hover:bg-muted text-foreground hover:text-primary ${location === "/tutorials" ? "bg-muted text-primary" : ""}`}
            >
              <span className="material-icons mr-3 text-muted-foreground">school</span>
              Tutorials
            </Link>
            <Link 
              href="/assessments"
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-md hover:bg-muted text-foreground hover:text-primary ${location === "/assessments" ? "bg-muted text-primary" : ""}`}
            >
              <span className="material-icons mr-3 text-muted-foreground">quiz</span>
              Assessments
            </Link>
          </nav>
          <div className="p-4 border-t border-border">
            <Link 
              href="/help"
              className="flex items-center text-sm font-medium text-foreground hover:text-primary"
            >
              <span className="material-icons mr-3 text-muted-foreground">help_outline</span>
              Help & Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
