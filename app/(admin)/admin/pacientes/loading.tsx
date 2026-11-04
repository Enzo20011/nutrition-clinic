export default function Loading() {
  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-8 pb-20 space-y-8 animate-pulse">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-8">
        <div className="space-y-3">
          <div className="h-2 w-24 bg-surface-2/5 rounded-xl" />
          <div className="h-12 w-52 bg-surface-2/5 rounded-xl" />
        </div>
        <div className="flex gap-3">
          <div className="h-11 w-64 bg-surface-2/5 rounded-xl border border-border-soft" />
          <div className="h-11 w-36 bg-surface/[0.08] rounded-xl" />
        </div>
      </div>
      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 bg-surface/[0.03] rounded-xl border border-border-soft" />
        ))}
      </div>
      {/* Patient rows */}
      <div className="space-y-3">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-[72px] bg-surface/[0.03] rounded-xl border border-border-soft flex items-center gap-4 px-4">
            <div className="w-10 h-10 rounded-xl bg-surface-2/5 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-40 bg-surface-2/5 rounded-xl" />
              <div className="h-2 w-24 bg-surface/[0.03] rounded-xl" />
            </div>
            <div className="hidden sm:flex gap-2">
              <div className="h-7 w-20 bg-surface-2/5 rounded-xl" />
              <div className="h-7 w-20 bg-surface-2/5 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
