import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getOrganizers } from "@/services/organizer.service";
import Link from "next/link";
import { PageLayout } from "@/components/ui/PageLayout";
import { Pagination } from "@/components/ui/Pagination";
import { canViewRestrictedEscena } from "@/lib/escena-visibility";

export const metadata = {
  title: "Organizadores",
  description: "Organizadores de eventos en Nafarroa",
};

type Props = { searchParams: Promise<Record<string, string | undefined>> };

export default async function OrganizadoresPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions);
  if (!canViewRestrictedEscena(session)) {
    redirect("/auth/acceso-escena");
  }

  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const { items: organizers, total } = await getOrganizers({ page }, true);

  return (
    <PageLayout>
      <div className="mb-10 sm:mb-16">
        <h1 className="font-display text-5xl tracking-tighter text-punk-white sm:text-6xl lg:text-7xl">
          ORGANIZADORES
        </h1>
        <p className="mt-3 max-w-xl font-body text-punk-white/60 sm:mt-4">
          Organizadores de eventos en Nafarroa. {total} {total === 1 ? "organizador" : "organizadores"}.
        </p>
      </div>

      <div className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
        {organizers.map((organizer) => (
          <Link
            key={organizer.id}
            href={`/organizadores/${organizer.slug}`}
            className="group relative block min-w-0 overflow-hidden border-2 border-punk-green bg-punk-black p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(0,200,83,0.2)] max-[299px]:p-3"
          >
            <div
              className="absolute right-0 top-0 h-16 w-16 border-t-2 border-r-2 border-punk-green"
              style={{ clipPath: "polygon(100% 0, 100% 100%, 0 0)" }}
            />
            <div className="aspect-[4/3] min-h-0 min-w-0 overflow-hidden border border-punk-white/10">
              {organizer.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={organizer.logoUrl}
                  alt={organizer.name}
                  className="h-full w-full object-cover transition group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-punk-black/80 font-display text-4xl text-punk-green/50">
                  {organizer.name.charAt(0)}
                </div>
              )}
            </div>
            <h2 className="mt-4 font-display text-xl tracking-tighter text-punk-white transition-colors group-hover:text-punk-green">
              {organizer.name}
            </h2>
          </Link>
        ))}
      </div>

      <Pagination page={page} totalItems={total} />

      {organizers.length === 0 && (
        <div className="border-2 border-dashed border-punk-white/20 p-16 text-center">
          <p className="font-body text-punk-white/60">
            Aún no hay organizadores registrados. Pronto habrá contenido. Mientras tanto, explora eventos y promotores.
          </p>
          <Link
            href="/"
            className="mt-4 inline-block font-punch text-sm uppercase tracking-widest text-punk-green transition-colors hover:text-punk-green/80"
          >
            ← Volver al inicio
          </Link>
        </div>
      )}
    </PageLayout>
  );
}
