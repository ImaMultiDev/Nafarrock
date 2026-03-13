import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  Calendar,
  Music2,
  Megaphone,
  Building2,
  PartyPopper,
  Users,
  Sparkles,
  Shield,
  ArrowRight,
  ClipboardList,
} from "lucide-react";
import { ProposalCard } from "@/components/dashboard/ProposalCard";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { DashboardInboxCard } from "@/components/dashboard/DashboardInboxCard";

/** Modelo editorial MVP: ocultar paneles profesionales, mostrar Proponer banda/evento */
const EDITORIAL_MVP_MODE = true;

type Props = { searchParams: Promise<Record<string, string | undefined>> };

const CARD_ACCENTS = {
  admin:
    "from-punk-green/20 to-punk-green/5 border-punk-green/40 hover:border-punk-green hover:shadow-[0_0_24px_rgba(0,200,83,0.15)]",
  perfil:
    "from-punk-pink/20 to-punk-pink/5 border-punk-pink/40 hover:border-punk-pink hover:shadow-[0_0_24px_rgba(255,0,110,0.15)]",
  banda:
    "from-punk-green/20 to-punk-green/5 border-punk-green/40 hover:border-punk-green hover:shadow-[0_0_24px_rgba(0,200,83,0.15)]",
  sala: "from-punk-pink/20 to-punk-pink/5 border-punk-pink/40 hover:border-punk-pink hover:shadow-[0_0_24px_rgba(255,0,110,0.15)]",
  festival:
    "from-punk-red/20 to-punk-red/5 border-punk-red/40 hover:border-punk-red hover:shadow-[0_0_24px_rgba(230,0,38,0.15)]",
  asociacion:
    "from-punk-yellow/20 to-punk-yellow/5 border-punk-yellow/40 hover:border-punk-yellow hover:shadow-[0_0_24px_rgba(255,214,10,0.15)]",
  promotor:
    "from-punk-pink/20 to-punk-pink/5 border-punk-pink/40 hover:border-punk-pink hover:shadow-[0_0_24px_rgba(255,0,110,0.15)]",
  organizador:
    "from-punk-yellow/20 to-punk-yellow/5 border-punk-yellow/40 hover:border-punk-yellow hover:shadow-[0_0_24px_rgba(255,214,10,0.15)]",
  eventos:
    "from-punk-red/20 to-punk-red/5 border-punk-red/40 hover:border-punk-red hover:shadow-[0_0_24px_rgba(230,0,38,0.15)]",
  tablon:
    "from-punk-yellow/20 to-punk-yellow/5 border-punk-yellow/40 hover:border-punk-yellow hover:shadow-[0_0_24px_rgba(255,214,10,0.15)]",
};

