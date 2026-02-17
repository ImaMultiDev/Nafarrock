"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function RegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: formData.get("email"),
        password: formData.get("password"),
        name: formData.get("name"),
        role: formData.get("role"),
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.message ?? "Error al registrarse");
      return;
    }
    router.push("/auth/login?registered=1");
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4">
      {error && (
        <p className="rounded bg-red-900/50 p-3 text-sm text-red-300">
          {error}
        </p>
      )}
      <div>
        <label htmlFor="name" className="block text-sm text-void-400">
          Nombre
        </label>
        <input
          id="name"
          name="name"
          type="text"
          className="mt-1 w-full rounded border border-void-700 bg-void-900 px-3 py-2 text-void-100"
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm text-void-400">
          Email *
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="mt-1 w-full rounded border border-void-700 bg-void-900 px-3 py-2 text-void-100"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm text-void-400">
          Contraseña *
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          className="mt-1 w-full rounded border border-void-700 bg-void-900 px-3 py-2 text-void-100"
        />
      </div>
      <div>
        <label htmlFor="role" className="block text-sm text-void-400">
          Tipo de cuenta
        </label>
        <select
          id="role"
          name="role"
          className="mt-1 w-full rounded border border-void-700 bg-void-900 px-3 py-2 text-void-100"
        >
          <option value="USUARIO">Usuario</option>
          <option value="BANDA">Banda (requiere aprobación)</option>
          <option value="PROMOTOR">Promotor (requiere aprobación)</option>
        </select>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded bg-rock-600 py-2 font-medium text-white hover:bg-rock-500 disabled:opacity-50"
      >
        {loading ? "Registrando..." : "Registrarse"}
      </button>
    </form>
  );
}
