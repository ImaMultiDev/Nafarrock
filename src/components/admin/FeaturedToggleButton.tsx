"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";

type Props = {
  eventId: string;
  featured: boolean;
};

export function FeaturedToggleButton({ eventId, featured }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [optimistic, setOptimistic] = useState(featured);

  const handleClick = async () => {
    setLoading(true);
    setOptimistic(!optimistic);
    try {
      const res = await fetch(`/api/admin/events/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: !featured }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        setOptimistic(featured);
      }
    } catch {
      setOptimistic(featured);
    } finally {
      setLoading(false);
    }
  };

  const isActive = loading ? optimistic : featured;

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      title={isActive ? "Quitar destacado" : "Destacar en inicio"}
      className={`flex shrink-0 items-center justify-center rounded border-2 p-1.5 transition-all disabled:opacity-50 ${
        isActive
          ? "border-punk-yellow bg-punk-yellow/20 text-punk-yellow hover:bg-punk-yellow/30"
          : "border-punk-white/20 text-punk-white/50 hover:border-punk-yellow/50 hover:text-punk-yellow/80"
      }`}
    >
      <Star size={16} className={isActive ? "fill-current" : ""} />
    </button>
  );
}
