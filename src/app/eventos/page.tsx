import { getEvents } from "@/services/event.service";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export const metadata = {
  title: "Eventos",
  description: "Conciertos y festivales en Navarra",
};

export default async function EventosPage() {
  const events = await getEvents();

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-bold text-void-50">
        Conciertos y festivales
      </h1>
      <p className="mt-2 text-void-400">
        {events.length} eventos próximos
      </p>

      <div className="mt-8 space-y-6">
        {events.map((event) => (
          <Link
            key={event.id}
            href={`/eventos/${event.slug}`}
            className="block rounded-lg border border-void-800 bg-void-900/50 p-6 transition hover:border-rock-600/50"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className=" shrink-0 text-center sm:w-24">
                <span className="block text-2xl font-bold text-rock-500">
                  {format(event.date, "dd", { locale: es })}
                </span>
                <span className="block text-sm text-void-400 uppercase">
                  {format(event.date, "MMM", { locale: es })}
                </span>
              </div>
              <div className="flex-1">
                <h2 className="font-display text-xl font-semibold text-void-100">
                  {event.title}
                </h2>
                <p className="text-void-400">
                  {event.venue.name} · {event.venue.city}
                </p>
                {event.bands.length > 0 && (
                  <p className="mt-1 text-sm text-void-500">
                    {event.bands.map((be) => be.band.name).join(" + ")}
                  </p>
                )}
              </div>
              <span
                className={`shrink-0 rounded px-3 py-1 text-sm ${
                  event.type === "FESTIVAL"
                    ? "bg-rock-600/30 text-rock-400"
                    : "bg-void-700 text-void-300"
                }`}
              >
                {event.type === "FESTIVAL" ? "Festival" : "Concierto"}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {events.length === 0 && (
        <p className="mt-12 text-center text-void-500">
          No hay eventos próximos. Pronto habrá contenido.
        </p>
      )}
    </main>
  );
}
