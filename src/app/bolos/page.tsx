import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { PageLayout } from "@/components/ui/PageLayout";
import { BolosList } from "./BolosList";
import { BolosFilters } from "./BolosFilters";

export const metadata = {
  title: "Buscar bolos | Nafarrock",
  description: "Conciertos, festivales, convocatorias y oportunidades para tocar en Nafarroa",
};

export default async function BolosPage() {
  const session = await getServerSession(authOptions);
  const effectiveRole = session?.user?.effectiveRole ?? session?.user?.role;
  const isAdmin = session?.user?.role === "ADMIN";
  const canSeeBolos = effectiveRole === "BANDA" || isAdmin;

  return (
    <PageLayout>
      <div className="mb-8">
        <h1 className="font-display text-4xl tracking-tighter text-punk-white sm:text-5xl">
          Buscar bolos
        </h1>
        <p className="mt-3 font-body text-punk-white/70">
          Conciertos, festivales, convocatorias y oportunidades para tocar en directo.
        </p>
      </div>

      {canSeeBolos ? (
        <>
          <Suspense fallback={<div className="h-16 animate-pulse rounded border-2 border-punk-green/30 bg-punk-black" />}>
            <BolosFilters />
          </Suspense>
          <Suspense fallback={<div className="mt-8 font-body text-punk-white/60">Cargando anuncios...</div>}>
            <BolosList />
          </Suspense>
        </>
      ) : (
        <div className="mt-10 rounded border-2 border-punk-green/50 bg-punk-green/10 p-8 text-center">
          <p className="font-body text-lg text-punk-white/90">
            Para poder ver los anuncios de bolos de promotores, organizadores, sociedades, salas, festivales y asociaciones debes ser una banda registrada y aprobada por Nafarrock.
          </p>
          <p className="mt-4 font-body text-punk-white/80">
            Registra tu banda y escribe a{" "}
            <a
              href="mailto:harremanak@nafarrock.com"
              className="font-semibold text-punk-green hover:underline"
            >
              harremanak@nafarrock.com
            </a>{" "}
            para que podamos comprobar y confirmar tu petición cuanto antes.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Link
              href="/auth/registro"
              className="border-2 border-punk-green bg-punk-green px-6 py-3 font-punch text-sm uppercase tracking-widest text-punk-black transition-colors hover:bg-punk-green/90"
            >
              Registrar banda
            </Link>
            <Link
              href="/auth/reclamar"
              className="border-2 border-punk-white/40 px-6 py-3 font-punch text-sm uppercase tracking-widest text-punk-white/80 transition-colors hover:border-punk-green hover:text-punk-green"
            >
              Reclamar perfil existente
            </Link>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
