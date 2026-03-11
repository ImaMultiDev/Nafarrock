import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getPromoterBySlug } from "@/services/promoter.service";
import { notFound } from "next/navigation";
import Link from "next/link";
import { canViewRestrictedEscena } from "@/lib/escena-visibility";
import { format } from "date-fns";
import { getTranslations, getLocale } from "next-intl/server";
import { getDateLocale } from "@/lib/date-locale";
import { PageLayout } from "@/components/ui/PageLayout";
import { ImageLightbox } from "@/components/ui/ImageLightbox";
import { SocialLinks, type SocialLinkItem } from "@/components/ui/SocialLinks";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const promoter = await getPromoterBySlug(slug);
  if (!promoter) return {};
  const description = promoter.description ?? `Promotor en Nafarroa: ${promoter.name}`;
  const imageUrl = promoter.imageUrl;
  const base = (await import("@/lib/site-url")).getSiteUrl();
  const canonicalUrl = `${base}/promotores/${slug}`;
  return {
    title: promoter.name,
    description,
    openGraph: {
      title: promoter.name,
      description,
      url: canonicalUrl,
      siteName: "Nafarrock",
      type: "profile",
      images: imageUrl ? [{ url: imageUrl, width: 600, height: 600, alt: promoter.name }] : undefined,
    },
    twitter: { card: "summary_large_image", title: promoter.name, description, images: imageUrl ? [imageUrl] : undefined },
    alternates: { canonical: canonicalUrl },
  };
}

export default async function PromoterPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!canViewRestrictedEscena(session)) {
    redirect("/auth/acceso-escena");
  }

  const { slug } = await params;
  const promoter = await getPromoterBySlug(slug);
  if (!promoter) notFound();

  const locale = await getLocale();
  const dateLocale = getDateLocale(locale);
  const t = await getTranslations("promoterDetail");

  const links: SocialLinkItem[] = [
    ...(promoter.websiteUrl ? [{ kind: "web" as const, url: promoter.websiteUrl }] : []),
    ...(promoter.contactEmail
      ? [{ kind: "email" as const, url: `mailto:${promoter.contactEmail}`, label: "Contacto" }]
      : []),
  ];

  return (
    <PageLayout>
      <Link
        href="/promotores"
        className="font-punch text-xs uppercase tracking-widest text-punk-pink transition-colors hover:text-punk-pink/80"
      >
        {t("backToPromoters")}
      </Link>

      <div className="mt-8 flex flex-col gap-8 md:flex-row">
        <div className="min-w-0 shrink-0">
          <div className="aspect-square w-full max-w-64 overflow-hidden border-2 border-punk-pink">
            {promoter.imageUrl ? (
              <ImageLightbox
                src={promoter.imageUrl}
                alt={promoter.name}
                thumbnailClassName="h-full w-full object-cover cursor-pointer"
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
          {links.length > 0 && (
            <div className="mt-2">
              <SocialLinks links={links} variant="pink" />
            </div>
          )}
          {promoter.description && (
            <p className="mt-4 font-body leading-relaxed text-punk-white/80">
              {promoter.description}
            </p>
          )}
        </div>
      </div>

      {promoter.events.length > 0 && (
        <div className="mt-16">
          <h2 className="font-display text-2xl tracking-tighter text-punk-white">
            {t("upcoming")}
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
                    {format(evt.date, "d MMM yyyy", { locale: dateLocale })} · {evt.venue?.name ?? t("toConfirm")}
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
