import { prisma } from "@/lib/prisma";
import { EventForm } from "./EventForm";

export default async function NuevoEventoPage() {
  const [venues, bands] = await Promise.all([
    prisma.venue.findMany({ orderBy: { name: "asc" }, where: { approved: true } }),
    prisma.band.findMany({ orderBy: { name: "asc" }, where: { approved: true } }),
  ]);

  return (
    <>
      <h1 className="font-display text-4xl tracking-tighter text-punk-white sm:text-5xl">
        Registrar evento
      </h1>
      <p className="mt-2 font-body text-punk-white/60">
        Crear concierto o festival como admin (visible de inmediato)
      </p>
      <EventForm venues={venues} bands={bands} />
    </>
  );
}
