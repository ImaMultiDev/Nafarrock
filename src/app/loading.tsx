export default function Loading() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6">
      <div
        className="h-12 w-12 animate-spin rounded-full border-2 border-punk-red border-t-transparent"
        aria-hidden
      />
      <p className="font-punch text-xs uppercase tracking-widest text-punk-white/60">
        Cargando…
      </p>
    </div>
  );
}
