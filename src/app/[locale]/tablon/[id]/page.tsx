import type { Metadata } from "next";
import { getBoardAnnouncementById } from "@/services/board-announcement.service";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { format } from "date-fns";
import { getTranslations, getLocale } from "next-intl/server";
import { getDateLocale } from "@/lib/date-locale";
import { PageLayout } from "@/components/ui/PageLayout";
import { ImageLightbox } from "@/components/ui/ImageLightbox";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { getSiteUrl } from "@/lib/site-url";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const a = await getBoardAnnouncementById(id);
  if (!a) return {};
  const description = a.description.slice(0, 160);
  const imageUrl = a.imageUrl ?? a.images?.[0];
  const canonicalUrl = `${getSiteUrl()}/tablon/${id}`;
  return {
    title: `${a.title} | Tablón de anuncios`,
    description,
    openGraph: {
      title: a.title,
      description,
      url: canonicalUrl,
      siteName: "Nafarrock",
      type: "website",
      images: imageUrl ? [{ url: imageUrl, width: 600, height: 600, alt: a.title }] : undefined,
    },
    twitter: { card: "summary_large_image", title: a.title, description, images: imageUrl ? [imageUrl] : undefined },
    alternates: { canonical: canonicalUrl },
  };
}

export default async function TablonAnnouncementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const a = await getBoardAnnouncementById(id);
  if (!a) notFound();

  const locale = await getLocale();
  const dateLocale = getDateLocale(locale);
  const t = await getTranslations("boardAnnouncement");
  const tDetail = await getTranslations("boardAnnouncement.detail");

  const mainImg = a.imageUrl ?? (a.images && a.images[0]);
  const allImages = mainImg
    ? [mainImg, ...(a.images ?? []).filter((url) => url !== mainImg)]
    : (a.images ?? []);

  const formattedDate = format(new Date(a.createdAt), "d 'de' MMMM yyyy", { locale: dateLocale });

  return (
    <PageLayout>
      <AnimatedSection>
        {/* Volver: solo desktop */}
        <Link
          href="/tablon"
          className="hidden font-punch text-xs uppercase tracking-widest text-punk-yellow transition-colors hover:text-punk-yellow/80 md:inline-block"
        >
          {tDetail("backToTablon")}
        </Link>

        {/* Mobile: layout unificado como salas/eventos */}
        <div className="mt-4 space-y-6 md:hidden">
          {/* Título neon */}
          <h1 className="neon-announcement-name-sign w-full">
            <span className="neon-announcement-name-text font-display text-xl tracking-tighter sm:text-2xl">
              {a.title}
            </span>
          </h1>
          {/* Metadata: categoría · territorio */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 border-l-2 border-punk-yellow/40 pl-3">
            <span className="border border-punk-yellow/50 bg-punk-yellow/10 px-2 py-0.5 font-punch text-[10px] uppercase tracking-widest text-punk-yellow">
              {t(`categories.${a.category}`)}
            </span>
            {a.territory && (
              <>
                <span className="text-punk-yellow/40 font-punch">·</span>
                <span className="font-body text-sm text-punk-white/80">{a.territory}</span>
              </>
            )}
          </div>
          {/* Fecha */}
          <p className="font-body text-sm text-punk-yellow/70">
            {tDetail("publishedOn")} {formattedDate}
          </p>
          {/* CTA: Contacto por email */}
          <a
            href={`mailto:${a.contactEmail}`}
            className="inline-flex items-center gap-2 border-2 border-punk-yellow bg-punk-yellow px-4 py-3 font-punch text-xs uppercase tracking-widest text-punk-black transition-all hover:bg-punk-yellow/90 hover:shadow-[0_0_20px_rgba(255,214,10,0.3)]"
          >
            {t("contact")}: {a.contactEmail}
          </a>
          {/* Fotos: 1 principal + 2 horizontal */}
          {mainImg && (
            <div className="space-y-2">
              <div className="aspect-[16/10] w-full overflow-hidden border-2 border-punk-yellow/50">
                <ImageLightbox
                  src={mainImg}
                  alt={a.title}
                  thumbnailClassName="h-full w-full object-cover cursor-pointer"
                />
              </div>
              {allImages.length > 1 && (
                <div className="grid grid-cols-2 gap-0 w-fit">
                  {allImages.slice(1, 3).map((src, i) => (
                    <ImageLightbox
                      key={i}
                      src={src}
                      alt={`${a.title} ${i + 2}`}
                      thumbnailClassName="aspect-[4/3] w-full object-cover border-2 border-punk-yellow/50 cursor-pointer"
                    />
                  ))}
                </div>
              )}
            </div>
          )}
          {/* Descripción */}
          <div>
            <h3 className="font-display text-base tracking-tighter text-punk-yellow">
              {tDetail("description")}
            </h3>
            <p className="mt-3 whitespace-pre-wrap font-body leading-relaxed text-punk-white/80">
              {a.description}
            </p>
          </div>
          {/* Contacto (repetido al final) */}
          <div className="border-t-2 border-punk-yellow/30 pt-6">
            <h3 className="font-display text-base tracking-tighter text-punk-yellow">
              {tDetail("contact")}
            </h3>
            <a
              href={`mailto:${a.contactEmail}`}
              className="mt-2 inline-block font-body text-punk-yellow hover:underline"
            >
              {a.contactEmail}
            </a>
          </div>
        </div>

        {/* Desktop: layout clásico */}
        <article className="mt-10 hidden md:block">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
            <div className="min-w-0 flex-1">
              <h1 className="font-display text-4xl tracking-tighter text-punk-white sm:text-5xl lg:text-6xl">
                {a.title}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="border border-punk-yellow/50 bg-punk-yellow/10 px-3 py-1 font-punch text-xs uppercase tracking-widest text-punk-yellow">
                  {t(`categories.${a.category}`)}
                </span>
                {a.territory && (
                  <span className="font-body text-punk-white/70">{a.territory}</span>
                )}
              </div>
              <p className="mt-2 font-body text-sm text-punk-white/50">
                {tDetail("publishedOn")} {formattedDate}
              </p>
              <a
                href={`mailto:${a.contactEmail}`}
                className="mt-4 inline-block border-2 border-punk-yellow bg-punk-yellow px-6 py-3 font-punch text-xs uppercase tracking-widest text-punk-black transition-all hover:bg-punk-yellow/90"
              >
                {t("contact")}: {a.contactEmail}
              </a>
            </div>
          </div>

          {/* Galería */}
          {mainImg && (
            <div className="mt-12">
              {allImages.length === 1 ? (
                <div className="overflow-hidden border-2 border-punk-yellow/50">
                  <ImageLightbox
                    src={mainImg}
                    alt={a.title}
                    thumbnailClassName="w-full max-h-[500px] object-cover cursor-pointer"
                  />
                </div>
              ) : allImages.length === 2 ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {allImages.map((src, i) => (
                    <div key={i} className="overflow-hidden border-2 border-punk-yellow/50">
                      <ImageLightbox
                        src={src}
                        alt={`${a.title} ${i + 1}`}
                        thumbnailClassName="h-64 w-full object-cover cursor-pointer sm:h-80 transition-opacity hover:opacity-95"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="overflow-hidden border-2 border-punk-yellow/50 sm:col-span-2 sm:row-span-2">
                    <ImageLightbox
                      src={mainImg}
                      alt={a.title}
                      thumbnailClassName="h-64 w-full object-cover cursor-pointer sm:h-full sm:min-h-[400px] transition-opacity hover:opacity-95"
                    />
                  </div>
                  {allImages.slice(1).map((src, i) => (
                    <div key={i} className="overflow-hidden border-2 border-punk-yellow/50">
                      <ImageLightbox
                        src={src}
                        alt={`${a.title} ${i + 2}`}
                        thumbnailClassName="h-48 w-full object-cover cursor-pointer sm:h-48 transition-opacity hover:opacity-95"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Descripción */}
          <div className="mt-12">
            <h2 className="font-display text-2xl tracking-tighter text-punk-white">
              {tDetail("description")}
            </h2>
            <p className="mt-4 whitespace-pre-wrap font-body leading-relaxed text-punk-white/80">
              {a.description}
            </p>
          </div>

          {/* Contacto */}
          <div className="mt-12 border-l-4 border-punk-yellow bg-punk-black/50 p-6">
            <h2 className="font-punch text-xs uppercase tracking-widest text-punk-yellow/80">
              {tDetail("contact")}
            </h2>
            <a
              href={`mailto:${a.contactEmail}`}
              className="mt-2 inline-block font-body text-lg text-punk-yellow hover:underline"
            >
              {a.contactEmail}
            </a>
          </div>
        </article>
      </AnimatedSection>
    </PageLayout>
  );
}
