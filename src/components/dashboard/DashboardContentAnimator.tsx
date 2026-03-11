"use client";

import { usePathname } from "next/navigation";
import { AnimatedSection } from "@/components/ui/AnimatedSection";

export function DashboardContentAnimator({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  return <AnimatedSection key={pathname}>{children}</AnimatedSection>;
}
