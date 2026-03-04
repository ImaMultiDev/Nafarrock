"use client";

import { useState } from "react";
import Link from "next/link";
import { PageLayout } from "@/components/ui/PageLayout";
import { isValidEmail } from "@/lib/validation";

const inputClass =
  "mt-2 w-full border-2 border-punk-white/20 bg-punk-black px-4 py-3 font-body text-punk-white placeholder:text-punk-white/40 focus:border-punk-green focus:outline-none";
const labelClass = "block font-punch text-xs uppercase tracking-widest text-punk-white/70";

export default function RecuperarPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!isValidEmail(email.trim())) {
      setError("Introduce un email válido");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? "Error al enviar");
        return;
      }
      setSent(true);
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout>
      <div className="mx-auto max-w-md">
        <Link
          href="/auth/login"
          className="font-punch text-xs uppercase tracking-widest text-punk-green hover:text-punk-green/80"
        >
          ← Volver a Entrar
        </Link>
        <h1 className="mt-6 font-display text-5xl tracking-tighter text-punk-white sm:text-6xl">
          RECUPERAR CONTRASEÑA
        </h1>
        <p className="mt-3 font-body text-punk-white/60">
          Introduce el email de tu cuenta y te enviaremos un enlace para restablecer tu contraseña.
        </p>

        {sent ? (
          <div className="mt-10 border-2 border-punk-green bg-punk-green/10 p-6">
            <p className="font-body text-punk-green">
              Si existe una cuenta con ese email, recibirás un enlace para restablecer tu contraseña.
              Revisa tu bandeja de entrada y spam.
            </p>
            <Link
              href="/auth/login"
              className="mt-4 inline-block font-punch text-xs uppercase tracking-widest text-punk-green hover:underline"
            >
              Volver a Entrar →
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-10 space-y-6">
            {error && (
              <div className="border-2 border-punk-red bg-punk-red/10 p-4">
                <p className="font-body text-punk-red">{error}</p>
              </div>
            )}
            <div>
              <label htmlFor="email" className={labelClass}>
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="tu@email.com"
                className={inputClass}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full border-2 border-punk-green bg-punk-green px-8 py-4 font-punch text-sm uppercase tracking-widest text-punk-black transition-all hover:bg-punk-green/90 disabled:opacity-50"
            >
              {loading ? "Enviando…" : "Enviar enlace"}
            </button>
          </form>
        )}
      </div>
    </PageLayout>
  );
}
