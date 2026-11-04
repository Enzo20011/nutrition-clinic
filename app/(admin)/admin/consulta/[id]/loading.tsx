export default function Loading() {
  return (
    <div className="max-w-[1400px] mx-auto p-4 sm:p-8 space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-3">
          <div className="h-3 w-24 bg-surface-2/5 rounded-xl" />
          <div className="h-10 w-64 bg-surface-2/5 rounded-xl" />
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-28 bg-surface-2/5 rounded-xl" />
          <div className="h-10 w-28 bg-surface-2/5 rounded-xl" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border-soft pb-0">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-10 w-20 bg-surface-2/5 rounded-t-sm" />
        ))}
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-64 bg-surface-2/5 rounded-xl border border-border-soft" />
        <div className="h-64 bg-surface-2/5 rounded-xl border border-border-soft" />
      </div>
      <div className="h-48 bg-surface-2/5 rounded-xl border border-border-soft" />
    </div>
  );
}
