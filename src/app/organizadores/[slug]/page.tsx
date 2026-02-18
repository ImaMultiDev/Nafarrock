import { getOrganizerBySlug } from "@/services/organizer.service";
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
  const organizer = await getOrganizerBySlug(slug);
  if (!organizer) return {};
  return {
    title: organizer.name,
    description:
      organizer.description ??
      `Organizador de eventos en Nafarroa: ${organizer.name}`,
  };
}

export default async function OrganizerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const organizer = await getOrganizerBySlug(slug);
  if (!organizer) notFound();

  const links = [
    organizer.websiteUrl && { label: "Web", url: organizer.websiteUrl },
    organizer.contactEmail && {
      label: "Contacto",
      url: `mailto:${organizer.contactEmail}`,
    },
  ].filter(Boolean) as { label: string; url: string }[];

  return (
    <PageLayout>
      <Link
        href="/organizadores"
        className="font-punch text-xs uppercase tracking-widest text-punk-green transition-colors hover:text-punk-green/80"
      >
        ← Volver a organizadores
      </Link>

      <div className="mt-8 flex flex-col gap-8 md:flex-row">
        <div className="min-w-0 shrink-0">
          <div className="aspect-square w-full max-w-64 overflow-hidden border-2 border-punk-green">
            {organizer.logoUrl ? (
              <ImageLightbox
                src={organizer.logoUrl}
                alt={organizer.name}
                thumbnailClassName="h-full w-full object-cover cursor-pointer"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-punk-black font-display text-6xl text-punk-green/40">
                {organizer.name.charAt(0)}
              </div>
            )}
          </div>
        </div>
        <div className="flex-1">
          <h1 className="font-display text-4xl tracking-tighter text-punk-white sm:text-5xl">
            {organizer.name}
          </h1>
          {organizer.description && (
            <p className="mt-4 font-body leading-relaxed text-punk-white/80">
              {organizer.description}
            </p>
          )}
          {links.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-4">
              {links.map(({ label, url }) => (
                <a
                  key={label}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-2 border-punk-green bg-transparent px-4 py-2 font-punch text-xs uppercase tracking-widest text-punk-green transition-all hover:bg-punk-green hover:text-punk-black"
                >
                  {label}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {organizer.events.length > 0 && (
        <div className="mt-16">
          <h2 className="font-display text-2xl tracking-tighter text-punk-white">
            Eventos
          </h2>
          <ul className="mt-6 space-y-3">
            {organizer.events.map((evt) => (
              <li key={evt.id}>
                <Link
                  href={`/eventos/${evt.slug}`}
                  className="flex flex-wrap items-center justify-between gap-4 border-2 border-punk-green/50 bg-punk-black p-4 transition-all hover:border-punk-green hover:shadow-[0_0_20px_rgba(0,200,83,0.15)]"
                >
                  <span className="font-display text-punk-white">
                    {evt.title}
                  </span>
                  <span className="font-punch text-xs uppercase tracking-widest text-punk-green">
                    {format(evt.date, "d MMM yyyy", { locale: es })} ·{" "}
                    {evt.venue.name}
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
