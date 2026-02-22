import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AnnouncementForm } from "./AnnouncementForm";

const GENRES = ["punk", "rock urbano", "grunge", "hardcore", "indie", "alternativo", "metal"];

export default async function NuevoBoloPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/auth/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      role: true,
      promoterProfile: { select: { id: true, name: true, contactEmail: true, approved: true } },
      venueProfile: { select: { id: true, name: true, city: true, approved: true } },
      festivalProfile: { select: { id: true, name: true, location: true, approved: true } },
      organizerProfile: { select: { id: true, name: true, contactEmail: true, approved: true } },
    },
  });

  if (!user) redirect("/auth/login");

  const advertiser =
    user.role === "PROMOTOR"
      ? user.promoterProfile
        ? { type: "PROMOTER" as const, profile: user.promoterProfile }
        : null
      : user.role === "SALA"
        ? user.venueProfile
          ? { type: "VENUE" as const, profile: user.venueProfile }
          : null
        : user.role === "FESTIVAL"
          ? user.festivalProfile
            ? { type: "FESTIVAL" as const, profile: user.festivalProfile }
            : null
          : user.role === "ORGANIZADOR"
            ? user.organizerProfile
              ? { type: "ORGANIZER" as const, profile: user.organizerProfile }
              : null
            : null;

  if (!advertiser) {
    return (
      <div>
        <h1 className="font-display text-4xl tracking-tighter text-punk-white">
          Publicar anuncio
        </h1>
        <p className="mt-6 font-body text-punk-white/60">
          Solo promotores, salas, festivales y organizadores pueden publicar anuncios.
        </p>
      </div>
    );
  }

  const profile = advertiser.profile as { approved?: boolean; contactEmail?: string; city?: string; location?: string };
  if (!profile.approved) {
    return (
      <div>
        <h1 className="font-display text-4xl tracking-tighter text-punk-white">
          Publicar anuncio
        </h1>
        <p className="mt-6 font-body text-punk-white/60">
          Tu perfil debe estar aprobado para publicar anuncios.
        </p>
      </div>
    );
  }

  const defaultContact =
    "contactEmail" in profile ? (profile.contactEmail ?? "") : "";
  const defaultZone =
    "city" in profile ? (profile.city ?? "") : "location" in profile ? (profile.location ?? "") : "";

  return (
    <>
      <h1 className="font-display text-4xl tracking-tighter text-punk-white">
        Publicar anuncio
      </h1>
      <p className="mt-2 font-body text-punk-white/60">
        Crea un anuncio para que las bandas encuentren oportunidades.
      </p>
      <AnnouncementForm
        advertiserType={advertiser.type}
        defaultContactEmail={defaultContact}
        defaultZone={defaultZone}
        genres={GENRES}
      />
    </>
  );
}
