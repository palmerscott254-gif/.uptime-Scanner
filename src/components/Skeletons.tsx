import { Skeleton } from './ui/Skeleton';
import { Card } from './ui/Card';

export function DashboardSkeleton() {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={index} className="animate-pulse">
          <Skeleton variant="text" className="h-4 w-28" />
          <div className="mt-4">
            <Skeleton variant="text" className="h-8 w-40" />
          </div>
          <div className="mt-6">
            <Skeleton variant="rect" className="h-28" />
          </div>
          <div className="mt-4 flex gap-3">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </Card>
      ))}
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
      <div className="space-y-5">
        <Card className="h-72 animate-pulse" />
        <Card className="h-72 animate-pulse" />
      </div>
      <div className="space-y-5">
        <Card className="h-96 animate-pulse" />
        <Card className="h-80 animate-pulse" />
      </div>
    </div>
  );
}
