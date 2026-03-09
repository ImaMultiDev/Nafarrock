"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, X } from "lucide-react";

const inputClass =
  "mt-2 w-full border-2 border-punk-white/20 bg-punk-black px-4 py-3 font-body text-punk-white placeholder:text-punk-white/40 focus:border-punk-green focus:outline-none";
const labelClass = "block font-punch text-xs uppercase tracking-widest text-punk-white/70";

export type EventLinkItem = {
  kind: "instagram" | "facebook" | "twitter" | "web";
  url: string;
  label: string;
};

const KIND_KEYS = ["instagram", "facebook", "twitter", "web"] as const;

type Props = {
  value: EventLinkItem[];
  onChange: (links: EventLinkItem[]) => void;
  namespace?: string;
};

/** Constructor de enlaces para eventos: múltiples URLs con etiqueta (ej: Instagram banda, Instagram sala) */
export function EventLinksBuilder({ value, onChange, namespace = "dashboard.proposals.event.links" }: Props) {
  const t = useTranslations(namespace);
  const addLink = () => {
    onChange([...value, { kind: "instagram", url: "", label: "" }]);
  };

  const updateLink = (index: number, updates: Partial<EventLinkItem>) => {
    const next = [...value];
    next[index] = { ...next[index], ...updates };
    onChange(next);
  };

  const removeLink = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div>
        <label className={labelClass}>{t("label")}</label>
        <p className="mt-1 font-body text-xs text-punk-white/50">
          {t("hint")}
        </p>
      </div>

      {value.map((link, i) => (
        <div
          key={i}
          className="flex flex-wrap gap-3 border-2 border-punk-white/20 p-4 sm:flex-nowrap sm:items-end"
        >
          <div className="w-full sm:w-32">
            <label className={labelClass}>{t("type")}</label>
            <select
              value={link.kind}
              onChange={(e) => updateLink(i, { kind: e.target.value as EventLinkItem["kind"] })}
              className={inputClass}
            >
              {KIND_KEYS.map((k) => (
                <option key={k} value={k}>
                  {t(`kind.${k}`)}
                </option>
              ))}
            </select>
          </div>
          <div className="min-w-0 flex-1">
            <label className={labelClass}>{t("typeLabel")}</label>
            <input
              type="text"
              value={link.label}
              onChange={(e) => updateLink(i, { label: e.target.value })}
              className={inputClass}
              placeholder={t("typePlaceholder")}
            />
          </div>
          <div className="min-w-0 flex-1">
            <label className={labelClass}>{t("url")}</label>
            <input
              type="url"
              value={link.url}
              onChange={(e) => updateLink(i, { url: e.target.value })}
              className={inputClass}
              placeholder={t("urlPlaceholder")}
            />
          </div>
          <button
            type="button"
            onClick={() => removeLink(i)}
            className="shrink-0 p-2 text-punk-white/50 hover:text-punk-red"
            aria-label={t("remove")}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={addLink}
        className="flex items-center gap-2 border-2 border-dashed border-punk-white/30 px-4 py-2 font-punch text-xs uppercase tracking-widest text-punk-white/70 hover:border-punk-green hover:text-punk-green"
      >
        <Plus className="h-4 w-4" />
        {t("add")}
      </button>
    </div>
  );
}
