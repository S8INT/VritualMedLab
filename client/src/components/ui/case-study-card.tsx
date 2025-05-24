import { Link } from "wouter";

interface CaseStudyCardProps {
  id: number;
  title: string;
  department: {
    id: number;
    name: string;
  };
  duration: string;
  status: string;
}

export function CaseStudyCard({
  id,
  title,
  department,
  duration,
  status,
}: CaseStudyCardProps) {
  return (
    <li>
      <Link href={`/case-studies/${id}`}>
        <a className="block hover:bg-muted">
          <div className="px-4 py-4 sm:px-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-primary truncate">{title}</p>
              <div className="ml-2 flex-shrink-0 flex">
                <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  status === "New" 
                    ? "bg-status-success bg-opacity-10 text-status-success" 
                    : "bg-muted text-foreground"
                }`}>
                  {status}
                </p>
              </div>
            </div>
            <div className="mt-2 flex justify-between">
              <div className="flex">
                <p className="flex items-center text-sm text-muted-foreground">
                  <span className="material-icons mr-1.5 text-sm">category</span>
                  {department.name}
                </p>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <span className="material-icons mr-1.5 text-sm">timer</span>
                {duration}
              </div>
            </div>
          </div>
        </a>
      </Link>
    </li>
  );
}
