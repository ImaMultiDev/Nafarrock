"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { isPasswordValid } from "@/lib/validation";

export function ChangePasswordForm({ hasPassword }: { hasPassword: boolean }) {
  const router = useRouter();
  const t = useTranslations("dashboard.perfil.changePasswordForm");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isPasswordValid(newPassword)) {
      setError(t("errorPasswordRequirements"));
      return;
    }
    if (newPassword !== newPasswordConfirm) {
      setError(t("errorPasswordMismatch"));
      return;
    }
    if (hasPassword && !currentPassword) {
      setError(t("errorCurrentRequired"));
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
        setError(data.message ?? t("errorChange"));
        return;
      }
      setCurrentPassword("");
      setNewPassword("");
      setNewPasswordConfirm("");
      router.refresh();
    } catch {
      setError(t("errorConnection"));
    } finally {
      setLoading(false);
    }
  };

  if (!hasPassword) {
    return (
      <p className="font-body text-punk-white/60">
        {t("externalHint")}
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
          label={t("currentPassword")}
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
          label={t("newPassword")}
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
          label={t("repeatPassword")}
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
        {loading ? t("saving") : t("submit")}
      </button>
    </form>
  );
}
