import { Link } from "wouter";

interface ResourceCardProps {
  id: number;
  title: string;
  description: string;
  type: string;
  icon: string;
}

export function ResourceCard({
  id,
  title,
  description,
  type,
  icon,
}: ResourceCardProps) {
  return (
    <Link href={`/resources/${id}`}>
      <a className="group">
        <div className="bg-muted rounded-lg overflow-hidden shadow-sm group-hover:shadow">
          <div className="p-4">
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary text-primary-foreground mb-4">
              <span className="material-icons">{icon}</span>
            </div>
            <h4 className="text-base font-heading font-medium text-foreground group-hover:text-primary">{title}</h4>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
      </a>
    </Link>
  );
}
