"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { isPasswordValid } from "@/lib/validation";

export function ChangePasswordForm({ hasPassword }: { hasPassword: boolean }) {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isPasswordValid(newPassword)) {
      setError("Nueva contraseña: mínimo 8 caracteres, mayúscula, minúscula, número y carácter especial");
      return;
    }
    if (newPassword !== newPasswordConfirm) {
      setError("Las contraseñas no coinciden");
      return;
    }
    if (hasPassword && !currentPassword) {
      setError("Introduce tu contraseña actual");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/change-password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: hasPassword ? currentPassword : undefined,
          newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? "Error al cambiar contraseña");
        return;
      }
      setCurrentPassword("");
      setNewPassword("");
      setNewPasswordConfirm("");
      router.refresh();
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  if (!hasPassword) {
    return (
      <p className="font-body text-punk-white/60">
        Tu cuenta utiliza acceso externo (Google, etc.). La contraseña se gestiona desde el proveedor.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 max-w-xl space-y-6">
      {error && (
        <div className="border-2 border-punk-red bg-punk-red/10 p-4">
          <p className="font-body text-punk-red">{error}</p>
        </div>
      )}
      <div>
        <PasswordInput
          id="currentPassword"
          name="currentPassword"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          label="Contraseña actual *"
          required
          showStrength={false}
          autoComplete="current-password"
        />
      </div>
      <div>
        <PasswordInput
          id="newPassword"
          name="newPassword"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          label="Nueva contraseña *"
          required
          minLength={8}
          showStrength
          autoComplete="new-password"
        />
      </div>
      <div>
        <PasswordInput
          id="newPasswordConfirm"
          name="newPasswordConfirm"
          value={newPasswordConfirm}
          onChange={(e) => setNewPasswordConfirm(e.target.value)}
          label="Repetir nueva contraseña *"
          required
          minLength={8}
          autoComplete="new-password"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="border-2 border-punk-green bg-punk-green px-8 py-3 font-punch text-sm uppercase tracking-widest text-punk-black transition-colors hover:bg-punk-green/90 disabled:opacity-50"
      >
        {loading ? "Guardando…" : "Cambiar contraseña"}
      </button>
    </form>
  );
}
