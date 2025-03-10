import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfessionalCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="aspect-square w-full" />
      <CardContent className="p-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Skeleton className="h-6 w-[150px]" />
            <Skeleton className="h-4 w-[100px]" />
          </div>
          <Skeleton className="h-4 w-[120px]" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <div className="flex gap-2 pt-2">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 flex-1" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
