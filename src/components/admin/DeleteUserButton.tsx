"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  userId: string;
  userEmail: string;
  isCurrentUser: boolean;
};

export function DeleteUserButton({ userId, userEmail, isCurrentUser }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState(false);

  if (isCurrentUser) return null;

  const handleDelete = async () => {
    if (!confirm) {
      setConfirm(true);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        router.refresh();
      } else {
        alert(data.message ?? "Error al eliminar");
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
      title={`Eliminar usuario ${userEmail}`}
      className={`border-2 px-3 py-1 font-punch text-xs uppercase tracking-widest transition-colors disabled:opacity-50 ${
        confirm
          ? "border-punk-red bg-punk-red text-punk-white hover:bg-punk-red/90"
          : "border-punk-white/30 text-punk-white/70 hover:border-punk-red hover:text-punk-red"
      }`}
    >
      {loading ? "..." : confirm ? "Confirmar borrar" : "Eliminar"}
    </button>
  );
}
