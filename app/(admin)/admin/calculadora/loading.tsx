export default function Loading() {
  return (
    <div className="max-w-[800px] mx-auto p-4 sm:p-6 space-y-6 animate-pulse">
      <div className="h-6 w-48 bg-surface-2/5 rounded-xl" />
      <div className="h-[400px] bg-surface-2/5 rounded-xl border border-border-soft" />
    </div>
  );
}
