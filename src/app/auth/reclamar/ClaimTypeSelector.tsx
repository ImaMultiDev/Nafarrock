"use client";

import { useRouter, useSearchParams } from "next/navigation";

const TYPES = [
  { value: "BAND" as const, label: "BANDA" },
  { value: "FESTIVAL" as const, label: "FESTIVAL" },
  { value: "VENUE" as const, label: "SALA/RECINTO" },
];

export function ClaimTypeSelector({
  selectedType,
}: {
  selectedType?: "BAND" | "VENUE" | "FESTIVAL";
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSelect = (value: "BAND" | "VENUE" | "FESTIVAL") => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("type", value);
    router.push(`/auth/reclamar?${params.toString()}`);
  };

  return (
    <div className="mt-8">
      <p className="mb-3 font-punch text-xs uppercase tracking-widest text-punk-white/70">
        Tipo de perfil
      </p>
      <div className="flex flex-wrap gap-3">
        {TYPES.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => handleSelect(t.value)}
            className={`border-2 px-6 py-3 font-punch text-sm uppercase tracking-widest transition-colors ${
              selectedType === t.value
                ? "border-punk-green bg-punk-green/20 text-punk-green"
                : "border-punk-white/30 text-punk-white/80 hover:border-punk-green hover:text-punk-green"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
