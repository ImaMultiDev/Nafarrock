import { getVenues } from "@/services/venue.service";
import Link from "next/link";
import { PageLayout } from "@/components/ui/PageLayout";

export const metadata = {
  title: "Salas y espacios",
  description: "Salas de conciertos y espacios de la escena nafarroa",
};

export default async function SalasPage() {
  const venues = await getVenues();

  return (
    <PageLayout>
      <div className="mb-10 sm:mb-16">
        <h1 className="font-display text-5xl tracking-tighter text-punk-white sm:text-6xl lg:text-7xl">
          SALAS
        </h1>
        <p className="mt-3 max-w-xl font-body text-punk-white/60 sm:mt-4">
          Espacios de la escena. {venues.length} salas y lugares en Nafarroa.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
        {venues.map((venue) => (
          <Link
            key={venue.id}
            href={`/salas/${venue.slug}`}
            className="group relative block overflow-hidden border-2 border-punk-pink bg-punk-black p-8 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(255,0,110,0.2)]"
          >
            <div className="absolute right-0 top-0 h-16 w-16 border-t-2 border-r-2 border-punk-pink" style={{ clipPath: "polygon(100% 0, 100% 100%, 0 0)" }} />
            <h2 className="font-display text-2xl tracking-tighter text-punk-white group-hover:text-punk-pink transition-colors">
              {venue.name}
            </h2>
            <p className="mt-2 font-body text-punk-white/70">{venue.city}</p>
            {venue.capacity && (
              <p className="mt-2 font-punch text-xs uppercase tracking-widest text-punk-pink/80">
                Aforo: {venue.capacity} personas
              </p>
            )}
          </Link>
        ))}
      </div>

      {venues.length === 0 && (
        <div className="border-2 border-punk-white/20 border-dashed p-16 text-center">
          <p className="font-body text-punk-white/60">
            Aún no hay salas registradas. Pronto habrá contenido.
          </p>
          <Link href="/" className="mt-4 inline-block font-punch text-sm uppercase tracking-widest text-punk-pink hover:text-punk-pink/80 transition-colors">
            Volver al inicio →
          </Link>
        </div>
      )}
    </PageLayout>
  );
}
