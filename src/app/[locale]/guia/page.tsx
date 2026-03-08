import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { PageLayout } from "@/components/ui/PageLayout";
import { AnimatedSection } from "@/components/ui/AnimatedSection";

export async function generateMetadata() {
  const t = await getTranslations("guide.metadata");
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function NafarrockPage() {
  const t = await getTranslations("guide");
  const tNav = await getTranslations("common.nav");

  return (
    <PageLayout>
      <div className="mx-auto max-w-3xl">
        <AnimatedSection>
          <h1 className="font-display text-5xl tracking-tighter text-punk-white sm:text-6xl">
            {t("title")}
          </h1>
          <p className="mt-3 font-punch text-xs uppercase tracking-widest text-punk-red">
            {t("subtitle")}
          </p>
        </AnimatedSection>

        <AnimatedSection delay={0.1}>
        <article className="mt-10 space-y-10 font-body leading-relaxed">
          <section>
            <h2 className="font-display text-2xl tracking-tighter text-punk-white">
              {t("why.title")}
            </h2>
            <p className="mt-3 text-punk-white/90">
              {t("why.p1")}
            </p>
            <p className="mt-4 text-punk-white/90">
              {t("why.p2")}
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl tracking-tighter text-punk-white">
              {t("future.title")}
            </h2>
            <p className="mt-3 text-punk-white/90">
              {t("future.p1")}
            </p>
            <p className="mt-4 text-punk-white/90">
              {t("future.p2")}
            </p>
            <p className="mt-4 text-punk-white/90">
              {t("future.p3")}
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl tracking-tighter text-punk-white">
              {t("start.title")}
            </h2>
            <p className="mt-3 text-punk-white/90">
              {t("start.eventsIntro")}{" "}
              <Link href="/eventos" className="text-punk-red hover:underline">
                {tNav("events")}
              </Link>{" "}
              {t("start.eventsOutro")}{" "}
              {t("start.bandsIntro")}{" "}
              <Link href="/bandas" className="text-punk-green hover:underline">
                {tNav("bands")}
              </Link>{" "}
              {t("start.bandsOutro")}
            </p>
          </section>

          <div className="mt-12 border-t-2 border-punk-white/10 pt-8">
            <p className="font-punch text-xs uppercase tracking-widest text-punk-white/60">
              {t("footer")}
            </p>
          </div>
        </article>
        </AnimatedSection>

        <AnimatedSection delay={0.2}>
        <div className="mt-16 flex justify-center">
          <Image
            src="/logo.png"
            alt="Nafarrock"
            width={400}
            height={400}
            className="w-64 sm:w-80 md:w-96"
          />
        </div>
        </AnimatedSection>
      </div>
    </PageLayout>
  );
}
