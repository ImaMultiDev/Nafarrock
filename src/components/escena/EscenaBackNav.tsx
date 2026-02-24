import Link from "next/link";

export function EscenaBackNav() {
  return (
    <Link
      href="/escena"
      className="mb-6 block font-punch text-xs uppercase tracking-widest text-punk-white/70 hover:text-punk-white"
    >
      ← Volver a Escena
    </Link>
  );
}
