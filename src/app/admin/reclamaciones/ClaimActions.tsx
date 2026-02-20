"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ClaimActions({ claimId }: { claimId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handle = async (action: "approve" | "reject") => {
    setLoading(action);
    try {
      const res = await fetch(`/api/admin/claims/${claimId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
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

  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => handle("approve")}
        disabled={!!loading}
        className="border-2 border-punk-green px-3 py-1 font-punch text-xs uppercase tracking-widest text-punk-green hover:bg-punk-green hover:text-punk-black disabled:opacity-50"
      >
        {loading === "approve" ? "…" : "Aprobar"}
      </button>
      <button
        type="button"
        onClick={() => handle("reject")}
        disabled={!!loading}
        className="border-2 border-punk-red/50 px-3 py-1 font-punch text-xs uppercase tracking-widest text-punk-red/80 hover:bg-punk-red hover:text-punk-black disabled:opacity-50"
      >
        {loading === "reject" ? "…" : "Rechazar"}
      </button>
    </div>
  );
}
