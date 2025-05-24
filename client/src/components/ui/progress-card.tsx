import { Button } from "@/components/ui/button";

interface ProgressModuleProps {
  id: number;
  title: string;
  completed: number;
  total: number;
  status: "in-progress" | "locked" | "not-started" | "completed";
  prerequisiteId?: number;
}

export function ProgressCard({
  id,
  title,
  completed,
  total,
  status,
}: ProgressModuleProps) {
  return (
    <li>
      <div className="px-4 py-4 sm:px-6 flex items-center">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground truncate">{title}</p>
          <p className="text-sm text-muted-foreground">{completed} of {total} labs completed</p>
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          {status === "locked" ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-foreground">
              Locked
            </span>
          ) : (
            <Button 
              variant="ghost" 
              className="text-primary hover:text-primary/80 font-medium text-sm"
            >
              {status === "not-started" ? "Start" : "Continue"}
            </Button>
          )}
        </div>
      </div>
    </li>
  );
}
