import { prisma } from "@/lib/prisma";
import { BandForm } from "./BandForm";

const GENRES = ["punk", "rock urbano", "grunge", "hardcore", "indie", "alternativo", "metal"];

export default async function NuevaBandaPage() {
  return (
    <>
      <h1 className="font-display text-4xl tracking-tighter text-punk-white sm:text-5xl">
        Registrar banda
      </h1>
      <p className="mt-2 font-body text-punk-white/60">
        Crear banda como admin (visible de inmediato)
      </p>
      <BandForm genres={GENRES} />
    </>
  );
}
