export default function Loading() {
  return (
    <div className="max-w-[1200px] mx-auto p-6 space-y-6 animate-pulse">
      <div className="h-8 w-48 bg-surface-2/5 rounded-xl" />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-40 bg-surface-2/5 rounded-xl border border-border-soft" />
        ))}
      </div>
      <div className="h-64 bg-surface-2/5 rounded-xl border border-border-soft" />
    </div>
  );
}
