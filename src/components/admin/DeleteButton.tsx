"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  entity: "band" | "venue" | "event";
  id: string;
  label: string;
  onConfirm?: () => void;
};

export function DeleteButton({ entity, id, label, onConfirm }: Props) {
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
      const res = await fetch(`/api/admin/${entity}s/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        onConfirm?.();
        router.refresh();
      }
    } finally {
      setLoading(false);
      setConfirm(false);
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
          : "border-punk-white/30 text-punk-white/70 hover:border-punk-red hover:text-punk-red"
      }`}
    >
      {loading ? "..." : confirm ? "Confirmar borrar" : label}
    </button>
  );
}
