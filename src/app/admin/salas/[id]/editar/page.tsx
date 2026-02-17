import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { VenueEditForm } from "./VenueEditForm";

export default async function EditarSalaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const venue = await prisma.venue.findUnique({ where: { id } });
  if (!venue) notFound();

  return (
    <>
      <h1 className="font-display text-4xl tracking-tighter text-punk-white sm:text-5xl">
        Editar sala
      </h1>
      <p className="mt-2 font-body text-punk-white/60">
        {venue.name}
      </p>
      <VenueEditForm venue={venue} />
    </>
  );
}
