"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { Search, X } from "lucide-react";

const DEBOUNCE_MS = 400;

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  "aria-label": string;
  id?: string;
  /** punk-red | punk-green | punk-pink - color del borde en focus */
  accent?: "punk-red" | "punk-green" | "punk-pink";
  /** Compacto: menos padding, icono más pequeño */
  compact?: boolean;
  /** Borde verde para paneles móviles (bottom bar) */
  variant?: "default" | "green";
};

/**
 * Buscador optimizado: debounce automático, botón clear, no requiere submit.
 * Mejora UX: el usuario escribe y los resultados se actualizan al dejar de escribir.
 */
export function SearchInput({
  value,
  onChange,
  placeholder,
  "aria-label": ariaLabel,
  id,
  accent = "punk-red",
  compact = false,
  variant = "default",
}: Props) {
  const [localValue, setLocalValue] = useState(value);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const triggerSearch = useCallback(
    (v: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onChange(v.trim());
        debounceRef.current = null;
      }, DEBOUNCE_MS);
    },
    [onChange],
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setLocalValue(v);
    triggerSearch(v);
  };

  const handleClear = () => {
    setLocalValue("");
    onChange("");
  };

  const focusBorder =
    accent === "punk-green"
      ? "focus:border-punk-green"
      : accent === "punk-pink"
        ? "focus:border-punk-pink"
        : "focus:border-punk-red";
  const borderColor = variant === "green" ? "border-punk-green" : "border-punk-white/20";

  return (
    <div className="search-input-wrapper relative flex min-w-0 flex-1">
      <Search
        className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-punk-white/40 ${
          compact ? "h-4 w-4" : "h-4 w-4 sm:h-5 sm:w-5"
        }`}
        aria-hidden
      />
      <input
        id={id}
        type="search"
        value={localValue}
        onChange={handleChange}
        placeholder={placeholder}
        aria-label={ariaLabel}
        autoComplete="off"
        className={`w-full rounded-lg border-2 ${borderColor} bg-punk-black font-body text-punk-white placeholder:text-punk-white/40 focus:outline-none ${focusBorder} ${
          compact
            ? "min-h-[40px] pl-9 py-2 text-sm pr-9"
            : "min-h-[44px] pl-10 pr-10 py-2.5 sm:pl-11"
        }`}
      />
      {localValue && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Borrar búsqueda"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-punk-white/60 transition-colors hover:bg-punk-white/10 hover:text-punk-white sm:right-3"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
