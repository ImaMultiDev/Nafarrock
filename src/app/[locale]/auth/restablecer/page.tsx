"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { PageLayout } from "@/components/ui/PageLayout";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { isPasswordValid } from "@/lib/validation";

const labelClass = "block font-punch text-xs uppercase tracking-widest text-punk-white/70";

function RestablecerForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!token) {
      setError("Falta el token. Usa el enlace que recibiste por email.");
      return;
    }
    if (!isPasswordValid(password)) {
      setError("La contraseña no cumple los requisitos: mínimo 8 caracteres, mayúscula, minúscula, número y carácter especial");
      return;
    }
    if (password !== passwordConfirm) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? "Error al restablecer");
        return;
      }
      router.push("/auth/login?reset=1");
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <PageLayout>
        <div className="mx-auto max-w-md">
          <div className="border-2 border-punk-red bg-punk-red/10 p-6">
            <p className="font-body text-punk-red">
              Enlace inválido o sin token. Solicita uno nuevo desde Recuperar contraseña.
            </p>
            <Link
              href="/auth/recuperar"
              className="mt-4 inline-block font-punch text-xs uppercase tracking-widest text-punk-green hover:underline"
            >
              Solicitar enlace →
            </Link>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="mx-auto max-w-md">
        <h1 className="font-display text-5xl tracking-tighter text-punk-white sm:text-6xl">
          NUEVA CONTRASEÑA
        </h1>
        <p className="mt-3 font-body text-punk-white/60">
          Introduce tu nueva contraseña. Debe tener al menos 8 caracteres, mayúscula, minúscula, número y carácter especial.
        </p>

        <form onSubmit={handleSubmit} className="mt-10 space-y-6">
          {error && (
            <div className="border-2 border-punk-red bg-punk-red/10 p-4">
              <p className="font-body text-punk-red">{error}</p>
            </div>
          )}
          <PasswordInput
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            label="Nueva contraseña *"
            required
            minLength={8}
            showStrength
            autoComplete="new-password"
          />
          <PasswordInput
            id="passwordConfirm"
            name="passwordConfirm"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            label="Repetir contraseña *"
            required
            minLength={8}
            autoComplete="new-password"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full border-2 border-punk-green bg-punk-green px-8 py-4 font-punch text-sm uppercase tracking-widest text-punk-black transition-all hover:bg-punk-green/90 disabled:opacity-50"
          >
            {loading ? "Guardando…" : "Restablecer contraseña"}
          </button>
        </form>

        <p className="mt-10 text-center">
          <Link href="/auth/login" className="font-punch text-xs uppercase tracking-widest text-punk-green hover:underline">
            ← Volver a Entrar
          </Link>
        </p>
      </div>
    </PageLayout>
  );
}

export default function RestablecerPage() {
  return (
    <Suspense
      fallback={
        <PageLayout>
          <div className="mx-auto max-w-md animate-pulse">
            <div className="h-12 w-48 bg-punk-white/10 rounded" />
            <div className="mt-8 h-16 bg-punk-white/10 rounded" />
          </div>
        </PageLayout>
      }
    >
      <RestablecerForm />
    </Suspense>
  );
}
