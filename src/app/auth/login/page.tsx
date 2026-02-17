"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

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

  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-display text-2xl font-bold text-void-50">
        Entrar en Nafarrock
      </h1>
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        {error && (
          <p className="rounded bg-red-900/50 p-3 text-sm text-red-300">
            {error}
          </p>
        )}
        <div>
          <label htmlFor="email" className="block text-sm text-void-400">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 w-full rounded border border-void-700 bg-void-900 px-3 py-2 text-void-100"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm text-void-400">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 w-full rounded border border-void-700 bg-void-900 px-3 py-2 text-void-100"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded bg-rock-600 py-2 font-medium text-white hover:bg-rock-500"
        >
          Entrar
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-void-500">
        ¿No tienes cuenta?{" "}
        <Link href="/auth/registro" className="text-rock-400 hover:underline">
          Regístrate
        </Link>
      </p>
    </main>
  );
}
