"use client";

import { signIn } from "next-auth/react";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { PageLayout } from "@/components/ui/PageLayout";
import { PasswordInput } from "@/components/ui/PasswordInput";

const EDITORIAL_MVP_MODE = true;

function LoginForm() {
  const searchParams = useSearchParams();
  const locale = useLocale();
  const t = useTranslations("auth.login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isVerifyError, setIsVerifyError] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [pendingDeletion, setPendingDeletion] = useState<{ date: string } | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (searchParams.get("registered") === "1") setRegistered(true);
  }, [searchParams]);

  const verified = searchParams.get("verified") === "1";
  const reset = searchParams.get("reset") === "1";
  const deletedScheduled = searchParams.get("deleted") === "scheduled";
  const deletedDate = searchParams.get("date") ?? "";
  const deletedPending = searchParams.get("deleted") === "pending";
  const accountDeleted = searchParams.get("deleted") === "done";
  const urlError = searchParams.get("error");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setPendingDeletion(null);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    if (res?.error) {
      if (res.error === "EmailNotVerified") {
        setIsVerifyError(true);
        setError(t("errorVerify"));
      } else if (res.error === "AccountDeleted") {
        window.location.href = "/auth/login?deleted=done";
        return;
      } else if (res.error.startsWith("PendingDeletion|")) {
        const dateStr = res.error.split("|")[1];
        const date = dateStr
          ? new Date(dateStr).toLocaleDateString(locale === "eu" ? "eu-ES" : "es-ES", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })
          : "";
        setPendingDeletion({ date });
      } else {
        setError(t("errorCredentials"));
      }
      return;
    }
    window.location.href = "/dashboard";
  };

  const handleCancelDeletion = async () => {
    setError(null);
    setCancelling(true);
    try {
      const res = await fetch("/api/auth/cancel-deletion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? t("errorCancel"));
        return;
      }
      const signRes = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (signRes?.ok) {
        window.location.href = "/dashboard?deletionCancelled=1";
      } else {
        setError(t("deletionCancelled"));
      }
    } catch {
      setError(t("errorConnection"));
    } finally {
      setCancelling(false);
    }
  };

  const inputClass =
    "mt-2 w-full border-2 border-punk-white/20 bg-punk-black px-4 py-3 font-body text-punk-white placeholder:text-punk-white/40 focus:border-punk-green focus:outline-none";
  const labelClass = "block font-punch text-xs uppercase tracking-widest text-punk-white/70";

  return (
    <PageLayout>
      <div className="mx-auto max-w-md">
        <h1 className="font-display text-5xl tracking-tighter text-punk-white sm:text-6xl">
          {t("title")}
        </h1>
        <p className="mt-3 font-body text-punk-white/60">
          {t("subtitle")}
        </p>

        {verified && (
          <div className="mt-6 border-2 border-punk-green bg-punk-green/10 p-4">
            <p className="font-body text-punk-green">
              {t("emailVerified")}
            </p>
          </div>
        )}

        {reset && (
          <div className="mt-6 border-2 border-punk-green bg-punk-green/10 p-4">
            <p className="font-body text-punk-green">
              {t("passwordReset")}
            </p>
          </div>
        )}

        {deletedScheduled && (
          <div className="mt-6 border-2 border-punk-green bg-punk-green/10 p-4">
            <p className="font-body text-punk-green">
              {t("deletedScheduled")}{deletedDate ? t("deletedScheduledDate", { date: deletedDate }) : ""}.
            </p>
            <p className="mt-2 font-body text-sm text-punk-white/70">
              {t("deletedScheduledHint")}
            </p>
          </div>
        )}

        {deletedPending && (
          <div className="mt-6 border-2 border-punk-white/30 bg-punk-white/5 p-4">
            <p className="font-body text-punk-white/90">
              {t("deletedPending")}
            </p>
            <p className="mt-2 font-body text-sm text-punk-white/60">
              {t("deletedPendingHint")}
            </p>
          </div>
        )}

        {accountDeleted && (
          <div className="mt-6 border-2 border-punk-white/30 bg-punk-white/5 p-4">
            <p className="font-body text-punk-white/90">
              {t("accountDeleted")}
            </p>
            <p className="mt-2 font-body text-sm text-punk-white/60">
              {t("accountDeletedHint")}
            </p>
          </div>
        )}

        {urlError === "VerificationTokenExpired" && (
          <div className="mt-6 border-2 border-punk-red bg-punk-red/10 p-4">
            <p className="font-body text-punk-red">
              {t("verificationExpired")}
            </p>
          </div>
        )}

        {urlError === "VerificationTokenInvalid" && (
          <div className="mt-6 border-2 border-punk-red bg-punk-red/10 p-4">
            <p className="font-body text-punk-red">
              {t("verificationInvalid")}
            </p>
          </div>
        )}

        {registered && (
          <div className="mt-6 border-2 border-punk-green bg-punk-green/10 p-4">
            <p className="font-body text-punk-green">
              {t("registered")}
            </p>
            <p className="mt-2 font-body text-sm text-punk-white/70">
              {t("registeredHint")}
            </p>
          </div>
        )}

        {pendingDeletion && (
          <div className="mt-10 border-2 border-punk-green/50 bg-punk-green/10 p-6">
            <p className="font-body text-punk-white/90">
              {t("pendingDeletion")}{pendingDeletion.date ? t("pendingDeletionDate", { date: pendingDeletion.date }) : ""}.
            </p>
            <p className="mt-2 font-body text-punk-white/80">
              {t("pendingDeletionHint")}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleCancelDeletion}
                disabled={cancelling}
                className="border-2 border-punk-green bg-punk-green px-6 py-2 font-punch text-xs uppercase tracking-widest text-punk-black hover:bg-punk-green/90 disabled:opacity-50"
              >
                {cancelling ? t("processing") : t("cancelDeletion")}
              </button>
              <button
                type="button"
                onClick={() => setPendingDeletion(null)}
                className="border-2 border-punk-white/40 px-6 py-2 font-punch text-xs uppercase tracking-widest text-punk-white/80 hover:border-punk-red hover:text-punk-red"
              >
                {t("exit")}
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-10 space-y-6">
          {error && (
            <div className="border-2 border-punk-red bg-punk-red/10 p-4">
              <p className="font-body text-punk-red">{error}</p>
              {isVerifyError && email && (
                <Link
                  href={`/auth/verificar-email?email=${encodeURIComponent(email)}`}
                  className="mt-2 inline-block font-punch text-xs uppercase tracking-widest text-punk-green hover:text-punk-green/80"
                >
                  {t("resendVerification")}
                </Link>
              )}
            </div>
          )}
          <div>
            <label htmlFor="email" className={labelClass}>{t("email")}</label>
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
            <PasswordInput
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              label={t("password")}
              required
              showStrength={false}
              autoComplete="current-password"
            />
          </div>
          <div className="text-right">
            <Link
              href="/auth/recuperar"
              className="font-body text-sm text-punk-white/60 hover:text-punk-green"
            >
              {t("forgotPassword")}
            </Link>
          </div>
          <button
            type="submit"
            className="w-full border-2 border-punk-green bg-punk-green px-8 py-4 font-punch text-sm uppercase tracking-widest text-punk-black transition-all hover:bg-punk-green/90"
          >
            {t("submit")}
          </button>
        </form>

        <p className="mt-10 text-center font-body text-sm text-punk-white/60">
          {t("noAccount")}{" "}
          <Link href="/auth/registro" className="font-punch uppercase tracking-widest text-punk-green hover:text-punk-green/80">
            {t("register")}
          </Link>
        </p>
        {!EDITORIAL_MVP_MODE && (
          <p className="mt-4 text-center font-body text-sm text-punk-white/60">
            {t("claimProfile")}{" "}
            <Link href="/auth/reclamar" className="font-punch uppercase tracking-widest text-punk-green hover:text-punk-green/80">
              {t("claimProfileLink")}
            </Link>
          </p>
        )}
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
