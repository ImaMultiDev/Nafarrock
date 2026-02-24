import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  LayoutDashboard,
  User,
  Calendar,
  Music2,
  Megaphone,
  Building2,
  PartyPopper,
  Users,
  Sparkles,
  Shield,
  ArrowRight,
} from "lucide-react";

type Props = { searchParams: Promise<Record<string, string | undefined>> };

const CARD_ACCENTS = {
  admin: "from-punk-green/20 to-punk-green/5 border-punk-green/40 hover:border-punk-green hover:shadow-[0_0_24px_rgba(0,200,83,0.15)]",
  perfil: "from-punk-pink/20 to-punk-pink/5 border-punk-pink/40 hover:border-punk-pink hover:shadow-[0_0_24px_rgba(255,0,110,0.15)]",
  banda: "from-punk-green/20 to-punk-green/5 border-punk-green/40 hover:border-punk-green hover:shadow-[0_0_24px_rgba(0,200,83,0.15)]",
  sala: "from-punk-pink/20 to-punk-pink/5 border-punk-pink/40 hover:border-punk-pink hover:shadow-[0_0_24px_rgba(255,0,110,0.15)]",
  festival: "from-punk-red/20 to-punk-red/5 border-punk-red/40 hover:border-punk-red hover:shadow-[0_0_24px_rgba(230,0,38,0.15)]",
  asociacion: "from-punk-yellow/20 to-punk-yellow/5 border-punk-yellow/40 hover:border-punk-yellow hover:shadow-[0_0_24px_rgba(255,214,10,0.15)]",
  promotor: "from-punk-pink/20 to-punk-pink/5 border-punk-pink/40 hover:border-punk-pink hover:shadow-[0_0_24px_rgba(255,0,110,0.15)]",
  organizador: "from-punk-yellow/20 to-punk-yellow/5 border-punk-yellow/40 hover:border-punk-yellow hover:shadow-[0_0_24px_rgba(255,214,10,0.15)]",
  eventos: "from-punk-red/20 to-punk-red/5 border-punk-red/40 hover:border-punk-red hover:shadow-[0_0_24px_rgba(230,0,38,0.15)]",
};

