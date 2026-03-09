"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Music2, Calendar, ClipboardList } from "lucide-react";

type ProposalType = "band" | "event" | "announcement";

const ICONS = {
  band: Music2,
  event: Calendar,
  announcement: ClipboardList,
} as const;

type Props = {
  href: string;
  type: ProposalType;
  title: string;
  description: string;
  accent: string;
};

export function ProposalCard({ href, type, title, description, accent }: Props) {
  const Icon = ICONS[type];
  const router = useRouter();
  const tCommon = useTranslations("common");
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [limitMessage, setLimitMessage] = useState<string | null>(null);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/dashboard/can-propose?type=${type}`);
    const data = await res.json();
    if (data.ok) {
      router.push(href);
    } else {
      setLimitMessage(data.message ?? tCommon("proposalLimitExceeded"));
      setShowLimitModal(true);
    }
  };

  return (
    <>
      {showLimitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-punk-black/80 p-4">
          <div className="max-w-md rounded-xl border-2 border-punk-red bg-punk-black p-8 shadow-[0_0_40px_rgba(230,0,38,0.2)]">
            <p className="font-body text-punk-white/90">
              {limitMessage ?? tCommon("proposalLimitExceeded")}
            </p>
            <button
              type="button"
              onClick={() => setShowLimitModal(false)}
              className="mt-6 w-full border-2 border-punk-red bg-punk-red px-6 py-3 font-punch text-sm uppercase tracking-widest text-punk-white transition-colors hover:bg-punk-red/90"
            >
              {tCommon("modalClose")}
            </button>
          </div>
        </div>
      )}
      <a
        href={href}
        onClick={handleClick}
        className={`group flex flex-col rounded-xl border-2 bg-gradient-to-br p-6 transition-all duration-200 ${accent}`}
      >
        <Icon size={28} className="text-punk-white/80" />
        <h2 className="mt-4 font-display text-lg font-semibold text-punk-white">
          {title}
        </h2>
        <p className="mt-2 flex-1 text-sm text-punk-white/60">
          {description}
        </p>
        <span className="mt-4 inline-flex items-center gap-2 font-punch text-xs uppercase tracking-widest text-punk-white opacity-0 transition-opacity group-hover:opacity-100">
          Proponer <span className="inline-block">→</span>
        </span>
      </a>
    </>
  );
}
