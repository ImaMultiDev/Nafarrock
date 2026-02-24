import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAssociationBySlug } from "@/services/association.service";
import { notFound } from "next/navigation";
import Link from "next/link";
import { canViewRestrictedEscena } from "@/lib/escena-visibility";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { PageLayout } from "@/components/ui/PageLayout";
import { ImageLightbox } from "@/components/ui/ImageLightbox";
import { SocialLinks, type SocialLinkItem } from "@/components/ui/SocialLinks";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const association = await getAssociationBySlug(slug);
  if (!association) return {};
  return {
    title: association.name,
    description: association.description ?? `Asociación de rock en Nafarroa: ${association.name}`,
  };
}

export default async function AsociacionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!canViewRestrictedEscena(session)) {
    redirect("/auth/acceso-escena");
  }

  const { slug } = await params;
  const association = await getAssociationBySlug(slug);
  if (!association) notFound();

  const links: SocialLinkItem[] = [
    ...(association.websiteUrl ? [{ kind: "web" as const, url: association.websiteUrl }] : []),
    ...(association.instagramUrl ? [{ kind: "instagram" as const, url: association.instagramUrl }] : []),
    ...(association.facebookUrl ? [{ kind: "facebook" as const, url: association.facebookUrl }] : []),
  ];

  return (
    <PageLayout>
      <Link
        href="/asociaciones"
        className="font-punch text-xs uppercase tracking-widest text-punk-yellow transition-colors hover:text-punk-yellow/80"
      >
        ← Volver a asociaciones
      </Link>

      <div className="mt-8 flex flex-col gap-8 md:flex-row">
        <div className="min-w-0 shrink-0">
          <div className="aspect-square w-full max-w-64 overflow-hidden border-2 border-punk-yellow">
            {association.logoUrl ? (
              <ImageLightbox
                src={association.logoUrl}
                alt={association.name}
                thumbnailClassName="h-full w-full object-cover cursor-pointer"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-punk-black font-display text-6xl text-punk-yellow/40">
                {association.name.charAt(0)}
              </div>
            )}
          </div>
        </div>
        <div className="flex-1">
          <h1 className="font-display text-4xl tracking-tighter text-punk-white sm:text-5xl">
            {association.name}
          </h1>
          {!association.userId && association.createdByNafarrock && (
            <p className="mt-2 font-punch text-xs uppercase tracking-widest text-punk-yellow/90">
              Perfil creado por Nafarrock
            </p>
          )}
          {association.location && (
            <p className="mt-2 font-body text-punk-white/70">{association.location}</p>
          )}
          {association.foundedYear && (
            <p className="mt-1 font-punch text-xs uppercase tracking-widest text-punk-yellow/80">
              Desde {association.foundedYear}
            </p>
          )}
          {association.description && (
            <p className="mt-4 font-body leading-relaxed text-punk-white/80">
              {association.description}
            </p>
          )}
          {association.images && association.images.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-4">
              {association.images.map((url: string, i: number) => (
                <ImageLightbox
                  key={i}
                  src={url}
                  alt={`${association.name} ${i + 1}`}
                  thumbnailClassName="h-24 w-24 object-cover border-2 border-punk-yellow/50 cursor-pointer"
                />
              ))}
            </div>
          )}
          {links.length > 0 && (
            <div className="mt-6">
              <SocialLinks links={links} variant="yellow" />
            </div>
          )}
        </div>
      </div>

      {association.events.length > 0 && (
        <div className="mt-16">
          <h2 className="font-display text-2xl tracking-tighter text-punk-white">
            Próximos eventos
          </h2>
          <ul className="mt-6 space-y-3">
            {association.events.map((evt: { id: string; slug: string; title: string; date: Date; venue: { name: string } }) => (
              <li key={evt.id}>
                <Link
                  href={`/eventos/${evt.slug}`}
                  className="flex flex-wrap items-center justify-between gap-4 border-2 border-punk-yellow/50 bg-punk-black p-4 transition-all hover:border-punk-yellow"
                >
                  <span className="font-display text-punk-white">{evt.title}</span>
                  <span className="font-punch text-xs uppercase tracking-widest text-punk-yellow">
                    {format(evt.date, "d MMM yyyy", { locale: es })} · {evt.venue?.name ?? "Por confirmar"}
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
