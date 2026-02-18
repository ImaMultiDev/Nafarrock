"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  entity: "band" | "venue" | "event" | "promoter" | "organizer" | "festival";
  id: string;
  approved: boolean;
};

export function ApproveButton({ entity, id, approved }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      const paths: Record<string, string> = { band: "bands", venue: "venues", event: "events", promoter: "promoters", organizer: "organizers", festival: "festivals" };
      // Eventos usan isApproved, el resto usa approved
      const body = entity === "event" ? { isApproved: !approved } : { approved: !approved };
      const res = await fetch(`/api/admin/${paths[entity]}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const label = approved ? "Quitar aprobación" : "Aprobar";
  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={`border-2 px-3 py-1 font-punch text-xs uppercase tracking-widest transition-colors disabled:opacity-50 ${
        approved
          ? "border-punk-green/50 bg-punk-green/10 text-punk-green hover:bg-punk-green/20"
          : "border-punk-red/50 bg-punk-red/10 text-punk-red hover:bg-punk-red/20"
      }`}
    >
      {loading ? "..." : label}
    </button>
  );
}
