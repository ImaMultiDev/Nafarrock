"use client";

import { useTranslations } from "next-intl";

const MAIL_SVG_FILTER =
  "brightness(0) saturate(100%) invert(84%) sepia(53%) saturate(2476%) hue-rotate(359deg)";

function MailIcon() {
  return (
    <div className="animate-loading-punk-float shrink-0" aria-hidden>
      <img
        src="/svg/mail-svgrepo-com.svg"
        alt=""
        width={56}
        height={56}
        className="h-14 w-14 object-contain"
        style={{ filter: MAIL_SVG_FILTER }}
      />
    </div>
  );
}

export function BuzonHeader() {
  const t = useTranslations("dashboard.inbox");
  return (
    <div className="mb-8">
      {/* Mobile: solo mail SVG centrado */}
      <div className="flex justify-center lg:hidden">
        <MailIcon />
      </div>
      {/* Desktop: título + descripción + mail SVG a la derecha */}
      <div className="hidden items-center justify-between gap-4 lg:flex">
        <div>
          <h1 className="font-display text-4xl tracking-tighter text-punk-white sm:text-5xl">
            {t("title")}
          </h1>
          <p className="mt-2 font-body text-punk-white/60">
            {t("subtitle")}
          </p>
        </div>
        <MailIcon />
      </div>
    </div>
  );
}
