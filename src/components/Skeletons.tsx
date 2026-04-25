export function DashboardSkeleton() {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="animate-pulse rounded-[1.75rem] border border-white/10 bg-app-card p-5">
          <div className="h-4 w-28 rounded-full bg-white/8" />
          <div className="mt-4 h-8 w-40 rounded-full bg-white/10" />
          <div className="mt-6 h-28 rounded-2xl bg-white/8" />
          <div className="mt-4 flex gap-3">
            <div className="h-10 w-24 rounded-2xl bg-white/8" />
            <div className="h-10 w-24 rounded-2xl bg-white/8" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
      <div className="space-y-5">
        <div className="h-72 animate-pulse rounded-[1.75rem] border border-white/10 bg-app-card" />
        <div className="h-72 animate-pulse rounded-[1.75rem] border border-white/10 bg-app-card" />
      </div>
      <div className="space-y-5">
        <div className="h-96 animate-pulse rounded-[1.75rem] border border-white/10 bg-app-card" />
        <div className="h-80 animate-pulse rounded-[1.75rem] border border-white/10 bg-app-card" />
      </div>
    </div>
  );
}
