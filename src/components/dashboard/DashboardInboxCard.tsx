"use client";

import { useEffect, useState } from "react";
import { DashboardCard } from "./DashboardCard";

type Props = {
  title: string;
  description: string;
  accent: string;
  accessLabel: string;
};

export function DashboardInboxCard({
  title,
  description,
  accent,
  accessLabel,
}: Props) {
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    fetch("/api/dashboard/inbox/unread-count")
      .then((res) => res.json())
      .then((data) => setUnreadCount(data.count ?? 0))
      .catch(() => setUnreadCount(0));
  }, []);

  const svgSrc =
    unreadCount > 0
      ? "/svg/mail-svgrepo-com.svg"
      : "/svg/email-open-sketched-envelope-svgrepo-com.svg";

  return (
    <DashboardCard
      href="/dashboard/buzon"
      svgSrc={svgSrc}
      title={title}
      description={description}
      accent={accent}
      accessLabel={accessLabel}
      accentColor="yellow"
    />
  );
}
