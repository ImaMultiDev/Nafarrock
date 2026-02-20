import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { PageLayout } from "@/components/ui/PageLayout";
import { ClaimSearchForm } from "./ClaimSearchForm";

export const metadata = {
  title: "Reclamar perfil",
  description: "Busca y reclama tu perfil de banda, sala o festival",
};

export default async function ReclamarPage() {
  const session = await getServerSession(authOptions);

  return (
    <PageLayout>
      <Link
        href="/auth/registro"
        className="font-punch text-xs uppercase tracking-widest text-punk-green hover:text-punk-green/80"
      >
        ← Volver al registro
      </Link>
      <h1 className="mt-6 font-display text-5xl tracking-tighter text-punk-white sm:text-6xl">
        RECLAMAR PERFIL
      </h1>
      <p className="mt-3 max-w-xl font-body text-punk-white/60">
        Si tu banda, sala o festival ya aparece en Nafarrock (creado por el equipo),
        puedes reclamarlo para gestionarlo tú mismo. Busca por nombre y envía una solicitud.
      </p>
      {!session ? (
        <div className="mt-8 border-2 border-punk-red/50 bg-punk-red/10 p-6">
          <p className="font-body text-punk-white/90">
            Debes iniciar sesión para reclamar un perfil.
          </p>
          <Link
            href={`/auth/login?callbackUrl=${encodeURIComponent("/auth/reclamar")}`}
            className="mt-4 inline-block border-2 border-punk-red px-4 py-2 font-punch text-xs uppercase tracking-widest text-punk-red transition-all hover:bg-punk-red hover:text-punk-black"
          >
            Iniciar sesión
          </Link>
          <span className="mx-2 font-body text-punk-white/60">o</span>
          <Link
            href="/auth/registro"
            className="font-punch text-xs uppercase tracking-widest text-punk-green hover:underline"
          >
            Registrarse
          </Link>
        </div>
      ) : (
        <ClaimSearchForm />
      )}
    </PageLayout>
  );
}
