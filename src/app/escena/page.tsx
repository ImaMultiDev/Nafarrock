import Link from "next/link";
import { getPromoters } from "@/services/promoter.service";
import { getOrganizers } from "@/services/organizer.service";
import { getFestivals } from "@/services/festival.service";
import { getVenues } from "@/services/venue.service";
import { PageLayout } from "@/components/ui/PageLayout";

export const metadata = {
  title: "Escena",
  description: "Salas, promotores, organizadores y festivales de la escena rock nafarroa",
};

export default async function EscenaPage() {
  const [promotersRes, organizersRes, festivalsRes, venuesRes] = await Promise.all([
    getPromoters({ pageSize: 1 }, true),
    getOrganizers({ pageSize: 1 }, true),
    getFestivals({ pageSize: 1 }, true),
    getVenues({ pageSize: 1 }),
  ]);

  const escenaItems = [
    {
      tipo: "sala",
      label: "Salas / Recintos",
      href: "/salas",
      count: venuesRes.total,
      color: "punk-acid",
      desc: "Espacios donde suena la escena",
    },
    {
      tipo: "promotor",
      label: "Promotores",
      href: "/promotores",
      count: promotersRes.total,
      color: "punk-pink",
      desc: "Promoción de conciertos y eventos",
    },
    {
      tipo: "organizador",
      label: "Organizadores",
      href: "/organizadores",
      count: organizersRes.total,
      color: "punk-green",
      desc: "Organización de eventos puntuales",
    },
    {
      tipo: "festival",
      label: "Festivales",
      href: "/festivales",
      count: festivalsRes.total,
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
          Salas, promotores, organizadores y festivales que hacen posible la escena rock nafarroa.
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
                : item.color === "punk-red"
                ? "border-punk-red hover:shadow-[0_0_40px_rgba(230,0,38,0.2)]"
                : "border-punk-acid hover:shadow-[0_0_40px_rgba(200,255,0,0.2)]"
            }`}
          >
            <h2
              className={`font-display text-2xl tracking-tighter ${
                item.color === "punk-pink"
                  ? "text-punk-pink"
                  : item.color === "punk-green"
                  ? "text-punk-green"
                  : item.color === "punk-red"
                  ? "text-punk-red"
                  : "text-punk-acid"
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
                    : item.color === "punk-red"
                    ? "text-punk-red"
                    : "text-punk-acid"
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
