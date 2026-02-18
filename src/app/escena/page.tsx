import Link from "next/link";
import { getPromoters } from "@/services/promoter.service";
import { getOrganizers } from "@/services/organizer.service";
import { getFestivals } from "@/services/festival.service";
import { PageLayout } from "@/components/ui/PageLayout";

export const metadata = {
  title: "Escena",
  description: "Promotores, organizadores, festivales y colectivos de la escena rock nafarroa",
};

export default async function EscenaPage() {
  const [promoters, organizers, festivals] = await Promise.all([
    getPromoters(),
    getOrganizers(),
    getFestivals(),
  ]);

  const escenaItems = [
    {
      tipo: "promotor",
      label: "Promotores",
      href: "/promotores",
      count: promoters.length,
      color: "punk-pink",
      desc: "Promoción de conciertos y eventos",
    },
    {
      tipo: "organizador",
      label: "Organizadores",
      href: "/organizadores",
      count: organizers.length,
      color: "punk-green",
      desc: "Organización de eventos puntuales",
    },
    {
      tipo: "festival",
      label: "Festivales",
      href: "/festivales",
      count: festivals.length,
      color: "punk-red",
      desc: "Festivales de la escena",
    },
  ];

  return (
    <PageLayout>
      <div className="mb-10 sm:mb-16">
        <h1 className="font-display text-5xl tracking-tighter text-punk-white sm:text-6xl lg:text-7xl">
          ESCENA
        </h1>
        <p className="mt-3 max-w-xl font-body text-punk-white/60 sm:mt-4">
          Promotores, organizadores y festivales que hacen posible la escena rock nafarroa.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {escenaItems.map((item) => (
          <Link
            key={item.tipo}
            href={item.href}
            className={`group block overflow-hidden border-2 bg-punk-black p-8 transition-all duration-300 hover:scale-[1.02] ${
              item.color === "punk-pink"
                ? "border-punk-pink hover:shadow-[0_0_40px_rgba(255,0,110,0.2)]"
                : item.color === "punk-green"
                ? "border-punk-green hover:shadow-[0_0_40px_rgba(0,200,83,0.2)]"
                : "border-punk-red hover:shadow-[0_0_40px_rgba(230,0,38,0.2)]"
            }`}
          >
            <h2
              className={`font-display text-2xl tracking-tighter ${
                item.color === "punk-pink"
                  ? "text-punk-pink"
                  : item.color === "punk-green"
                  ? "text-punk-green"
                  : "text-punk-red"
              }`}
            >
              {item.label}
            </h2>
            <p className="mt-2 font-body text-sm text-punk-white/70">
              {item.desc}
            </p>
            <p className="mt-4 font-punch text-xs uppercase tracking-widest text-punk-white/50">
              {item.count} {item.count === 1 ? "entidad" : "entidades"}
            </p>
            <span
              className={`mt-6 inline-block font-punch text-xs uppercase tracking-widest transition-all group-hover:translate-x-2 ${
                item.color === "punk-pink"
                  ? "text-punk-pink"
                  : item.color === "punk-green"
                  ? "text-punk-green"
                  : "text-punk-red"
              }`}
            >
              Ver listado →
            </span>
          </Link>
        ))}
      </div>
    </PageLayout>
  );
}
