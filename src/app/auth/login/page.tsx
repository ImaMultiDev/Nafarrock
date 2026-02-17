"use client";

import { signIn } from "next-auth/react";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PageLayout } from "@/components/ui/PageLayout";

function LoginForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [registered, setRegistered] = useState(false);

  useEffect(() => {
    if (searchParams.get("registered") === "1") setRegistered(true);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    if (res?.error) {
      setError("Email o contraseña incorrectos");
      return;
    }
    window.location.href = "/dashboard";
  };

  const inputClass =
    "mt-2 w-full border-2 border-punk-white/20 bg-punk-black px-4 py-3 font-body text-punk-white placeholder:text-punk-white/40 focus:border-punk-green focus:outline-none";
  const labelClass = "block font-punch text-xs uppercase tracking-widest text-punk-white/70";

  return (
    <PageLayout>
      <div className="mx-auto max-w-md">
        <h1 className="font-display text-5xl tracking-tighter text-punk-white sm:text-6xl">
          ENTRAR
        </h1>
        <p className="mt-3 font-body text-punk-white/60">
          Accede a tu cuenta de Nafarrock
        </p>

        {registered && (
          <div className="mt-6 border-2 border-punk-green bg-punk-green/10 p-4">
            <p className="font-body text-punk-green">
              ✓ Registro completado. Inicia sesión para acceder a tu panel.
            </p>
            <p className="mt-2 font-body text-sm text-punk-white/70">
              Si registraste una banda, sala, festival, promotor u organizador, recibirás un email cuando el admin apruebe tu solicitud.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-10 space-y-6">
          {error && (
            <div className="border-2 border-punk-red bg-punk-red/10 p-4">
              <p className="font-body text-punk-red">{error}</p>
            </div>
          )}
          <div>
            <label htmlFor="email" className={labelClass}>Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="password" className={labelClass}>Contraseña</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={inputClass}
            />
          </div>
          <button
            type="submit"
            className="w-full border-2 border-punk-green bg-punk-green px-8 py-4 font-punch text-sm uppercase tracking-widest text-punk-black transition-all hover:bg-punk-green/90"
          >
            Entrar
          </button>
        </form>

        <p className="mt-10 text-center font-body text-sm text-punk-white/60">
          ¿No tienes cuenta?{" "}
          <Link href="/auth/registro" className="font-punch uppercase tracking-widest text-punk-green hover:text-punk-green/80">
            Regístrate
          </Link>
        </p>
      </div>
    </PageLayout>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <PageLayout>
        <div className="mx-auto max-w-md animate-pulse">
          <div className="h-12 w-48 bg-punk-white/10 rounded" />
          <div className="mt-8 h-16 bg-punk-white/10 rounded" />
          <div className="mt-4 h-16 bg-punk-white/10 rounded" />
        </div>
      </PageLayout>
    }>
      <LoginForm />
    </Suspense>
  );
}
