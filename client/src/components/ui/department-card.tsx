import { Link } from "wouter";

interface DepartmentCardProps {
  id: number;
  name: string;
  description: string;
  color: string;
  icon: string;
  simulationCount: number;
}

export function DepartmentCard({
  id,
  name,
  description,
  color,
  icon,
  simulationCount,
}: DepartmentCardProps) {
  const slugName = name.toLowerCase().replace(/\s+/g, '-');
  
  return (
    <div className="bg-card overflow-hidden shadow rounded-lg">
      <div className={`bg-${slugName} bg-opacity-10 px-5 py-4 border-b border-border`}>
        <div className="flex items-center">
          <div className={`flex-shrink-0 bg-${slugName} rounded-md p-3`}>
            <span className="material-icons text-white">{icon}</span>
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-heading font-medium text-foreground">{name}</h3>
            <p className="text-sm text-muted-foreground">{simulationCount} simulations available</p>
          </div>
        </div>
      </div>
      <div className="px-5 py-4">
        <p className="text-sm text-foreground mb-4">{description}</p>
        <div className="mt-2">
          <Link href={`/departments/${slugName}`}>
            <a className={`text-sm font-medium text-${slugName} hover:underline`}>
              View Department <span aria-hidden="true">&rarr;</span>
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
}
