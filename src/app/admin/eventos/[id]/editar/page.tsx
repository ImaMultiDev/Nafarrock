import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { EventEditForm } from "./EventEditForm";

export default async function EditarEventoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      venue: true,
      bands: { include: { band: true }, orderBy: { order: "asc" } },
      externalBands: { orderBy: { order: "asc" } },
    },
  });
  if (!event) notFound();

  const bands = await prisma.band.findMany({
    orderBy: { name: "asc" },
    where: { approved: true },
    select: { id: true, name: true },
  });

  return (
    <>
      <h1 className="font-display text-4xl tracking-tighter text-punk-white sm:text-5xl">
        Editar evento
      </h1>
      <p className="mt-2 font-body text-punk-white/60">
        {event.title}
      </p>
      <EventEditForm event={event} bands={bands} />
    </>
  );
}
