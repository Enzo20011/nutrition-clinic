export default function Loading() {
  return (
    <div className="max-w-[1200px] mx-auto p-4 sm:p-6 space-y-6 animate-pulse">
      <div className="h-6 w-32 bg-surface-2/5 rounded-xl" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-40 bg-surface-2/5 rounded-xl border border-border-soft" />
        ))}
      </div>
    </div>
  );
}
