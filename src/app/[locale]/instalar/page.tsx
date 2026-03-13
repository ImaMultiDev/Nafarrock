import { getTranslations } from "next-intl/server";
import { PageLayout } from "@/components/ui/PageLayout";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { Link } from "@/i18n/navigation";
import { InstallPromptButton } from "@/components/install/InstallPromptButton";

export async function generateMetadata() {
  const t = await getTranslations("install.metadata");
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function InstalarPage() {
  const t = await getTranslations("install");
  const tActions = await getTranslations("common.actions");

  return (
    <PageLayout>
      <div className="mx-auto max-w-2xl">
        <AnimatedSection>
          <h1 className="font-display text-5xl tracking-tighter text-punk-white sm:text-6xl">
            {t("title")}
          </h1>
          <p className="mt-3 font-punch text-xs uppercase tracking-widest text-punk-red">
            {t("subtitle")}
          </p>
          <p className="mt-6 font-body text-punk-white/90">
            {t("description")}
          </p>
          <div className="mt-8 flex justify-center">
            <InstallPromptButton />
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.1}>
          <div className="mt-10 space-y-8">
            <section className="rounded-xl border-2 border-punk-green/40 bg-punk-green/5 p-6">
              <h2 className="font-display text-xl tracking-tighter text-punk-green">
                {t("android.title")}
              </h2>
              <p className="mt-3 font-body text-punk-white/90">
                {t("android.steps")}
              </p>
            </section>

            <section className="rounded-xl border-2 border-punk-pink/40 bg-punk-pink/5 p-6">
              <h2 className="font-display text-xl tracking-tighter text-punk-pink">
                {t("ios.title")}
              </h2>
              <p className="mt-3 font-body text-punk-white/90">
                {t("ios.steps")}
              </p>
            </section>

            <section className="rounded-xl border-2 border-punk-yellow/40 bg-punk-yellow/5 p-6">
              <h2 className="font-display text-xl tracking-tighter text-punk-yellow">
                {t("desktop.title")}
              </h2>
              <p className="mt-3 font-body text-punk-white/90">
                {t("desktop.steps")}
              </p>
            </section>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.15}>
          <div className="mt-12 text-center">
            <Link
              href="/"
              className="inline-block border-2 border-punk-red px-6 py-3 font-punch text-sm uppercase tracking-widest text-punk-red transition-colors hover:bg-punk-red hover:text-punk-white"
            >
              ← {tActions("back")}
            </Link>
          </div>
        </AnimatedSection>
      </div>
    </PageLayout>
  );
}
