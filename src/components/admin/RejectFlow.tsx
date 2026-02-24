"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  entity: "band" | "venue" | "festival" | "association" | "promoter" | "organizer";
  id: string;
  onReject?: () => void;
};

export function RejectFlow({ entity, id, onReject }: Props) {
  const router = useRouter();
  const [step, setStep] = useState<"idle" | "ask" | "form">("idle");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReject = async (withReason: boolean) => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/reject-solicitud", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity,
          id,
          ...(withReason && reason.trim() ? { reason: reason.trim() } : {}),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.message ?? "Error");
        return;
      }
      onReject?.();
      router.refresh();
    } catch {
      alert("Error");
    } finally {
      setLoading(false);
      setStep("idle");
      setReason("");
    }
  };

  if (step === "idle") {
    return (
      <button
        type="button"
        onClick={() => setStep("ask")}
        className="border-2 border-punk-red/50 px-3 py-1 font-punch text-xs uppercase tracking-widest text-punk-red/80 hover:bg-punk-red hover:text-punk-black"
      >
        Rechazar
      </button>
    );
  }

  if (step === "ask") {
    return (
      <div className="flex flex-col gap-2">
        <p className="font-body text-sm text-punk-white/80">¿Quieres dar un motivo?</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setStep("form")}
            className="border-2 border-punk-green px-3 py-1 font-punch text-xs uppercase tracking-widest text-punk-green hover:bg-punk-green hover:text-punk-black"
          >
            Sí
          </button>
          <button
            type="button"
            onClick={() => handleReject(false)}
            disabled={loading}
            className="border-2 border-punk-red/50 px-3 py-1 font-punch text-xs uppercase tracking-widest text-punk-red/80 hover:bg-punk-red hover:text-punk-black disabled:opacity-50"
          >
            {loading ? "…" : "No"}
          </button>
        </div>
      </div>
    );
  }

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
          disabled={loading}
          className="border-2 border-punk-red px-3 py-1 font-punch text-xs uppercase tracking-widest text-punk-red hover:bg-punk-red hover:text-punk-black disabled:opacity-50"
        >
          {loading ? "…" : "Enviar y rechazar"}
        </button>
        <button
          type="button"
          onClick={() => { setStep("ask"); setReason(""); }}
          disabled={loading}
          className="border-2 border-punk-white/30 px-3 py-1 font-punch text-xs uppercase tracking-widest text-punk-white/70 hover:border-punk-white"
        >
          Volver
        </button>
      </div>
    </div>
  );
}
