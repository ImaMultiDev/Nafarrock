"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  id: string;
  isApproved: boolean;
  status: string;
};

export function AnnouncementActions({ id, isApproved, status }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/announcements/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved: true }),
      });
      if (res.ok) router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/announcements/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved: false, status: "REJECTED" }),
      });
      if (res.ok) router.refresh();
    } finally {
      setLoading(false);
    }
  };

  if (status === "REJECTED") {
    return <span className="font-body text-sm text-punk-white/50">—</span>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {!isApproved && (
        <>
          <button
            type="button"
            onClick={handleApprove}
            disabled={loading}
            className="border-2 border-punk-green bg-punk-green/20 px-3 py-1 font-punch text-xs uppercase tracking-widest text-punk-green hover:bg-punk-green/30 disabled:opacity-50"
          >
            {loading ? "..." : "Aprobar"}
          </button>
          <button
            type="button"
            onClick={handleReject}
            disabled={loading}
            className="border-2 border-punk-red/50 bg-punk-red/10 px-3 py-1 font-punch text-xs uppercase tracking-widest text-punk-red hover:bg-punk-red/20 disabled:opacity-50"
          >
            Rechazar
          </button>
        </>
      )}
      {isApproved && (
        <button
          type="button"
          onClick={handleReject}
          disabled={loading}
          className="border-2 border-punk-red/50 bg-punk-red/10 px-3 py-1 font-punch text-xs uppercase tracking-widest text-punk-red hover:bg-punk-red/20 disabled:opacity-50"
        >
          Desactivar
        </button>
      )}
    </div>
  );
}
