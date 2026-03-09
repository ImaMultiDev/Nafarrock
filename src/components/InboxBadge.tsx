"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Inbox } from "lucide-react";
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
        <Inbox size={18} />
        {showBadge && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-punk-red px-1 text-[10px] font-bold text-punk-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </Link>
    );
  }

  // mobile-list: icono + texto centrados bajo PANELA, verde neón, badge a la derecha
  return (
    <Link
      href="/dashboard/buzon"
      onClick={onNavigate}
      className="relative mt-2 flex w-full items-center justify-center gap-2 rounded px-4 py-3 font-punch text-sm uppercase tracking-widest text-punk-green transition-colors hover:bg-punk-white/10 hover:text-punk-green"
    >
      <Inbox size={18} className="shrink-0" />
      <span>{t("inbox")}</span>
      {showBadge && (
        <span className="absolute right-4 top-1/2 flex h-5 min-w-5 -translate-y-1/2 items-center justify-center rounded-full bg-punk-red px-1.5 text-xs font-bold text-punk-white">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </Link>
  );
}
