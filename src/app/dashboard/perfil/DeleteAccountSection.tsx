"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { PasswordInput } from "@/components/ui/PasswordInput";

export function DeleteAccountSection({
  hasPassword,
  isAdmin,
}: {
  hasPassword: boolean;
  isAdmin: boolean;
}) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isAdmin) {
    return (
      <p className="font-body text-punk-white/50">
        Los administradores no pueden borrar su cuenta desde el panel.
      </p>
    );
  }

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (confirmText !== "BORRAR CUENTA") {
      setError('Escribe "BORRAR CUENTA" para confirmar');
      return;
    }
    if (hasPassword && !password) {
      setError("Introduce tu contraseña para confirmar");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/delete-account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          confirm: confirmText,
          password: hasPassword ? password : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? "Error al borrar la cuenta");
        return;
      }
      const scheduledAt = data.scheduledAt
        ? new Date(data.scheduledAt).toLocaleDateString("es-ES", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })
        : "";
      await signOut({
        callbackUrl: `/auth/login?deleted=scheduled&date=${encodeURIComponent(scheduledAt)}`,
      });
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6">
      {!showConfirm ? (
        <button
          type="button"
          onClick={() => setShowConfirm(true)}
          className="border-2 border-punk-red/50 px-6 py-2 font-punch text-xs uppercase tracking-widest text-punk-red/80 hover:bg-punk-red hover:text-punk-black transition-colors"
        >
          Borrar cuenta
        </button>
      ) : (
        <form
          onSubmit={handleDelete}
          className="max-w-xl space-y-4 border-2 border-punk-red/30 bg-punk-red/5 p-6"
        >
          <p className="font-body text-punk-white/90">
            Tu cuenta se eliminará de forma permanente después de 7 días. Si
            inicias sesión antes de esa fecha, la eliminación se cancelará y
            tu cuenta seguirá existiendo.
          </p>
          {error && (
            <div className="border-2 border-punk-red bg-punk-red/10 p-4">
              <p className="font-body text-punk-red">{error}</p>
            </div>
          )}
          <div>
            <label
              htmlFor="confirmDelete"
              className="block font-punch text-xs uppercase tracking-widest text-punk-white/70"
            >
              Escribe <b>BORRAR CUENTA</b> para confirmar *
            </label>
            <input
              id="confirmDelete"
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="BORRAR CUENTA"
              className="mt-2 w-full border-2 border-punk-white/20 bg-punk-black px-4 py-3 font-body text-punk-white placeholder:text-punk-white/40 focus:border-punk-red focus:outline-none"
            />
          </div>
          {hasPassword && (
            <div>
              <PasswordInput
                id="deletePassword"
                name="deletePassword"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                label="Tu contraseña *"
                required
                showStrength={false}
                autoComplete="current-password"
              />
            </div>
          )}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                setShowConfirm(false);
                setConfirmText("");
                setPassword("");
                setError(null);
              }}
              className="border-2 border-punk-white/40 px-4 py-2 font-punch text-xs uppercase tracking-widest text-punk-white/80 hover:border-punk-green hover:text-punk-green"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || confirmText !== "BORRAR CUENTA"}
              className="border-2 border-punk-red bg-punk-red px-6 py-2 font-punch text-xs uppercase tracking-widest text-punk-black hover:bg-punk-red/90 disabled:opacity-50"
            >
              {loading ? "Borrando…" : "Borrar mi cuenta"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
