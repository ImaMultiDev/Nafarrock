"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import Link from "next/link";
import { PageLayout } from "@/components/ui/PageLayout";
import { Mail, Loader2 } from "lucide-react";

function VerificarEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleResend = async () => {
    if (!email) return;
    setLoading(true);
    setError(null);
    const res = await fetch("/api/auth/resend-verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      setSent(true);
    } else {
      setError(data.message ?? "Error al reenviar");
    }
  };

  return (
    <PageLayout>
      <div className="mx-auto max-w-md text-center">
        <div className="mb-8 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-punk-green bg-punk-green/10">
            <Mail className="h-10 w-10 text-punk-green" />
          </div>
        </div>
        <h1 className="font-display text-4xl tracking-tighter text-punk-white sm:text-5xl">
          REVISA TU EMAIL
        </h1>
        <p className="mt-6 font-body text-punk-white/80">
          Te hemos enviado un enlace de verificación a
          {email ? (
            <span className="mt-2 block font-punch text-punk-green">
              {email}
            </span>
          ) : (
            " tu dirección de correo"
          )}
          . Haz clic en el enlace para activar tu cuenta.
        </p>
        <p className="mt-4 font-body text-sm text-punk-white/50">
          El enlace expira en 24 horas. Si no lo ves, revisa la carpeta de spam.
        </p>
        <p className="mt-2 font-body text-sm text-punk-white/50">
          Si estás reclamando un perfil, tras verificar verás &quot;Pendiente de aprobación&quot; hasta que el administrador revise tu solicitud.
        </p>

        {email && (
          <div className="mt-10 space-y-4">
            {error && (
              <p className="font-body text-sm text-punk-red">{error}</p>
            )}
            {sent && (
              <p className="font-body text-sm text-punk-green">
                ¡Email reenviado!
              </p>
            )}
            <button
              type="button"
              onClick={handleResend}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 border-2 border-punk-white/30 bg-transparent px-6 py-3 font-punch text-xs uppercase tracking-widest text-punk-white/80 transition-colors hover:border-punk-green hover:text-punk-green disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Reenviar email de verificación"
              )}
            </button>
          </div>
        )}

        <p className="mt-12">
          <Link
            href="/auth/login"
            className="font-punch text-sm uppercase tracking-widest text-punk-green hover:text-punk-green/80"
          >
            ← Volver al login
          </Link>
        </p>
      </div>
    </PageLayout>
  );
}

export default function VerificarEmailPage() {
  return (
    <Suspense
      fallback={
        <PageLayout>
          <div className="flex min-h-[200px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-punk-green" />
          </div>
        </PageLayout>
      }
    >
      <VerificarEmailContent />
    </Suspense>
  );
}
