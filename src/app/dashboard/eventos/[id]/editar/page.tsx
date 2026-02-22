import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { EventEditForm } from "./EventEditForm";
import { DashboardSection } from "@/components/dashboard/DashboardSection";

export default async function EditarEventoDashboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/auth/login");

  const { id } = await params;
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      venue: true,
      bands: { include: { band: true }, orderBy: { order: "asc" } },
    },
  });

  if (!event) notFound();
  if (event.createdByUserId !== session.user.id) {
    redirect("/dashboard/eventos");
  }

  const [venues, bands] = await Promise.all([
    prisma.venue.findMany({
      orderBy: { name: "asc" },
      where: { approved: true },
    }),
    prisma.band.findMany({
      orderBy: { name: "asc" },
      where: { approved: true },
    }),
  ]);

  const userVenue = await prisma.user
    .findUnique({
      where: { id: session.user.id },
      include: { venueProfile: true },
    })
    .then((u) =>
      u?.role === "SALA" && u?.venueProfile?.approved ? u.venueProfile : null
    );

  const venuesForForm = userVenue
    ? venues.filter((v) => v.id === userVenue.id)
    : venues;

  return (
    <>
      <div className="mb-8">
        <h1 className="font-display text-4xl tracking-tighter text-punk-white sm:text-5xl">
          Editar evento
        </h1>
        <p className="mt-2 font-body text-punk-white/60">{event.title}</p>
      </div>
      <DashboardSection accent="red">
        <EventEditForm event={event} venues={venuesForForm} bands={bands} />
      </DashboardSection>
    </>
  );
}
