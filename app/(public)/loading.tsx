export default function Loading() {
  return (
    <div className="min-h-screen bg-bg animate-pulse">
      {/* Hero */}
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8 pt-28 pb-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="h-2 w-40 bg-surface-2/5 rounded-xl" />
          <div className="space-y-3 w-full">
            <div className="h-16 sm:h-20 bg-surface-2/5 rounded-xl" />
            <div className="h-16 sm:h-20 bg-surface-2/5 rounded-xl" />
            <div className="h-16 sm:h-20 bg-accent/5 rounded-xl" />
          </div>
          <div className="h-3 w-56 bg-surface-2/5 rounded-xl" />
          <div className="h-3 w-44 bg-surface/[0.07] rounded-xl" />
          <div className="h-12 w-52 bg-surface/[0.06] rounded-xl mt-2" />
        </div>
        <div className="hidden lg:block aspect-square bg-surface/[0.03] rounded-xl border border-border-soft max-w-[460px] mx-auto w-full" />
      </div>
      {/* Divider */}
      <div className="h-px bg-surface-2/5 mx-5 sm:mx-8" />
      {/* Section below fold */}
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8 pt-16 pb-8 space-y-6">
        <div className="h-2 w-20 bg-surface-2/5 rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-52 bg-surface/[0.03] rounded-xl border border-border-soft" />
          ))}
        </div>
      </div>
    </div>
  );
}
