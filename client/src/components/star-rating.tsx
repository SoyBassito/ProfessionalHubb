import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number | null | undefined;
  totalRatings?: number | null;
  showCount?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function StarRating({
  rating,
  totalRatings,
  showCount = false,
  size = "sm",
}: StarRatingProps) {
  if (rating === null || rating === undefined) return null;

  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-6 w-6",
  };

  return (
    <div className="flex items-center gap-1">
      <Star
        className={`${sizeClasses[size]} text-yellow-400 fill-yellow-400`}
      />
      <span className="text-sm font-medium">
        {rating.toFixed(1)}
      </span>
      {showCount && totalRatings !== undefined && totalRatings !== null && (
        <span className="text-[10px] text-muted-foreground">
          ({totalRatings})
        </span>
      )}
    </div>
  );
}