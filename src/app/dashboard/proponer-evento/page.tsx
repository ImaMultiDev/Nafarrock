import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { EventProposalForm } from "./EventProposalForm";

export default async function ProponerEventoPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/auth/login");

  const [venues, bands] = await Promise.all([
    prisma.venue.findMany({
      orderBy: { name: "asc" },
      where: { approved: true },
      select: { id: true, name: true },
    }),
    prisma.band.findMany({
      orderBy: { name: "asc" },
      where: { approved: true },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <>
      <div className="mb-8">
        <h1 className="font-display text-4xl tracking-tighter text-punk-white sm:text-5xl">
          Proponer evento
        </h1>
        <p className="mt-2 font-body text-punk-white/60">
          Sugiere un concierto o festival para el radar cultural. Elige una sala
          aprobada si la conoces. El administrador revisará tu propuesta antes
          de publicarla.
        </p>
      </div>
      <EventProposalForm venues={venues} bands={bands} />
    </>
  );
}
