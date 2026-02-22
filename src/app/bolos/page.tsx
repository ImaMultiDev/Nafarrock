import { Suspense } from "react";
import { PageLayout } from "@/components/ui/PageLayout";
import { BolosList } from "./BolosList";
import { BolosFilters } from "./BolosFilters";

export const metadata = {
  title: "Buscar bolos | Nafarrock",
  description: "Conciertos, festivales, convocatorias y oportunidades para tocar en Nafarroa",
};

export default function BolosPage() {
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

      <Suspense fallback={<div className="h-16 animate-pulse rounded border-2 border-punk-green/30 bg-punk-black" />}>
        <BolosFilters />
      </Suspense>

      <Suspense fallback={<div className="mt-8 font-body text-punk-white/60">Cargando anuncios...</div>}>
        <BolosList />
      </Suspense>
    </PageLayout>
  );
}
