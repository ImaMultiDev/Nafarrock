"use client";

import { useState } from "react";

type Props = {
  sourceText: string;
  onTranslated: (text: string) => void;
  disabled?: boolean;
};

export function TranslateButton({ sourceText, onTranslated, disabled }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    const text = sourceText.trim();
    if (!text) return;

    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message ?? "Error al traducir");
        return;
      }

      if (data.translated) {
        onTranslated(data.translated);
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = disabled || loading || !sourceText.trim();

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={isDisabled}
        className="border-2 border-punk-white/30 px-3 py-1.5 font-punch text-xs uppercase tracking-widest text-punk-white/70 transition-colors hover:border-punk-green hover:text-punk-green disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Generando…" : "Generar traducción en Euskera"}
      </button>
      {error && (
        <p className="font-body text-xs text-punk-red">{error}</p>
      )}
    </div>
  );
}
