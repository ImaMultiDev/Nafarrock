"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  id: string;
  title: string;
  approved: boolean;
};

export function BoardAnnouncementActions({ id, title, approved }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleApprove = async () => {
    setLoading("approve");
    try {
      const res = await fetch(`/api/admin/tablon/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved: true }),
      });
      if (res.ok) router.refresh();
    } finally {
      setLoading(null);
    }
  };

  const handleDesactivate = async () => {
    setLoading("desactivate");
    try {
      const res = await fetch(`/api/admin/tablon/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved: false }),
      });
      if (res.ok) router.refresh();
    } finally {
      setLoading(null);
    }
  };

  const handleDelete = async () => {
    setLoading("delete");
    try {
      const res = await fetch(`/api/admin/tablon/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setShowDeleteConfirm(false);
        router.refresh();
      }
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {!approved && (
        <button
          type="button"
          onClick={handleApprove}
          disabled={!!loading}
          className="border-2 border-punk-green bg-punk-green/20 px-3 py-1 font-punch text-xs uppercase tracking-widest text-punk-green hover:bg-punk-green/30 disabled:opacity-50"
        >
          {loading === "approve" ? "…" : "Aprobar"}
        </button>
      )}
      {approved && (
        <button
          type="button"
          onClick={handleDesactivate}
          disabled={!!loading}
          className="border-2 border-punk-yellow/50 bg-punk-yellow/10 px-3 py-1 font-punch text-xs uppercase tracking-widest text-punk-yellow hover:bg-punk-yellow/20 disabled:opacity-50"
        >
          {loading === "desactivate" ? "…" : "Desactivar"}
        </button>
      )}
      <button
        type="button"
        onClick={() => setShowDeleteConfirm(true)}
        disabled={!!loading}
        className="border-2 border-punk-red/50 bg-punk-red/10 px-3 py-1 font-punch text-xs uppercase tracking-widest text-punk-red hover:bg-punk-red/20 disabled:opacity-50"
      >
        Eliminar
      </button>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-punk-black/90 p-4">
          <div className="max-w-md border-2 border-punk-red bg-punk-black p-6">
            <p className="font-body text-punk-white">
              ¿Eliminar el anuncio <strong>"{title}"</strong>? Esta acción no se puede deshacer.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={!!loading}
                className="flex-1 border-2 border-punk-white/30 px-4 py-2 font-punch text-xs uppercase tracking-widest text-punk-white hover:border-punk-white disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={!!loading}
                className="flex-1 border-2 border-punk-red bg-punk-red px-4 py-2 font-punch text-xs uppercase tracking-widest text-punk-white hover:bg-punk-red/90 disabled:opacity-50"
              >
                {loading === "delete" ? "…" : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
