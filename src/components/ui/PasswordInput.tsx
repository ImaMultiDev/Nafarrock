"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import {
  getPasswordStrength,
  getPasswordStrengthLabel,
  getPasswordStrengthColor,
  getPasswordRequirements,
} from "@/lib/validation";

type PasswordInputProps = {
  id: string;
  name: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  className?: string;
  labelClass?: string;
  showStrength?: boolean;
  autoComplete?: string;
};

export function PasswordInput({
  id,
  name,
  value = "",
  onChange,
  label,
  placeholder,
  required = true,
  minLength = 8,
  className = "",
  labelClass = "block font-punch text-xs uppercase tracking-widest text-punk-white/70",
  showStrength = false,
  autoComplete,
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  const strength = showStrength ? getPasswordStrength(value) : null;
  const requirements = showStrength ? getPasswordRequirements(value) : null;

  return (
    <div className={className}>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <div className="relative mt-2">
        <input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          minLength={minLength}
          autoComplete={autoComplete}
          className="w-full border-2 border-punk-white/20 bg-punk-black pr-12 px-4 py-3 font-body text-punk-white placeholder:text-punk-white/40 focus:border-punk-green focus:outline-none"
        />
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-punk-white/50 hover:text-punk-green transition-colors"
          aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
          tabIndex={-1}
        >
          {visible ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
      {showStrength && value && (
        <div className="mt-2 space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-1.5 flex-1 rounded-full bg-punk-white/20 overflow-hidden">
              <div
                className={`h-full transition-all ${getPasswordStrengthColor(strength!)}`}
                style={{
                  width: {
                    weak: "25%",
                    fair: "50%",
                    good: "75%",
                    strong: "100%",
                  }[strength!],
                }}
              />
            </div>
            <span className="font-body text-xs text-punk-white/60">
              {getPasswordStrengthLabel(strength!)}
            </span>
          </div>
          <ul className="font-body text-xs text-punk-white/50 space-y-0.5">
            {requirements!.map((r, i) => (
              <li key={i} className={r.met ? "text-punk-green/80" : ""}>
                {r.met ? "✓" : "○"} {r.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
