export default function Loading() {
  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-8 pb-20 space-y-10 animate-pulse">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pt-8">
        <div className="space-y-3">
          <div className="h-2 w-32 bg-surface-2/5 rounded-xl" />
          <div className="h-14 w-64 bg-surface-2/5 rounded-xl" />
          <div className="h-2 w-48 bg-surface-2/5 rounded-xl mt-2" />
        </div>
        <div className="flex gap-3">
          <div className="h-11 flex-1 lg:w-72 lg:flex-none bg-surface-2/5 rounded-xl border border-border-soft" />
          <div className="h-11 w-36 bg-surface/[0.08] rounded-xl shrink-0" />
        </div>
      </div>
      {/* Period selector */}
      <div className="flex items-center justify-between border-t border-border-soft pt-6">
        <div className="flex gap-2 p-1 bg-surface/[0.02] rounded-xl border border-border-soft">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-8 w-24 bg-surface-2/5 rounded-xl" />
          ))}
        </div>
        <div className="h-2 w-32 bg-surface-2/5 rounded-xl" />
      </div>
      {/* 4 stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className={`h-44 rounded-xl border border-border-soft ${i === 0 ? 'bg-accent/5' : 'bg-surface/[0.03]'}`} />
        ))}
      </div>
      {/* Chart + sidebar */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 h-[480px] bg-surface/[0.03] rounded-xl border border-border-soft" />
        <div className="space-y-4">
          <div className="h-8 w-40 bg-surface-2/5 rounded-xl" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-surface/[0.03] rounded-xl border border-border-soft" />
          ))}
        </div>
      </div>
    </div>
  );
}
