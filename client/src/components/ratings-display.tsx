import { Rating } from "@shared/schema";
import { Star, StarHalf, User } from "lucide-react";
import { formatDistance } from "date-fns";
import { es } from "date-fns/locale";

interface RatingsDisplayProps {
  ratings: Rating[];
  averageRating?: number;
  totalRatings?: number;
}

export default function RatingsDisplay({
  ratings,
  averageRating,
  totalRatings,
}: RatingsDisplayProps) {
  return (
    <div className="space-y-4">
      {averageRating !== undefined && totalRatings !== undefined && (
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((value) => (
              <Star
                key={value}
                className={`h-6 w-6 ${
                  value <= averageRating
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <div>
            <span className="font-semibold text-lg">{averageRating}</span>
            <span className="text-muted-foreground text-sm ml-1">
              ({totalRatings} calificaciones)
            </span>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {ratings.map((rating) => (
          <div key={rating.id} className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((value) => (
                  <Star
                    key={value}
                    className={`h-4 w-4 ${
                      value <= rating.rating
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {formatDistance(new Date(rating.createdAt), new Date(), {
                  addSuffix: true,
                  locale: es,
                })}
              </span>
            </div>
            {rating.comment && (
              <p className="text-sm text-muted-foreground">{rating.comment}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
