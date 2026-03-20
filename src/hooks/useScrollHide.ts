"use client";

import { useState, useEffect, useRef } from "react";

const SCROLL_THRESHOLD = 10;
const TOP_THRESHOLD = 50;

/**
 * Oculta el elemento al hacer scroll hacia abajo, lo muestra al hacer scroll hacia arriba.
 * Siempre visible cuando el scroll está cerca del top.
 * @param scrollElement - Elemento con overflow que hace scroll. Si no se pasa, usa window.
 */
export function useScrollHide(scrollElement?: HTMLElement | null) {
  const [visible, setVisible] = useState(true);
  const lastScroll = useRef(0);

  useEffect(() => {
    const getScrollTop = () =>
      scrollElement ? scrollElement.scrollTop : (typeof window !== "undefined" ? window.scrollY : 0);

    const target = scrollElement ?? (typeof window !== "undefined" ? window : null);
    if (!target) return;

    const onScroll = () => {
      const scrollTop = getScrollTop();

      // Siempre visible cerca del top
      if (scrollTop < TOP_THRESHOLD) {
        setVisible(true);
        lastScroll.current = scrollTop;
        return;
      }

      const delta = scrollTop - lastScroll.current;
      if (Math.abs(delta) < SCROLL_THRESHOLD) return;

      setVisible(delta < 0);
      lastScroll.current = scrollTop;
    };

    target.addEventListener("scroll", onScroll, { passive: true });
    return () => target.removeEventListener("scroll", onScroll);
  }, [scrollElement]);

  return visible;
}
