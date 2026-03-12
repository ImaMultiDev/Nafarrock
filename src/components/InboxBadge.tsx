"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useTranslations } from "next-intl";

type Variant = "desktop-icon" | "mobile-list";

type Props = {
  variant: Variant;
  onNavigate?: () => void;
};

export function InboxBadge({ variant, onNavigate }: Props) {
  const { data: session, status } = useSession();
  const t = useTranslations("common.nav");
  const [unreadCount, setUnreadCount] = useState<number>(0);

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

  // mobile-list: icono + texto centrados bajo PANEL, verde neón, badge a la derecha
  return (
    <Link
      href="/dashboard/buzon"
      onClick={onNavigate}
      className="relative mt-2 flex w-full items-center gap-2 rounded px-4 py-3 font-punch text-sm uppercase tracking-widest text-punk-green transition-colors hover:bg-punk-white/10 hover:text-punk-green"
    >
      <img
        src={showBadge ? "/svg/mail-svgrepo-com.svg" : "/svg/email-open-sketched-envelope-svgrepo-com.svg"}
        alt=""
        width={20}
        height={20}
        className="h-5 w-5 shrink-0 object-contain"
        style={{ filter: "brightness(0) saturate(100%) invert(72%) sepia(98%) saturate(1000%) hue-rotate(136deg)" }}
      />
      <span className="flex-1 text-center">{t("inbox")}</span>
      {showBadge && (
        <span className="absolute right-4 top-1/2 flex h-5 min-w-5 -translate-y-1/2 items-center justify-center rounded-full bg-punk-red px-1.5 text-xs font-bold text-punk-white">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </Link>
  );
}
