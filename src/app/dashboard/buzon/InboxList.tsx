"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { CheckCircle2, XCircle } from "lucide-react";

type InboxMessage = {
  id: string;
  kind: string;
  entityType: string;
  entityId: string;
  title: string;
  body: string | null;
  readAt: Date | null;
  createdAt: Date;
};

export function InboxList({ messages }: { messages: InboxMessage[] }) {
  const router = useRouter();
  const t = useTranslations("dashboard.inbox");
  const [markingAll, setMarkingAll] = useState(false);

  const unreadCount = messages.filter((m) => !m.readAt).length;

  const markAsRead = async (id: string) => {
    await fetch(`/api/dashboard/inbox/${id}/read`, { method: "POST" });
    router.refresh();
  };

  const markAllAsRead = async () => {
    if (unreadCount === 0) return;
    setMarkingAll(true);
    try {
      await fetch("/api/dashboard/inbox/read-all", { method: "POST" });
      router.refresh();
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <div className="space-y-4">
      {unreadCount > 0 && (
        <button
          type="button"
          onClick={markAllAsRead}
          disabled={markingAll}
          className="border-2 border-punk-green/50 px-4 py-2 font-punch text-xs uppercase tracking-widest text-punk-green hover:bg-punk-green/10 disabled:opacity-50"
        >
          {markingAll ? "…" : (unreadCount === 1 ? t("markAllRead", { count: unreadCount }) : t("markAllReadPlural", { count: unreadCount }))}
        </button>
      )}

      <div className="space-y-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            onClick={() => !msg.readAt && markAsRead(msg.id)}
            className={`cursor-pointer rounded-xl border-2 p-4 transition-colors ${
              msg.readAt
                ? "border-punk-white/10 bg-punk-black/40 opacity-75"
                : "border-punk-yellow/30 bg-punk-yellow/5 hover:border-punk-yellow/50"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="shrink-0 pt-0.5">
                {msg.kind === "PROPOSAL_APPROVED" ? (
                  <CheckCircle2 size={24} className="text-punk-green" />
                ) : (
                  <XCircle size={24} className="text-punk-red" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-display font-semibold text-punk-white">
                  {msg.title}
                </p>
                <p className="mt-1 font-body text-sm text-punk-white/60">
                  {new Date(msg.createdAt).toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                {msg.body && (
                  <p className="mt-2 font-body text-sm text-punk-white/80">
                    {msg.body}
                  </p>
                )}
              </div>
              {!msg.readAt && (
                <span className="shrink-0 rounded bg-punk-yellow/20 px-2 py-0.5 font-punch text-xs uppercase tracking-widest text-punk-yellow">
                  {t("new")}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
