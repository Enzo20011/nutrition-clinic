export default function Loading() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-border border-t-[#1F4D3D] rounded-full animate-spin" />
        <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-fg-muted/20">Cargando</span>
      </div>
    </div>
  );
}
