"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteEventButton({ eventId }: { eventId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState(false);

  const handleDelete = async () => {
    if (!confirm) {
      setConfirm(true);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/dashboard/events/${eventId}`, { method: "DELETE" });
      if (res.ok) router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className={`border-2 px-3 py-1 font-punch text-xs uppercase tracking-widest transition-colors disabled:opacity-50 ${
        confirm
          ? "border-punk-red bg-punk-red text-punk-white hover:bg-punk-blood"
          : "border-punk-red/50 bg-punk-red/10 text-punk-red hover:bg-punk-red/20"
      }`}
    >
      {loading ? "..." : confirm ? "Confirmar borrar" : "Borrar"}
    </button>
  );
}
