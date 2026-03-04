"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useTransition } from "react";

const LOCALE_COOKIE = "NEXT_LOCALE";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 año

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const setLocale = (newLocale: "es" | "eu") => {
    document.cookie = `${LOCALE_COOKIE}=${newLocale};path=/;max-age=${COOKIE_MAX_AGE};SameSite=Lax`;
    startTransition(() => {
      // Admin y dashboard no tienen versión localizada: ir a inicio
      const isAdminOrDashboard =
        pathname.startsWith("/admin") || pathname.startsWith("/dashboard");
      const targetPath = isAdminOrDashboard ? "/" : pathname;
      router.replace(targetPath, { locale: newLocale });
    });
  };

  return (
    <div className="flex items-center gap-1 border-l border-punk-white/20 pl-3">
      <button
        type="button"
        onClick={() => setLocale("es")}
        disabled={isPending}
        className={`font-punch text-xs uppercase tracking-widest transition-colors hover:text-punk-green disabled:opacity-50 ${
          locale === "es" ? "text-punk-green" : "text-punk-white/60"
        }`}
        aria-label="Cambiar a castellano"
      >
        ES
      </button>
      <span className="text-punk-white/30">|</span>
      <button
        type="button"
        onClick={() => setLocale("eu")}
        disabled={isPending}
        className={`font-punch text-xs uppercase tracking-widest transition-colors hover:text-punk-green disabled:opacity-50 ${
          locale === "eu" ? "text-punk-green" : "text-punk-white/60"
        }`}
        aria-label="Euskara-ra aldatu"
      >
        EU
      </button>
    </div>
  );
}
