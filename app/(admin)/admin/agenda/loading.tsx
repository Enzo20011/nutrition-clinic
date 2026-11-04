export default function Loading() {
  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-8 pb-20 space-y-8 animate-pulse">
      {/* Header */}
      <div className="pt-8 space-y-3">
        <div className="h-2 w-36 bg-surface-2/5 rounded-xl" />
        <div className="h-12 w-56 bg-surface-2/5 rounded-xl" />
        <div className="h-2 w-48 bg-surface-2/5 rounded-xl" />
      </div>
      {/* Calendar grid + sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 space-y-4">
          {/* Month nav */}
          <div className="flex items-center justify-between">
            <div className="h-8 w-8 bg-surface-2/5 rounded-xl" />
            <div className="h-5 w-32 bg-surface-2/5 rounded-xl" />
            <div className="h-8 w-8 bg-surface-2/5 rounded-xl" />
          </div>
          {/* Day labels */}
          <div className="grid grid-cols-7 gap-1">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="h-4 bg-surface-2/5 rounded-xl" />
            ))}
          </div>
          {/* Calendar cells */}
          <div className="grid grid-cols-7 gap-1">
            {[...Array(35)].map((_, i) => (
              <div key={i} className="h-14 bg-surface/[0.03] rounded-xl border border-border-soft" />
            ))}
          </div>
        </div>
        {/* Day appointments */}
        <div className="space-y-4">
          <div className="h-5 w-32 bg-surface-2/5 rounded-xl" />
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-surface/[0.03] rounded-xl border border-border-soft" />
          ))}
        </div>
      </div>
    </div>
  );
}
