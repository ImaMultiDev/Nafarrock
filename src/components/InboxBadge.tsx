"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";

type Variant = "desktop-icon" | "mobile-list";

type Props = {
  variant: Variant;
  onNavigate?: () => void;
};

export function InboxBadge({ variant, onNavigate }: Props) {
  const { data: session, status } = useSession();
  const t = useTranslations("common.nav");
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const isBuzonActive =
    pathname === "/dashboard/buzon" || pathname.startsWith("/dashboard/buzon/");

  useEffect(() => {
    if (status !== "authenticated" || !session?.user) {
      setUnreadCount(0);
      return;
    }
    fetch("/api/dashboard/inbox/unread-count")
      .then((res) => res.json())
      .then((data) => setUnreadCount(data.count ?? 0))
      .catch(() => setUnreadCount(0));
  }, [session, status]);

  if (status !== "authenticated" || !session?.user) return null;

  const showBadge = unreadCount > 0;

  if (variant === "desktop-icon") {
    return (
      <Link
        href="/dashboard/buzon"
        onClick={onNavigate}
        className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-punk-white/30 text-punk-white/80 transition-colors hover:border-punk-yellow hover:text-punk-yellow"
        aria-label={t("inbox")}
      >
        <img
          src={showBadge ? "/svg/mail-svgrepo-com.svg" : "/svg/email-open-sketched-envelope-svgrepo-com.svg"}
          alt=""
          width={18}
          height={18}
          className="h-[18px] w-[18px] object-contain opacity-80"
          style={{ filter: "brightness(0) invert(1)" }}
        />
        {showBadge && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-punk-red px-1 text-[10px] font-bold text-punk-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </Link>
    );
  }

  // mobile-list: mismo estilo que accesos normales (texto blanco/rojo, activo con borde)
  return (
    <Link
      href="/dashboard/buzon"
      onClick={onNavigate}
      className={`relative mt-2 flex w-full items-center gap-2 rounded px-4 py-3 font-punch text-sm uppercase tracking-widest transition-colors hover:bg-punk-white/10 hover:text-punk-green ${
        isBuzonActive
          ? "nav-link-active border-l-4 border-punk-red bg-punk-red/10 text-punk-red"
          : "border-l-4 border-transparent text-punk-white/90"
      }`}
    >
      <img
        src={showBadge ? "/svg/mail-svgrepo-com.svg" : "/svg/email-open-sketched-envelope-svgrepo-com.svg"}
        alt=""
        width={20}
        height={20}
        className="h-5 w-5 shrink-0 object-contain"
        style={{
          filter: isBuzonActive
            ? "brightness(0) saturate(100%) invert(36%) sepia(100%) saturate(5000%) hue-rotate(310deg)"
            : "brightness(0) invert(1)",
        }}
      />
      <span className="flex-1 text-center">{t("inbox")}</span>
      <span className="h-5 w-5 shrink-0" aria-hidden />
      {showBadge && (
        <span className="absolute right-4 top-1/2 flex h-5 min-w-5 -translate-y-1/2 items-center justify-center rounded-full bg-punk-red px-1.5 text-xs font-bold text-punk-white">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </Link>
  );
}
