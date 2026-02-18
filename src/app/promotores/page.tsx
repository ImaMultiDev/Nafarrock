import { getPromoters } from "@/services/promoter.service";
import Link from "next/link";
import { PageLayout } from "@/components/ui/PageLayout";

export const metadata = {
  title: "Promotores",
  description: "Promotores de conciertos en Nafarroa",
};

export default async function PromotoresPage() {
  const promoters = await getPromoters();

  return (
    <PageLayout>
      <div className="mb-10 sm:mb-16">
        <h1 className="font-display text-5xl tracking-tighter text-punk-white sm:text-6xl lg:text-7xl">
          PROMOTORES
        </h1>
        <p className="mt-3 max-w-xl font-body text-punk-white/60 sm:mt-4">
          Promotores de conciertos en Nafarroa. {promoters.length} promotores.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
        {promoters.map((promoter) => (
          <Link
            key={promoter.id}
            href={`/promotores/${promoter.slug}`}
            className="group relative block overflow-hidden border-2 border-punk-pink bg-punk-black p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(255,0,110,0.2)]"
          >
            <div
              className="absolute right-0 top-0 h-16 w-16 border-t-2 border-r-2 border-punk-pink"
              style={{ clipPath: "polygon(100% 0, 100% 100%, 0 0)" }}
            />
            <div className="aspect-[4/3] overflow-hidden border border-punk-white/10">
              {promoter.imageUrl ? (
                <img
                  src={promoter.imageUrl}
                  alt={promoter.name}
                  className="h-full w-full object-cover transition group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-punk-black/80 font-display text-4xl text-punk-pink/50">
                  {promoter.name.charAt(0)}
                </div>
              )}
            </div>
            <h2 className="mt-4 font-display text-xl tracking-tighter text-punk-white transition-colors group-hover:text-punk-pink">
              {promoter.name}
            </h2>
          </Link>
        ))}
      </div>

      {promoters.length === 0 && (
        <div className="border-2 border-dashed border-punk-white/20 p-16 text-center">
          <p className="font-body text-punk-white/60">
            No hay promotores registrados.
          </p>
          <Link href="/" className="mt-4 inline-block font-punch text-sm uppercase tracking-widest text-punk-pink hover:text-punk-pink/80">
            Volver al inicio
          </Link>
        </div>
      )}
    </PageLayout>
  );
}
