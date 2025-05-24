interface TestimonialCardProps {
  name: string;
  role: string;
  institution: string;
  country: string;
  text: string;
  rating: number;
}

export function TestimonialCard({
  name,
  role,
  institution,
  country,
  text,
  rating,
}: TestimonialCardProps) {
  // Convert rating to stars
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const stars = [];
  
  for (let i = 0; i < fullStars; i++) {
    stars.push(<span key={`full-${i}`} className="material-icons text-yellow-400">star</span>);
  }
  
  if (hasHalfStar) {
    stars.push(<span key="half" className="material-icons text-yellow-400">star_half</span>);
  }
  
  // Add empty stars to make 5 total
  const emptyStars = 5 - stars.length;
  for (let i = 0; i < emptyStars; i++) {
    stars.push(<span key={`empty-${i}`} className="material-icons text-yellow-400">star_border</span>);
  }
  
  return (
    <div className="bg-muted rounded-lg p-4">
      <div className="flex items-start mb-4">
        <div className="flex-shrink-0">
          <div className="h-10 w-10 rounded-full bg-primary bg-opacity-10 flex items-center justify-center text-primary font-semibold">
            {name.split(' ').map(n => n[0]).join('')}
          </div>
        </div>
        <div className="ml-4">
          <h4 className="text-sm font-medium text-foreground">{name}</h4>
          <p className="text-xs text-muted-foreground">{role}, {institution}, {country}</p>
        </div>
      </div>
      <p className="text-sm text-foreground">"{text}"</p>
      <div className="flex mt-2">
        {stars}
      </div>
    </div>
  );
}
