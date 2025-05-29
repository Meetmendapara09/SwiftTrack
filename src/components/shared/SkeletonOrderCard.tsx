
"use client";

import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonOrderCard() {
  return (
    <Card className="shadow-xl overflow-hidden flex flex-col animate-pulse">
      <CardHeader className="bg-card border-b">
        <div className="flex justify-between items-start gap-2">
          <Skeleton className="h-6 w-1/2 rounded-md" /> {/* Title */}
          <Skeleton className="h-7 w-1/4 rounded-md" /> {/* Badge */}
        </div>
        <Skeleton className="h-4 w-3/4 mt-2 rounded-md" /> {/* Description */}
      </CardHeader>
      <CardContent className="pt-4 space-y-4 flex-grow">
        <div className="flex items-center gap-3">
          <Skeleton className="h-5 w-5 rounded-full shrink-0" /> {/* Icon */}
          <Skeleton className="h-4 w-full rounded-md" /> {/* Address/Name */}
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-5 w-5 rounded-full shrink-0" /> {/* Icon */}
          <Skeleton className="h-4 w-3/4 rounded-md" /> {/* Items/Details */}
        </div>
         <div className="flex items-center gap-3">
          <Skeleton className="h-5 w-5 rounded-full shrink-0" /> {/* Icon */}
          <Skeleton className="h-4 w-2/3 rounded-md" /> {/* Partner/Location Info */}
        </div>
      </CardContent>
      <CardFooter className="pt-4 pb-4 bg-muted/50 border-t">
        <Skeleton className="h-10 w-full rounded-md" /> {/* Action Button/Text */}
      </CardFooter>
    </Card>
  );
}
