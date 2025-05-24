import { useState } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface HeaderProps {
  toggleSidebar: () => void;
}

export function Header({ toggleSidebar }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle search functionality
    console.log("Searching for:", searchQuery);
  };

  return (
    <div className="relative z-10 flex-shrink-0 flex h-16 bg-card shadow">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden px-4 text-muted-foreground"
        onClick={toggleSidebar}
      >
        <span className="material-icons">menu</span>
      </Button>
      
      <div className="flex-1 px-4 flex justify-between">
        <div className="flex-1 flex items-center">
          <div className="max-w-2xl w-full">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-icons text-muted-foreground">search</span>
                </div>
                <Input
                  className="block w-full pl-10 pr-3 py-2 border rounded-md"
                  placeholder="Search labs, procedures, or resources"
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </form>
          </div>
        </div>
        
        <div className="ml-4 flex items-center md:ml-6">
          <Button
            variant="ghost"
            size="icon"
            className="p-1 rounded-full text-muted-foreground hover:text-foreground"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <span className="material-icons">
              {theme === "dark" ? "light_mode" : "dark_mode"}
            </span>
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="p-1 rounded-full text-muted-foreground hover:text-foreground ml-2"
          >
            <span className="material-icons">notifications</span>
          </Button>
          
          <div className="ml-3 relative">
            <div>
              <Button
                variant="ghost"
                size="icon"
                className="max-w-xs bg-card flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                aria-expanded="false"
              >
                <span className="sr-only">Open user menu</span>
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                  <span className="material-icons text-muted-foreground">person</span>
                </div>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
