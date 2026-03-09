"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

export function InboxBanner() {
  const { data: session, status } = useSession();
  const t = useTranslations("dashboard.inbox");
  const [unreadCount, setUnreadCount] = useState<number | null>(null);

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

  if (unreadCount == null || unreadCount === 0) return null;

  return (
    <Link
      href="/dashboard/buzon"
      className="block w-full border-b border-punk-yellow/40 bg-punk-yellow/10 px-3 py-2.5 text-center font-body text-sm text-punk-white/90 transition-colors hover:bg-punk-yellow/20 sm:px-6 lg:px-12"
    >
      <span className="font-semibold text-punk-yellow">
        {unreadCount === 1 ? t("banner", { count: unreadCount }) : t("bannerPlural", { count: unreadCount })}
      </span>
      {" · "}
      <span className="underline">{t("viewInbox")}</span>
    </Link>
  );
}
