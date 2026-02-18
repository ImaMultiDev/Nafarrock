import { getEvents } from "@/services/event.service";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { PageLayout } from "@/components/ui/PageLayout";

export const metadata = {
  title: "Entradas",
  description: "Próximos eventos y festivales. Consigue tus entradas.",
};

export default async function EntradasPage() {
  const now = new Date();
  const events = await getEvents({
    fromDate: now,
  });

  const conciertos = events.filter((e) => e.type === "CONCIERTO");
  const festivales = events.filter((e) => e.type === "FESTIVAL");

  return (
    <PageLayout>
      <div className="mb-10 sm:mb-16">
        <h1 className="font-display text-5xl tracking-tighter text-punk-white sm:text-6xl lg:text-7xl">
          ENTRADAS
        </h1>
        <p className="mt-3 max-w-xl font-body text-punk-white/60 sm:mt-4">
          Próximos conciertos y festivales. {events.length} eventos en la escena nafarroa.
        </p>
      </div>

      <div className="space-y-12">
        {festivales.length > 0 && (
          <section>
            <h2 className="font-display text-2xl tracking-tighter text-punk-red sm:text-3xl">
              Festivales
            </h2>
            <div className="mt-6 space-y-4">
              {festivales.map((event) => (
                <Link
                  key={event.id}
                  href={`/eventos/${event.slug}`}
                  className="group block overflow-hidden border-2 border-punk-red bg-punk-black p-6 transition-all hover:border-punk-red hover:shadow-[0_0_40px_rgba(230,0,38,0.15)]"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="shrink-0 border-2 border-punk-red/50 bg-punk-red/10 px-6 py-3 text-center">
                      <span className="block font-display text-3xl leading-none text-punk-red">
                        {format(event.date, "dd", { locale: es })}
                      </span>
                      <span className="block font-punch text-xs uppercase tracking-widest text-punk-white/70">
                        {format(event.date, "MMM", { locale: es })}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-display text-xl text-punk-white group-hover:text-punk-red transition-colors">
                        {event.title}
                      </h3>
                      <p className="mt-1 font-body text-punk-white/70">
                        {event.venue.name} · {event.venue.city}
                      </p>
                      {event.ticketUrl && (
                        <span className="mt-3 inline-block font-punch text-xs uppercase tracking-widest text-punk-green">
                          Entradas disponibles →
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="font-display text-2xl tracking-tighter text-punk-white sm:text-3xl">
            Conciertos
          </h2>
          <div className="mt-6 space-y-4">
            {conciertos.map((event) => (
              <Link
                key={event.id}
                href={`/eventos/${event.slug}`}
                className="group block overflow-hidden border-2 border-punk-white/20 bg-punk-black p-6 transition-all hover:border-punk-green hover:shadow-[0_0_40px_rgba(0,200,83,0.1)]"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="shrink-0 border-2 border-punk-green/50 bg-punk-green/10 px-6 py-3 text-center">
                    <span className="block font-display text-3xl leading-none text-punk-green">
                      {format(event.date, "dd", { locale: es })}
                    </span>
                    <span className="block font-punch text-xs uppercase tracking-widest text-punk-white/70">
                      {format(event.date, "MMM", { locale: es })}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display text-xl text-punk-white group-hover:text-punk-green transition-colors">
                      {event.title}
                    </h3>
                    <p className="mt-1 font-body text-punk-white/70">
                      {event.venue.name} · {event.venue.city}
                    </p>
                    {event.bands.length > 0 && (
                      <p className="mt-2 font-punch text-xs uppercase tracking-widest text-punk-green/80">
                        {event.bands.map((be) => be.band.name).join(" + ")}
                      </p>
                    )}
                    {event.ticketUrl && (
                      <span className="mt-3 inline-block font-punch text-xs uppercase tracking-widest text-punk-green">
                        Entradas →
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>

      {events.length === 0 && (
        <div className="border-2 border-punk-white/20 border-dashed p-16 text-center">
          <p className="font-body text-punk-white/60">
            No hay eventos con entradas disponibles. Pronto habrá contenido.
          </p>
          <Link
            href="/eventos"
            className="mt-4 inline-block font-punch text-sm uppercase tracking-widest text-punk-green hover:text-punk-green/80 transition-colors"
          >
            Ver todos los eventos →
          </Link>
        </div>
      )}
    </PageLayout>
  );
}
