"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ClaimActions({ claimId }: { claimId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [rejectStep, setRejectStep] = useState<"idle" | "ask" | "form">("idle");
  const [reason, setReason] = useState("");

  const handleApprove = async () => {
    setLoading("approve");
    try {
      const res = await fetch(`/api/admin/claims/${claimId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve" }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.message ?? "Error");
      }
      router.refresh();
    } catch {
      alert("Error");
    } finally {
      setLoading(null);
    }
  };

  const handleReject = async (withReason: boolean) => {
    setLoading("reject");
    try {
      const res = await fetch(`/api/admin/claims/${claimId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reject",
          ...(withReason && reason.trim() ? { reason: reason.trim() } : {}),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.message ?? "Error");
        return;
      }
      router.refresh();
    } catch {
      alert("Error");
    } finally {
      setLoading(null);
      setRejectStep("idle");
      setReason("");
    }
  };

  if (rejectStep === "ask") {
    return (
      <div className="flex flex-col gap-2">
        <p className="font-body text-sm text-punk-white/80">¿Quieres dar un motivo?</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setRejectStep("form")}
            className="border-2 border-punk-green px-3 py-1 font-punch text-xs uppercase tracking-widest text-punk-green hover:bg-punk-green hover:text-punk-black"
          >
            Sí
          </button>
          <button
            type="button"
            onClick={() => handleReject(false)}
            disabled={!!loading}
            className="border-2 border-punk-red/50 px-3 py-1 font-punch text-xs uppercase tracking-widest text-punk-red/80 hover:bg-punk-red hover:text-punk-black disabled:opacity-50"
          >
            {loading === "reject" ? "…" : "No"}
          </button>
        </div>
      </div>
    );
  }

  if (rejectStep === "form") {
    return (
      <div className="flex flex-col gap-2 max-w-xs">
        <label className="font-body text-sm text-punk-white/80">Motivo del rechazo:</label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Escribe el motivo que se enviará al usuario por email..."
          rows={3}
          className="w-full rounded border border-punk-white/30 bg-punk-black px-3 py-2 font-body text-sm text-punk-white placeholder:text-punk-white/40 focus:border-punk-red focus:outline-none"
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleReject(true)}
            disabled={!!loading}
            className="border-2 border-punk-red px-3 py-1 font-punch text-xs uppercase tracking-widest text-punk-red hover:bg-punk-red hover:text-punk-black disabled:opacity-50"
          >
            {loading === "reject" ? "…" : "Enviar y rechazar"}
          </button>
          <button
            type="button"
            onClick={() => { setRejectStep("ask"); setReason(""); }}
            disabled={!!loading}
            className="border-2 border-punk-white/30 px-3 py-1 font-punch text-xs uppercase tracking-widest text-punk-white/70 hover:border-punk-white"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={handleApprove}
        disabled={!!loading}
        className="border-2 border-punk-green px-3 py-1 font-punch text-xs uppercase tracking-widest text-punk-green hover:bg-punk-green hover:text-punk-black disabled:opacity-50"
      >
        {loading === "approve" ? "…" : "Aprobar"}
      </button>
      <button
        type="button"
        onClick={() => setRejectStep("ask")}
        disabled={!!loading}
        className="border-2 border-punk-red/50 px-3 py-1 font-punch text-xs uppercase tracking-widest text-punk-red/80 hover:bg-punk-red hover:text-punk-black disabled:opacity-50"
      >
        {loading === "reject" ? "…" : "Rechazar"}
      </button>
    </div>
  );
}
