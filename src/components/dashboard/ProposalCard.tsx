"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";

type ProposalType = "band" | "event" | "announcement";

const SVG_BY_TYPE: Record<ProposalType, string> = {
  band: "/svg/group-549-svgrepo-com.svg",
  event: "/svg/halloween-october-31-calendar-page-sketch-svgrepo-com.svg",
  announcement: "/svg/trumpet-svgrepo-com.svg",
};

type Props = {
  href: string;
  type: ProposalType;
  title: string;
  description: string;
  accent: string;
};

export function ProposalCard({ href, type, title, description, accent }: Props) {
  const svgSrc = SVG_BY_TYPE[type];
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
        className={`group flex flex-col rounded-xl border-2 bg-gradient-to-br p-4 transition-all duration-200 md:p-6 ${accent}`}
      >
        <div className="flex flex-1 flex-row items-start gap-4 md:flex-col md:gap-0">
          <span className="relative flex h-10 w-10 shrink-0 md:mt-0">
            <img
              src={svgSrc}
              alt=""
              width={40}
              height={40}
              className="h-10 w-10 object-contain opacity-80"
              style={{ filter: "brightness(0) invert(1)" }}
            />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-base font-semibold text-punk-white md:mt-4 md:text-lg">
              {title}
            </h2>
            <p className="mt-1 text-sm text-punk-white/60 md:mt-2 md:flex-1">
              {description}
            </p>
          </div>
        </div>
        <span className="mt-3 inline-flex items-center gap-2 font-punch text-xs uppercase tracking-widest text-punk-white opacity-0 transition-opacity group-hover:opacity-100 md:mt-4">
          Proponer <ArrowRight size={14} />
        </span>
      </a>
    </>
  );
}
