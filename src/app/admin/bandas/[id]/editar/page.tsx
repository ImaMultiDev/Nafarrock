import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { BandEditForm } from "./BandEditForm";

const GENRES = ["punk", "rock urbano", "grunge", "hardcore", "indie", "alternativo", "metal"];

export default async function EditarBandaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const band = await prisma.band.findUnique({
    where: { id },
    include: { members: { orderBy: { order: "asc" } } },
  });
  if (!band) notFound();

  return (
    <>
      <h1 className="font-display text-4xl tracking-tighter text-punk-white sm:text-5xl">
        Editar banda
      </h1>
      <p className="mt-2 font-body text-punk-white/60">
        {band.name}
      </p>
      <BandEditForm band={band} genres={GENRES} />
    </>
  );
}
