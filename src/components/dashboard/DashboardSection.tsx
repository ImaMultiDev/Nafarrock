import { ReactNode } from "react";

type Accent = "green" | "pink" | "red" | "yellow";

const ACCENT_BORDER: Record<Accent, string> = {
  green: "border-l-punk-green",
  pink: "border-l-punk-pink",
  red: "border-l-punk-red",
  yellow: "border-l-punk-yellow",
};

export function DashboardSection({
  title,
  children,
  accent = "green",
  className = "",
}: {
  title?: string;
  children: ReactNode;
  accent?: Accent;
  className?: string;
}) {
  return (
    <section
      className={`rounded-xl border-2 border-l-4 border-punk-white/10 bg-punk-black/60 p-6 shadow-lg backdrop-blur-sm ${ACCENT_BORDER[accent]} ${className}`}
    >
      {title && (
        <h2 className="mb-4 font-display text-xl tracking-tighter text-punk-white">
          {title}
        </h2>
      )}
      {children}
    </section>
  );
}
