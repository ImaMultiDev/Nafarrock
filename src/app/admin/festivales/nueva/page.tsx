import Link from "next/link";
import { FestivalForm } from "./FestivalForm";

export default function NuevaFestivalPage() {
  return (
    <>
      <Link
        href="/admin/festivales"
        className="font-punch text-xs uppercase tracking-widest text-punk-white/70 hover:text-punk-pink"
      >
        ← Volver a festivales
      </Link>
      <h1 className="mt-6 font-display text-4xl tracking-tighter text-punk-white sm:text-5xl">
        Registrar festival
      </h1>
      <p className="mt-2 font-body text-punk-white/60">
        Perfil creado por Nafarrock (sin propietario, sujeto a reclamación)
      </p>
      <FestivalForm />
    </>
  );
}
