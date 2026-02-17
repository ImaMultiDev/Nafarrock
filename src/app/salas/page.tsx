import { getVenues } from "@/services/venue.service";
import Link from "next/link";

export const metadata = {
  title: "Salas y espacios",
  description: "Salas de conciertos y espacios de la escena navarra",
};

export default async function SalasPage() {
  const venues = await getVenues();

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-bold text-void-50">
        Salas y espacios
      </h1>
      <p className="mt-2 text-void-400">
        {venues.length} espacios en Navarra
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {venues.map((venue) => (
          <Link
            key={venue.id}
            href={`/salas/${venue.slug}`}
            className="group rounded-lg border border-void-800 bg-void-900/50 p-6 transition hover:border-rock-600/50"
          >
            <h2 className="font-display text-xl font-semibold text-void-100 group-hover:text-rock-400">
              {venue.name}
            </h2>
            <p className="mt-1 text-void-400">{venue.city}</p>
            {venue.capacity && (
              <p className="mt-1 text-sm text-void-500">
                Aforo: {venue.capacity} personas
              </p>
            )}
          </Link>
        ))}
      </div>

      {venues.length === 0 && (
        <p className="mt-12 text-center text-void-500">
          Aún no hay salas registradas. Pronto habrá contenido.
        </p>
      )}
    </main>
  );
}
