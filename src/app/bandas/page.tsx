import { getBands } from "@/services/band.service";
import Link from "next/link";

export const metadata = {
  title: "Bandas",
  description: "Bandas navarras históricas y emergentes",
};

export default async function BandasPage() {
  const bands = await getBands();

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-bold text-void-50">
        Bandas navarras
      </h1>
      <p className="mt-2 text-void-400">
        {bands.length} bandas en la base de datos
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {bands.map((band) => (
          <Link
            key={band.id}
            href={`/bandas/${band.slug}`}
            className="group rounded-lg border border-void-800 bg-void-900/50 p-6 transition hover:border-rock-600/50"
          >
            <div className="aspect-[4/3] overflow-hidden rounded-md bg-void-800">
              {band.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={band.imageUrl}
                  alt={band.name}
                  className="h-full w-full object-cover transition group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-void-600">
                  {band.name.charAt(0)}
                </div>
              )}
            </div>
            <h2 className="mt-4 font-display text-lg font-semibold text-void-100 group-hover:text-rock-400">
              {band.name}
            </h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {band.genres.slice(0, 3).map((g) => (
                <span
                  key={g}
                  className="rounded bg-void-800 px-2 py-0.5 text-xs text-void-400"
                >
                  {g}
                </span>
              ))}
            </div>
            {band.isEmerging && (
              <span className="mt-2 inline-block text-xs text-rock-400">
                Emergente
              </span>
            )}
          </Link>
        ))}
      </div>

      {bands.length === 0 && (
        <p className="mt-12 text-center text-void-500">
          Aún no hay bandas registradas. Pronto habrá contenido.
        </p>
      )}
    </main>
  );
}
