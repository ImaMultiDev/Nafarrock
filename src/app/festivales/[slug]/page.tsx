import { getFestivalBySlug } from "@/services/festival.service";
import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { PageLayout } from "@/components/ui/PageLayout";
import { ImageLightbox } from "@/components/ui/ImageLightbox";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const festival = await getFestivalBySlug(slug);
  if (!festival) return {};
  return {
    title: festival.name,
    description: festival.description ?? `Festival de rock en Nafarroa: ${festival.name}`,
  };
}

export default async function FestivalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const festival = await getFestivalBySlug(slug);
  if (!festival) notFound();

  const links = [
    festival.websiteUrl && { label: "Web", url: festival.websiteUrl },
    festival.instagramUrl && { label: "Instagram", url: festival.instagramUrl },
    festival.facebookUrl && { label: "Facebook", url: festival.facebookUrl },
  ].filter(Boolean) as { label: string; url: string }[];

  return (
    <PageLayout>
      <Link
        href="/festivales"
        className="font-punch text-xs uppercase tracking-widest text-punk-red transition-colors hover:text-punk-red/80"
      >
        Volver a festivales
      </Link>

      <div className="mt-8 flex flex-col gap-8 md:flex-row">
        <div className="min-w-0 shrink-0">
          <div className="aspect-square w-full max-w-64 overflow-hidden border-2 border-punk-red">
            {festival.logoUrl ? (
              <ImageLightbox
                src={festival.logoUrl}
                alt={festival.name}
                thumbnailClassName="h-full w-full object-cover cursor-pointer"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-punk-black font-display text-6xl text-punk-red/40">
                {festival.name.charAt(0)}
              </div>
            )}
          </div>
        </div>
        <div className="flex-1">
          <h1 className="font-display text-4xl tracking-tighter text-punk-white sm:text-5xl">
            {festival.name}
          </h1>
          {festival.location && (
            <p className="mt-2 font-body text-punk-white/70">{festival.location}</p>
          )}
          {festival.foundedYear && (
            <p className="mt-1 font-punch text-xs uppercase tracking-widest text-punk-red/80">
              Desde {festival.foundedYear}
            </p>
          )}
          {festival.description && (
            <p className="mt-4 font-body leading-relaxed text-punk-white/80">
              {festival.description}
            </p>
          )}
          {festival.images && festival.images.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-4">
              {festival.images.map((url, i) => (
                <ImageLightbox
                  key={i}
                  src={url}
                  alt={`${festival.name} ${i + 1}`}
                  thumbnailClassName="h-24 w-24 object-cover border-2 border-punk-red/50 cursor-pointer"
                />
              ))}
            </div>
          )}
          {links.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-4">
              {links.map(({ label, url }) => (
                <a
                  key={label}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-2 border-punk-red bg-transparent px-4 py-2 font-punch text-xs uppercase tracking-widest text-punk-red transition-all hover:bg-punk-red hover:text-punk-black"
                >
                  {label}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {festival.events.length > 0 && (
        <div className="mt-16">
          <h2 className="font-display text-2xl tracking-tighter text-punk-white">
            Eventos
          </h2>
          <ul className="mt-6 space-y-3">
            {festival.events.map((evt) => (
              <li key={evt.id}>
                <Link
                  href={`/eventos/${evt.slug}`}
                  className="flex flex-wrap items-center justify-between gap-4 border-2 border-punk-red/50 bg-punk-black p-4 transition-all hover:border-punk-red"
                >
                  <span className="font-display text-punk-white">{evt.title}</span>
                  <span className="font-punch text-xs uppercase tracking-widest text-punk-red">
                    {format(evt.date, "d MMM yyyy", { locale: es })} · {evt.venue.name}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </PageLayout>
  );
}
