'use client';

export default function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-surface-2 ${className}`} />;
}

export function DashboardSkeleton() {
  return (
    <div className="max-w-[1200px] mx-auto space-y-12 pb-20 px-4 md:px-8">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pt-8">
        <div className="space-y-3">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-3 w-48" />
        </div>
        <div className="flex gap-3 w-full lg:w-auto">
          <Skeleton className="h-12 w-full lg:w-[320px] rounded-full" />
          <Skeleton className="h-12 w-40 rounded-full" />
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-2xl border border-border bg-surface p-6 space-y-6">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-8 w-20" />
            </div>
            <Skeleton className="h-3 w-28" />
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-surface p-6 md:p-10 space-y-8">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-28" />
        </div>
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="p-6 bg-surface-2 rounded-2xl border border-border flex items-center gap-5">
              <Skeleton className="h-14 w-14 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-5 w-48" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