export default async function DashboardPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/auth/login");

  const params = await searchParams;
  const deletionCancelled = params.deletionCancelled === "1";
  const proposed = params.proposed;

  const [pendingClaim, pendingProposals] = await Promise.all([
    prisma.profileClaim.findFirst({
      where: { userId: session.user.id, status: "PENDING_CLAIM" },
      include: { band: true, venue: true, festival: true },
    }),
    (session.user?.effectiveRole ?? session.user?.role) === "USUARIO"
      ? Promise.all([
          prisma.event.findMany({
            where: { createdByUserId: session.user.id, isApproved: false },
            select: { id: true, title: true, date: true, createdAt: true },
            orderBy: { createdAt: "desc" },
          }),
          prisma.band.findMany({
            where: { userId: session.user.id, approved: false },
            select: { id: true, name: true, createdAt: true },
            orderBy: { createdAt: "desc" },
          }),
          prisma.boardAnnouncement.findMany({
            where: { userId: session.user.id, approved: false },
            select: { id: true, title: true, createdAt: true },
            orderBy: { createdAt: "desc" },
          }),
        ]).then(([events, bands, announcements]) => ({
          events,
          bands,
          announcements,
        }))
      : { events: [], bands: [], announcements: [] },
  ]);

  const pendingProposalItems = [
    ...pendingProposals.events.map((e) => ({
      type: "event" as const,
      id: e.id,
      name: e.title,
      date: e.date,
      createdAt: e.createdAt,
    })),
    ...pendingProposals.bands.map((b) => ({
      type: "band" as const,
      id: b.id,
      name: b.name,
      createdAt: b.createdAt,
    })),
    ...pendingProposals.announcements.map((a) => ({
      type: "announcement" as const,
      id: a.id,
      name: a.title,
      createdAt: a.createdAt,
    })),
  ].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const t = await getTranslations("dashboard");
  const tCards = await getTranslations("dashboard.cards");
  const tPending = await getTranslations("dashboard.pendingProposals");
  const tClaim = await getTranslations("dashboard.pendingClaim");

  let claimEntityName: string | null = null;
  if (pendingClaim) {
    claimEntityName =
      pendingClaim.band?.name ??
      pendingClaim.venue?.name ??
      pendingClaim.festival?.name ??
      null;
    if (!claimEntityName && pendingClaim.entityType === "ASOCIACION") {
      const asocId =
        (pendingClaim as { associationId?: string }).associationId ??
        pendingClaim.entityId;
      const asoc = asocId
        ? await prisma.asociacion.findUnique({
            where: { id: asocId },
            select: { name: true },
          })
        : null;
      claimEntityName = asoc?.name ?? "perfil";
    } else if (!claimEntityName) {
      claimEntityName = "perfil";
    }
  }

  return (
    <>
      {deletionCancelled && (
        <div className="mb-8 rounded-xl border-2 border-punk-green bg-punk-green/10 p-6">
          <p className="font-body text-punk-green">{t("deletionCancelled")}</p>
        </div>
      )}

      {proposed === "band" && (
        <div className="mb-8 rounded-xl border-2 border-punk-green bg-punk-green/10 p-6">
          <p className="font-body text-punk-green">{t("proposedBand")}</p>
        </div>
      )}

      {proposed === "event" && (
        <div className="mb-8 rounded-xl border-2 border-punk-green bg-punk-green/10 p-6">
          <p className="font-body text-punk-green">{t("proposedEvent")}</p>
        </div>
      )}

      {proposed === "announcement" && (
        <div className="mb-8 rounded-xl border-2 border-punk-green bg-punk-green/10 p-6">
          <p className="font-body text-punk-green">
            {t("proposedAnnouncement")}
          </p>
        </div>
      )}

      {EDITORIAL_MVP_MODE &&
        (session.user?.effectiveRole ?? session.user?.role) === "USUARIO" &&
        pendingProposalItems.length > 0 && (
          <div className="mb-8 rounded-xl border-2 border-l-4 border-punk-yellow/50 bg-punk-yellow/10 p-6">
            <h2 className="font-display text-xl tracking-tighter text-punk-yellow">
              {tPending("title")}
            </h2>
            <p className="mt-2 font-body text-punk-white/90">
              {tPending("description")}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {pendingProposalItems.map((item) => (
                <div
                  key={`${item.type}-${item.id}`}
                  className="rounded-lg border border-punk-white/20 bg-punk-black/40 px-4 py-2"
                >
                  <span className="font-punch text-xs uppercase tracking-widest text-punk-white/50">
                    {item.type === "event"
                      ? tPending("event")
                      : item.type === "band"
                        ? tPending("band")
                        : tPending("announcement")}
                  </span>
                  <p className="mt-1 font-body font-medium text-punk-white">
                    {item.name}
                  </p>
                  <p className="mt-0.5 font-body text-xs text-punk-white/50">
                    {new Date(item.createdAt).toLocaleDateString(undefined, {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

      {!EDITORIAL_MVP_MODE && pendingClaim && (
        <div className="mb-8 rounded-xl border-2 border-l-4 border-punk-green/50 bg-punk-green/10 p-6">
          <h2 className="font-display text-xl tracking-tighter text-punk-green">
            Pendiente de aprobación
          </h2>
          <p className="mt-2 font-body text-punk-white/90">
            Has reclamado el perfil de &quot;{claimEntityName}&quot;. Tu
            solicitud está en revisión. Recibirás un email cuando el
            administrador verifique tu reclamación.
          </p>
          <p className="mt-2 font-body text-sm text-punk-white/60">
            Si tienes dudas, puedes contactar con Nafarrock desde la sección
            Contacto (visible tras la aprobación).
          </p>
        </div>
      )}

      <div className="mx-auto grid max-w-sm gap-4 py-2 sm:max-w-none sm:grid-cols-2 sm:gap-6 xl:grid-cols-3">
        <DashboardCard
          href="/dashboard/perfil"
          svgSrc="/svg/punk-svgrepo-com.svg"
          title={tCards("myProfile")}
          description={tCards("myProfileDesc")}
          accent={CARD_ACCENTS.perfil}
          accessLabel={t("access")}
          accentColor="pink"
        />

        <DashboardInboxCard
          title={tCards("inbox")}
          description={tCards("inboxDesc")}
          accent={CARD_ACCENTS.tablon}
          accessLabel={t("access")}
        />

        {(session.user?.effectiveRole ?? session.user?.role) === "ADMIN" && (
          <Link
            href="/admin"
            className={`group flex flex-col rounded-xl border-2 bg-gradient-to-br p-6 transition-all duration-200 ${CARD_ACCENTS.admin}`}
          >
            <Shield size={28} className="text-punk-green/80" />
            <h2 className="mt-4 font-display text-lg font-semibold text-punk-green">
              {tCards("admin")}
            </h2>
            <p className="mt-2 flex-1 text-sm text-punk-white/60">
              {tCards("adminDesc")}
            </p>
            <span className="mt-4 inline-flex items-center gap-2 font-punch text-xs uppercase tracking-widest text-punk-green opacity-0 transition-opacity group-hover:opacity-100">
              {t("access")} <ArrowRight size={14} />
            </span>
          </Link>
        )}

        {!EDITORIAL_MVP_MODE &&
          ((session.user?.effectiveRole ?? session.user?.role) === "BANDA" ||
            (session.user?.effectiveRole ?? session.user?.role) ===
              "ADMIN") && (
            <Link
              href="/dashboard/banda"
              className={`group flex flex-col rounded-xl border-2 bg-gradient-to-br p-6 transition-all duration-200 ${CARD_ACCENTS.banda}`}
            >
              <Music2 size={28} className="text-punk-green/80" />
              <h2 className="mt-4 font-display text-lg font-semibold text-punk-white">
                {tCards("myBand")}
              </h2>
              <p className="mt-2 flex-1 text-sm text-punk-white/60">
                {tCards("myBandDesc")}
              </p>
              <span className="mt-4 inline-flex items-center gap-2 font-punch text-xs uppercase tracking-widest text-punk-green opacity-0 transition-opacity group-hover:opacity-100">
                {t("access")} <ArrowRight size={14} />
              </span>
            </Link>
          )}

        {!EDITORIAL_MVP_MODE &&
          ((session.user?.effectiveRole ?? session.user?.role) === "FESTIVAL" ||
            (session.user?.effectiveRole ?? session.user?.role) ===
              "ADMIN") && (
            <Link
              href="/dashboard/festival"
              className={`group flex flex-col rounded-xl border-2 bg-gradient-to-br p-6 transition-all duration-200 ${CARD_ACCENTS.festival}`}
            >
              <PartyPopper size={28} className="text-punk-red/80" />
              <h2 className="mt-4 font-display text-lg font-semibold text-punk-white">
                {tCards("myFestival")}
              </h2>
              <p className="mt-2 flex-1 text-sm text-punk-white/60">
                {tCards("myFestivalDesc")}
              </p>
              <span className="mt-4 inline-flex items-center gap-2 font-punch text-xs uppercase tracking-widest text-punk-red opacity-0 transition-opacity group-hover:opacity-100">
                {t("access")} <ArrowRight size={14} />
              </span>
            </Link>
          )}

        {!EDITORIAL_MVP_MODE &&
          (session.user?.effectiveRole ?? session.user?.role) ===
            "ASOCIACION" && (
            <Link
              href="/dashboard/asociacion"
              className={`group flex flex-col rounded-xl border-2 bg-gradient-to-br p-6 transition-all duration-200 ${CARD_ACCENTS.asociacion}`}
            >
              <Users size={28} className="text-punk-yellow/80" />
              <h2 className="mt-4 font-display text-lg font-semibold text-punk-white">
                {tCards("myAssociation")}
              </h2>
              <p className="mt-2 flex-1 text-sm text-punk-white/60">
                {tCards("myAssociationDesc")}
              </p>
              <span className="mt-4 inline-flex items-center gap-2 font-punch text-xs uppercase tracking-widest text-punk-yellow opacity-0 transition-opacity group-hover:opacity-100">
                {t("access")} <ArrowRight size={14} />
              </span>
            </Link>
          )}

        {!EDITORIAL_MVP_MODE &&
          (session.user?.effectiveRole ?? session.user?.role) ===
            "ORGANIZADOR" && (
            <Link
              href="/dashboard/organizador"
              className={`group flex flex-col rounded-xl border-2 bg-gradient-to-br p-6 transition-all duration-200 ${CARD_ACCENTS.organizador}`}
            >
              <Sparkles size={28} className="text-punk-yellow/80" />
              <h2 className="mt-4 font-display text-lg font-semibold text-punk-white">
                {tCards("myOrganizer")}
              </h2>
              <p className="mt-2 flex-1 text-sm text-punk-white/60">
                {tCards("myOrganizerDesc")}
              </p>
              <span className="mt-4 inline-flex items-center gap-2 font-punch text-xs uppercase tracking-widest text-punk-yellow opacity-0 transition-opacity group-hover:opacity-100">
                {t("access")} <ArrowRight size={14} />
              </span>
            </Link>
          )}

        {!EDITORIAL_MVP_MODE && session.user?.role === "PROMOTOR" && (
          <Link
            href="/dashboard/promotor"
            className={`group flex flex-col rounded-xl border-2 bg-gradient-to-br p-6 transition-all duration-200 ${CARD_ACCENTS.promotor}`}
          >
            <Megaphone size={28} className="text-punk-pink/80" />
            <h2 className="mt-4 font-display text-lg font-semibold text-punk-white">
              {tCards("myPromoter")}
            </h2>
            <p className="mt-2 flex-1 text-sm text-punk-white/60">
              {tCards("myPromoterDesc")}
            </p>
            <span className="mt-4 inline-flex items-center gap-2 font-punch text-xs uppercase tracking-widest text-punk-pink opacity-0 transition-opacity group-hover:opacity-100">
              {t("access")} <ArrowRight size={14} />
            </span>
          </Link>
        )}

        {!EDITORIAL_MVP_MODE &&
          ((session.user?.effectiveRole ?? session.user?.role) === "SALA" ||
            (session.user?.effectiveRole ?? session.user?.role) ===
              "ADMIN") && (
            <Link
              href="/dashboard/sala"
              className={`group flex flex-col rounded-xl border-2 bg-gradient-to-br p-6 transition-all duration-200 ${CARD_ACCENTS.sala}`}
            >
              <Building2 size={28} className="text-punk-pink/80" />
              <h2 className="mt-4 font-display text-lg font-semibold text-punk-white">
                {tCards("myVenue")}
              </h2>
              <p className="mt-2 flex-1 text-sm text-punk-white/60">
                {tCards("myVenueDesc")}
              </p>
              <span className="mt-4 inline-flex items-center gap-2 font-punch text-xs uppercase tracking-widest text-punk-pink opacity-0 transition-opacity group-hover:opacity-100">
                {t("access")} <ArrowRight size={14} />
              </span>
            </Link>
          )}

        {!EDITORIAL_MVP_MODE &&
          ((session.user?.effectiveRole ?? session.user?.role) === "SALA" ||
            (session.user?.effectiveRole ?? session.user?.role) ===
              "FESTIVAL" ||
            (session.user?.effectiveRole ?? session.user?.role) ===
              "ASOCIACION" ||
            (session.user?.effectiveRole ?? session.user?.role) ===
              "ORGANIZADOR" ||
            (session.user?.effectiveRole ?? session.user?.role) ===
              "PROMOTOR" ||
            (session.user?.effectiveRole ?? session.user?.role) ===
              "ADMIN") && (
            <Link
              href="/dashboard/eventos"
              className={`group flex flex-col rounded-xl border-2 bg-gradient-to-br p-6 transition-all duration-200 ${CARD_ACCENTS.eventos}`}
            >
              <Calendar size={28} className="text-punk-red/80" />
              <h2 className="mt-4 font-display text-lg font-semibold text-punk-white">
                {tCards("myEvents")}
              </h2>
              <p className="mt-2 flex-1 text-sm text-punk-white/60">
                {tCards("myEventsDesc")}
              </p>
              <span className="mt-4 inline-flex items-center gap-2 font-punch text-xs uppercase tracking-widest text-punk-red opacity-0 transition-opacity group-hover:opacity-100">
                {t("access")} <ArrowRight size={14} />
              </span>
            </Link>
          )}

        {EDITORIAL_MVP_MODE &&
          (session.user?.effectiveRole ?? session.user?.role) === "USUARIO" && (
            <>
              <ProposalCard
                href="/dashboard/proponer-banda"
                type="band"
                title={tCards("proposeBand")}
                description={tCards("proposeBandDesc")}
                accent={CARD_ACCENTS.banda}
              />
              <ProposalCard
                href="/dashboard/proponer-evento"
                type="event"
                title={tCards("proposeEvent")}
                description={tCards("proposeEventDesc")}
                accent={CARD_ACCENTS.eventos}
              />
              <ProposalCard
                href="/dashboard/proponer-anuncio"
                type="announcement"
                title={tCards("proposeAnnouncement")}
                description={tCards("proposeAnnouncementDesc")}
                accent={CARD_ACCENTS.tablon}
              />
            </>
          )}

        {!EDITORIAL_MVP_MODE &&
          (session.user?.effectiveRole ?? session.user?.role) === "USUARIO" && (
            <div className="col-span-full rounded-xl border-2 border-punk-white/10 bg-punk-black/40 p-8">
              <p className="font-body text-punk-white/50">
                {tCards("registerHint")}
              </p>
            </div>
          )}
      </div>
    </>
  );
}
