import { Link } from "wouter";

interface LabCardProps {
  id: number;
  title: string;
  description: string;
  department: {
    id: number;
    name: string;
  };
  duration: string;
  imagePath: string;
}

export function LabCard({
  id,
  title,
  description,
  department,
  duration,
  imagePath,
}: LabCardProps) {
  const deptSlug = department.name.toLowerCase().replace(/\s+/g, '-');
  
  return (
    <div className="bg-card overflow-hidden shadow rounded-lg lab-card">
      <div className={`h-36 bg-${deptSlug} bg-opacity-10 relative`}>
        <img 
          src={imagePath} 
          alt={title} 
          className="w-full h-full object-cover" 
        />
        <div className={`absolute top-2 left-2 bg-${deptSlug} text-white text-xs font-semibold px-2 py-1 rounded-full`}>
          {department.name}
        </div>
      </div>
      <div className="px-4 py-4">
        <h3 className="text-md font-heading font-semibold mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground mb-3">{description}</p>
        <div className="flex justify-between items-center">
          <span className="text-xs bg-muted text-foreground px-2 py-1 rounded-full">{duration}</span>
          <Link href={`/simulations/${id}`}>
            <a className={`inline-flex items-center text-${deptSlug} text-sm font-medium hover:underline`}>
              Start Lab
              <span className="material-icons ml-1 text-sm">arrow_forward</span>
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
}
