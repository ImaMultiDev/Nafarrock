import { getBands } from "@/services/band.service";
import Link from "next/link";
import { PageLayout } from "@/components/ui/PageLayout";

export const metadata = {
  title: "Bandas",
  description: "Bandas nafarroas históricas y emergentes",
};

export default async function BandasPage() {
  const bands = await getBands();

  return (
    <PageLayout>
      <div className="mb-10 sm:mb-16">
        <h1 className="font-display text-5xl tracking-tighter text-punk-white sm:text-6xl lg:text-7xl">
          BANDAS
        </h1>
        <p className="mt-3 max-w-xl font-body text-punk-white/60 sm:mt-4">
          Históricas y emergentes de Nafarroa. {bands.length} bandas en la escena.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
        {bands.map((band) => (
          <Link
            key={band.id}
            href={`/bandas/${band.slug}`}
            className="group relative block overflow-hidden border-2 border-punk-green bg-punk-black p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(0,200,83,0.2)]"
          >
            <div className="absolute right-0 top-0 h-16 w-16 border-t-2 border-r-2 border-punk-green" style={{ clipPath: "polygon(100% 0, 100% 100%, 0 0)" }} />
            <div className="aspect-[4/3] overflow-hidden border border-punk-white/10">
              {band.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={band.imageUrl}
                  alt={band.name}
                  className="h-full w-full object-cover transition group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-punk-black/80 font-display text-4xl text-punk-green/50">
                  {band.name.charAt(0)}
                </div>
              )}
            </div>
            <h2 className="mt-4 font-display text-xl tracking-tighter text-punk-white group-hover:text-punk-green transition-colors">
              {band.name}
            </h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {band.genres.slice(0, 3).map((g) => (
                <span
                  key={g}
                  className="border border-punk-green/50 bg-punk-green/5 px-2 py-0.5 font-punch text-xs uppercase tracking-widest text-punk-green"
                >
                  {g}
                </span>
              ))}
            </div>
            {band.isEmerging && (
              <span className="mt-2 inline-block font-punch text-xs uppercase tracking-widest text-punk-red">
                Emergente
              </span>
            )}
          </Link>
        ))}
      </div>

      {bands.length === 0 && (
        <div className="border-2 border-punk-white/20 border-dashed p-16 text-center">
          <p className="font-body text-punk-white/60">
            Aún no hay bandas registradas. Pronto habrá contenido.
          </p>
          <Link href="/" className="mt-4 inline-block font-punch text-sm uppercase tracking-widest text-punk-green hover:text-punk-green/80 transition-colors">
            Volver al inicio →
          </Link>
        </div>
      )}
    </PageLayout>
  );
}
