"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown, X } from "lucide-react";

export type CartelItem =
  | { type: "band"; bandId: string; name: string }
  | { type: "external"; name: string };

const inputClass =
  "mt-2 w-full border-2 border-punk-white/20 bg-punk-black px-4 py-3 font-body text-punk-white placeholder:text-punk-white/40 focus:border-punk-green focus:outline-none";
const labelClass = "block font-punch text-xs uppercase tracking-widest text-punk-white/70";

type Props = {
  bands: { id: string; name: string }[];
  value: CartelItem[];
  onChange: (items: CartelItem[]) => void;
};

export function CartelBuilder({ bands, value, onChange }: Props) {
  const [externalInput, setExternalInput] = useState("");

  const addBand = (bandId: string) => {
    const band = bands.find((b) => b.id === bandId);
    if (!band || value.some((i) => i.type === "band" && i.bandId === bandId)) return;
    onChange([...value, { type: "band", bandId, name: band.name }]);
  };

  const addExternal = () => {
    const name = externalInput.trim();
    if (!name) return;
    onChange([...value, { type: "external", name }]);
    setExternalInput("");
  };

  const remove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const move = (index: number, dir: -1 | 1) => {
    const newIndex = index + dir;
    if (newIndex < 0 || newIndex >= value.length) return;
    const next = [...value];
    [next[index], next[newIndex]] = [next[newIndex], next[index]];
    onChange(next);
  };

  const usedBandIds = new Set(value.filter((i): i is CartelItem & { bandId: string } => i.type === "band").map((i) => i.bandId));
  const availableBands = bands.filter((b) => !usedBandIds.has(b.id));

  return (
    <div className="space-y-4">
      <div>
        <label className={labelClass}>Cartel (orden manual)</label>
        <p className="mt-1 font-body text-xs text-punk-white/50">
          Añade bandas registradas o externas. El orden se respeta en la visualización.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <select
          value=""
          onChange={(e) => {
            const v = e.target.value;
            if (v) addBand(v);
            e.target.value = "";
          }}
          className={`${inputClass} max-w-[220px]`}
        >
          <option value="">+ Banda registrada</option>
          {availableBands.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
          {availableBands.length === 0 && (
            <option value="" disabled>
              Todas añadidas / Sin bandas
            </option>
          )}
        </select>
        <div className="flex gap-2 flex-1 min-w-[200px]">
          <input
            type="text"
            value={externalInput}
            onChange={(e) => setExternalInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addExternal())}
            placeholder="Banda externa (ej: Extremoduro)"
            className={inputClass}
          />
          <button
            type="button"
            onClick={addExternal}
            disabled={!externalInput.trim()}
            className="shrink-0 border-2 border-punk-white/30 px-4 py-2 font-punch text-xs uppercase tracking-widest text-punk-white/70 hover:border-punk-green hover:text-punk-green disabled:opacity-50"
          >
            + Añadir
          </button>
        </div>
      </div>

      {value.length > 0 && (
        <ul className="space-y-2 border-2 border-punk-white/20 p-4">
          {value.map((item, i) => (
            <li
              key={i}
              className="flex items-center gap-2 py-2 border-b border-punk-white/10 last:border-0"
            >
              <div className="flex flex-col gap-0.5">
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  className="p-1 text-punk-white/60 hover:text-punk-green disabled:opacity-30"
                  aria-label="Subir"
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  disabled={i === value.length - 1}
                  className="p-1 text-punk-white/60 hover:text-punk-green disabled:opacity-30"
                  aria-label="Bajar"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
              <span
                className={`flex-1 font-body ${
                  item.type === "band" ? "text-punk-green" : "text-punk-white"
                }`}
              >
                {item.type === "band" ? item.name : item.name}
                {item.type === "band" && (
                  <span className="ml-2 font-punch text-xs text-punk-white/60">● Banda local</span>
                )}
              </span>
              <button
                type="button"
                onClick={() => remove(i)}
                className="p-1 text-punk-white/50 hover:text-punk-red"
                aria-label="Quitar"
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

