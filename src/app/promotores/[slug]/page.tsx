import { getPromoterBySlug } from "@/services/promoter.service";
import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { PageLayout } from "@/components/ui/PageLayout";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const promoter = await getPromoterBySlug(slug);
  if (!promoter) return {};
  return {
    title: promoter.name,
    description: promoter.description ?? `Promotor en Nafarroa: ${promoter.name}`,
  };
}

export default async function PromoterPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const promoter = await getPromoterBySlug(slug);
  if (!promoter) notFound();

  const links = [
    promoter.websiteUrl && { label: "Web", url: promoter.websiteUrl },
    promoter.contactEmail && {
      label: "Contacto",
      url: `mailto:${promoter.contactEmail}`,
    },
  ].filter(Boolean) as { label: string; url: string }[];

  return (
    <PageLayout>
      <Link
        href="/promotores"
        className="font-punch text-xs uppercase tracking-widest text-punk-pink transition-colors hover:text-punk-pink/80"
      >
        Volver a promotores
      </Link>

      <div className="mt-8 flex flex-col gap-8 md:flex-row">
        <div className="shrink-0">
          <div className="aspect-square w-64 overflow-hidden border-2 border-punk-pink">
            {promoter.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={promoter.imageUrl}
                alt={promoter.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-punk-black font-display text-6xl text-punk-pink/40">
                {promoter.name.charAt(0)}
              </div>
            )}
          </div>
        </div>
        <div className="flex-1">
          <h1 className="font-display text-4xl tracking-tighter text-punk-white sm:text-5xl">
            {promoter.name}
          </h1>
          {promoter.description && (
            <p className="mt-4 font-body leading-relaxed text-punk-white/80">
              {promoter.description}
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
                  className="border-2 border-punk-pink bg-transparent px-4 py-2 font-punch text-xs uppercase tracking-widest text-punk-pink transition-all hover:bg-punk-pink hover:text-punk-black"
                >
                  {label}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {promoter.events.length > 0 && (
        <div className="mt-16">
          <h2 className="font-display text-2xl tracking-tighter text-punk-white">
            Eventos
          </h2>
          <ul className="mt-6 space-y-3">
            {promoter.events.map((evt) => (
              <li key={evt.id}>
                <Link
                  href={`/eventos/${evt.slug}`}
                  className="flex flex-wrap items-center justify-between gap-4 border-2 border-punk-pink/50 bg-punk-black p-4 transition-all hover:border-punk-pink"
                >
                  <span className="font-display text-punk-white">{evt.title}</span>
                  <span className="font-punch text-xs uppercase tracking-widest text-punk-pink">
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