export default async function DashboardPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/auth/login");

  const params = await searchParams;
  const deletionCancelled = params.deletionCancelled === "1";

  const pendingClaim = await prisma.profileClaim.findFirst({
    where: { userId: session.user.id, status: "PENDING_CLAIM" },
    include: { band: true, venue: true, festival: true },
  });

  let claimEntityName: string | null = null;
  if (pendingClaim) {
    claimEntityName =
      pendingClaim.band?.name ??
      pendingClaim.venue?.name ??
      pendingClaim.festival?.name ??
      null;
    if (!claimEntityName && pendingClaim.entityType === "ASOCIACION") {
      const asocId = (pendingClaim as { associationId?: string }).associationId ?? pendingClaim.entityId;
      const asoc = asocId
        ? await prisma.asociacion.findUnique({ where: { id: asocId }, select: { name: true } })
        : null;
      claimEntityName = asoc?.name ?? "perfil";
    } else if (!claimEntityName) {
      claimEntityName = "perfil";
    }
  }

  return (
    <>
      <div className="mb-2">
        <h1 className="font-display text-4xl tracking-tighter text-punk-white sm:text-5xl">
          Panel
        </h1>
        <p className="mt-2 font-body text-punk-white/60">
          Hola, {session.user?.name ?? session.user?.email}
        </p>
      </div>

      {deletionCancelled && (
        <div className="mb-8 rounded-xl border-2 border-punk-green bg-punk-green/10 p-6">
          <p className="font-body text-punk-green">
            ✓ Eliminación cancelada. Tu cuenta sigue activa.
          </p>
        </div>
      )}

      {pendingClaim && (
        <div className="mb-8 rounded-xl border-2 border-l-4 border-punk-green/50 bg-punk-green/10 p-6">
          <h2 className="font-display text-xl tracking-tighter text-punk-green">
            Pendiente de aprobación
          </h2>
          <p className="mt-2 font-body text-punk-white/90">
            Has reclamado el perfil de &quot;{claimEntityName}&quot;. Tu solicitud está en revisión.
            Recibirás un email cuando el administrador verifique tu reclamación.
          </p>
          <p className="mt-2 font-body text-sm text-punk-white/60">
            Si tienes dudas, puedes contactar con Nafarrock desde la sección Contacto (visible tras la aprobación).
          </p>
        </div>
      )}

      <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        <Link
          href="/dashboard/perfil"
          className={`group flex flex-col rounded-xl border-2 bg-gradient-to-br p-6 transition-all duration-200 ${CARD_ACCENTS.perfil}`}
        >
          <User size={28} className="text-punk-pink/80" />
          <h2 className="mt-4 font-display text-lg font-semibold text-punk-white">
            Mi perfil
          </h2>
          <p className="mt-2 flex-1 text-sm text-punk-white/60">
            Datos personales y estado de aprobación
          </p>
          <span className="mt-4 inline-flex items-center gap-2 font-punch text-xs uppercase tracking-widest text-punk-pink opacity-0 transition-opacity group-hover:opacity-100">
            Acceder <ArrowRight size={14} />
          </span>
        </Link>

        {(session.user?.effectiveRole ?? session.user?.role) === "ADMIN" && (
          <Link
            href="/admin"
            className={`group flex flex-col rounded-xl border-2 bg-gradient-to-br p-6 transition-all duration-200 ${CARD_ACCENTS.admin}`}
          >
            <Shield size={28} className="text-punk-green/80" />
            <h2 className="mt-4 font-display text-lg font-semibold text-punk-green">
              Administración
            </h2>
            <p className="mt-2 flex-1 text-sm text-punk-white/60">
              CRUD bandas, eventos, salas, usuarios
            </p>
            <span className="mt-4 inline-flex items-center gap-2 font-punch text-xs uppercase tracking-widest text-punk-green opacity-0 transition-opacity group-hover:opacity-100">
              Acceder <ArrowRight size={14} />
            </span>
          </Link>
        )}

        {((session.user?.effectiveRole ?? session.user?.role) === "BANDA" || (session.user?.effectiveRole ?? session.user?.role) === "ADMIN") && (
          <Link
            href="/dashboard/banda"
            className={`group flex flex-col rounded-xl border-2 bg-gradient-to-br p-6 transition-all duration-200 ${CARD_ACCENTS.banda}`}
          >
            <Music2 size={28} className="text-punk-green/80" />
            <h2 className="mt-4 font-display text-lg font-semibold text-punk-white">
              Mi banda
            </h2>
            <p className="mt-2 flex-1 text-sm text-punk-white/60">
              Editar perfil, logo, enlaces
            </p>
            <span className="mt-4 inline-flex items-center gap-2 font-punch text-xs uppercase tracking-widest text-punk-green opacity-0 transition-opacity group-hover:opacity-100">
              Acceder <ArrowRight size={14} />
            </span>
          </Link>
        )}

        {((session.user?.effectiveRole ?? session.user?.role) === "FESTIVAL" || (session.user?.effectiveRole ?? session.user?.role) === "ADMIN") && (
          <Link
            href="/dashboard/festival"
            className={`group flex flex-col rounded-xl border-2 bg-gradient-to-br p-6 transition-all duration-200 ${CARD_ACCENTS.festival}`}
          >
            <PartyPopper size={28} className="text-punk-red/80" />
            <h2 className="mt-4 font-display text-lg font-semibold text-punk-white">
              Mi festival
            </h2>
            <p className="mt-2 flex-1 text-sm text-punk-white/60">
              Editar perfil, logo, redes
            </p>
            <span className="mt-4 inline-flex items-center gap-2 font-punch text-xs uppercase tracking-widest text-punk-red opacity-0 transition-opacity group-hover:opacity-100">
              Acceder <ArrowRight size={14} />
            </span>
          </Link>
        )}

        {(session.user?.effectiveRole ?? session.user?.role) === "ASOCIACION" && (
          <Link
            href="/dashboard/asociacion"
            className={`group flex flex-col rounded-xl border-2 bg-gradient-to-br p-6 transition-all duration-200 ${CARD_ACCENTS.asociacion}`}
          >
            <Users size={28} className="text-punk-yellow/80" />
            <h2 className="mt-4 font-display text-lg font-semibold text-punk-white">
              Mi asociación
            </h2>
            <p className="mt-2 flex-1 text-sm text-punk-white/60">
              Editar perfil, logo, redes
            </p>
            <span className="mt-4 inline-flex items-center gap-2 font-punch text-xs uppercase tracking-widest text-punk-yellow opacity-0 transition-opacity group-hover:opacity-100">
              Acceder <ArrowRight size={14} />
            </span>
          </Link>
        )}

        {(session.user?.effectiveRole ?? session.user?.role) === "ORGANIZADOR" && (
          <Link
            href="/dashboard/organizador"
            className={`group flex flex-col rounded-xl border-2 bg-gradient-to-br p-6 transition-all duration-200 ${CARD_ACCENTS.organizador}`}
          >
            <Sparkles size={28} className="text-punk-yellow/80" />
            <h2 className="mt-4 font-display text-lg font-semibold text-punk-white">
              Mi organizador
            </h2>
            <p className="mt-2 flex-1 text-sm text-punk-white/60">
              Editar perfil, logo, redes
            </p>
            <span className="mt-4 inline-flex items-center gap-2 font-punch text-xs uppercase tracking-widest text-punk-yellow opacity-0 transition-opacity group-hover:opacity-100">
              Acceder <ArrowRight size={14} />
            </span>
          </Link>
        )}

        {session.user?.role === "PROMOTOR" && (
          <Link
            href="/dashboard/promotor"
            className={`group flex flex-col rounded-xl border-2 bg-gradient-to-br p-6 transition-all duration-200 ${CARD_ACCENTS.promotor}`}
          >
            <Megaphone size={28} className="text-punk-pink/80" />
            <h2 className="mt-4 font-display text-lg font-semibold text-punk-white">
              Mi promotor
            </h2>
            <p className="mt-2 flex-1 text-sm text-punk-white/60">
              Editar perfil, logo, redes
            </p>
            <span className="mt-4 inline-flex items-center gap-2 font-punch text-xs uppercase tracking-widest text-punk-pink opacity-0 transition-opacity group-hover:opacity-100">
              Acceder <ArrowRight size={14} />
            </span>
          </Link>
        )}

        {((session.user?.effectiveRole ?? session.user?.role) === "SALA" || (session.user?.effectiveRole ?? session.user?.role) === "ADMIN") && (
          <Link
            href="/dashboard/sala"
            className={`group flex flex-col rounded-xl border-2 bg-gradient-to-br p-6 transition-all duration-200 ${CARD_ACCENTS.sala}`}
          >
            <Building2 size={28} className="text-punk-pink/80" />
            <h2 className="mt-4 font-display text-lg font-semibold text-punk-white">
              Mi sala
            </h2>
            <p className="mt-2 flex-1 text-sm text-punk-white/60">
              Editar perfil, logo, redes
            </p>
            <span className="mt-4 inline-flex items-center gap-2 font-punch text-xs uppercase tracking-widest text-punk-pink opacity-0 transition-opacity group-hover:opacity-100">
              Acceder <ArrowRight size={14} />
            </span>
          </Link>
        )}

        {((session.user?.effectiveRole ?? session.user?.role) === "SALA" ||
          (session.user?.effectiveRole ?? session.user?.role) === "FESTIVAL" ||
          (session.user?.effectiveRole ?? session.user?.role) === "ASOCIACION" ||
          (session.user?.effectiveRole ?? session.user?.role) === "ORGANIZADOR" ||
          (session.user?.effectiveRole ?? session.user?.role) === "PROMOTOR" ||
          (session.user?.effectiveRole ?? session.user?.role) === "ADMIN") && (
          <Link
            href="/dashboard/eventos"
            className={`group flex flex-col rounded-xl border-2 bg-gradient-to-br p-6 transition-all duration-200 ${CARD_ACCENTS.eventos}`}
          >
            <Calendar size={28} className="text-punk-red/80" />
            <h2 className="mt-4 font-display text-lg font-semibold text-punk-white">
              Mis eventos
            </h2>
            <p className="mt-2 flex-1 text-sm text-punk-white/60">
              Crear y gestionar conciertos
            </p>
            <span className="mt-4 inline-flex items-center gap-2 font-punch text-xs uppercase tracking-widest text-punk-red opacity-0 transition-opacity group-hover:opacity-100">
              Acceder <ArrowRight size={14} />
            </span>
          </Link>
        )}

        {(session.user?.effectiveRole ?? session.user?.role) === "USUARIO" && (
          <div className="col-span-full rounded-xl border-2 border-punk-white/10 bg-punk-black/40 p-8">
            <p className="font-body text-punk-white/50">
              Regístrate como banda, sala o promotor para más opciones.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
