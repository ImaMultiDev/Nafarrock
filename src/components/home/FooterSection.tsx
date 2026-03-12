"use client";

import Image from "next/image";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { ESCENA_HIDDEN } from "@/lib/feature-flags";
import { SocialLinks } from "@/components/ui/SocialLinks";
import type { SocialLinkItem } from "@/components/ui/SocialLinks";

export function FooterSection() {
  const { data: session } = useSession();
  const locale = useLocale();
  const t = useTranslations("home.footer");
  const tNav = useTranslations("common.nav");

  const footerSocialLinks: SocialLinkItem[] = [
    { kind: "instagram", url: "https://instagram.com/nafarrock", label: "Instagram" },
    { kind: "facebook", url: "https://facebook.com/nafarrock", label: "Facebook" },
    { kind: "email", url: locale === "eu" ? "/eu/contacto" : "/contacto", label: "Contacto (harremanak@nafarrock.com)" },
  ];

  return (
    <footer className="relative overflow-hidden border-t-2 border-punk-green bg-punk-black py-4 px-4 text-center max-[299px]:px-3 md:py-10 md:px-12 md:text-left lg:py-14 lg:px-20">
      {/* Mobile: solo copyright */}
      <div className="md:hidden">
        <p className="font-body text-xs text-punk-white/40">
          {t("copyright", { year: new Date().getFullYear() })}
        </p>
      </div>

      {/* Desktop: footer completo */}
      <div className="relative z-10 mx-auto max-w-7xl 2xl:max-w-content-wide hidden md:block">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,200,83,0.03)_0%,transparent_70%)]" />
        <div className="relative z-10">
          <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col items-center md:items-start"
            >
              <Link
                href="/"
                className="flex items-center gap-4 transition-opacity hover:opacity-90"
              >
                <Image
                  src="/logo.png"
                  alt="Nafarrock"
                  width={64}
                  height={64}
                  className="h-14 w-auto sm:h-16"
                />
                <span className="font-display text-4xl tracking-tighter text-punk-red">
                  NAFAR<span className="text-punk-green">ROCK</span>
                </span>
              </Link>
              <p className="mt-2 font-body text-sm text-punk-white/60">
                {t("platform")}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="flex flex-wrap justify-center gap-x-6 gap-y-2"
            >
              <Link
                href="/bandas"
                className="font-punch text-xs uppercase tracking-widest text-punk-white/70 transition-colors hover:text-punk-green"
              >
                {tNav("bands")}
              </Link>
              <Link
                href="/eventos"
                className="font-punch text-xs uppercase tracking-widest text-punk-white/70 transition-colors hover:text-punk-green"
              >
                {tNav("events")}
              </Link>
              {!ESCENA_HIDDEN && (
                <Link
                  href="/escena"
                  className="font-punch text-xs uppercase tracking-widest text-punk-white/70 transition-colors hover:text-punk-green"
                >
                  {tNav("scene")}
                </Link>
              )}
              <Link
                href="/guia"
                className="font-punch text-xs uppercase tracking-widest text-punk-white/70 transition-colors hover:text-punk-green"
              >
                {tNav("guide")}
              </Link>
              {session && (
                <Link
                  href="/contacto"
                  className="font-punch text-xs uppercase tracking-widest text-punk-white/70 transition-colors hover:text-punk-green"
                >
                  {tNav("contact")}
                </Link>
              )}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="mt-8 flex justify-center lg:mt-10"
          >
            <SocialLinks
              links={footerSocialLinks}
              variant="green"
              showLabels={false}
              className="justify-center"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-12 border-t border-punk-white/10 pt-8 text-center"
          >
            <p className="font-body text-xs text-punk-white/40">
              {t("copyright", { year: new Date().getFullYear() })}
            </p>
          </motion.div>
        </div>
      </div>
    </footer>
  );
}
