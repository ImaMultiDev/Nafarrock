"use client";

import { Fragment, useCallback, useMemo, useRef, useState, type CSSProperties } from "react";
import { motion, AnimatePresence, animate, useMotionValue } from "framer-motion";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  computeFinalRotation,
  drawOutcome,
  NUM_SECTORS,
  SECTOR_PRIZES,
  sectorAngleRange,
  sectorCenterAngleDeg,
  targetAngleForSector,
  writeLastPlayToStorage,
  type PrizeId,
} from "@/lib/eguneroko-saria";

const NEON_GOLD =
  "drop-shadow(0 0 6px rgba(255, 200, 80, 0.9)) drop-shadow(0 0 14px rgba(255, 180, 40, 0.5))";
/** Mismo tratamiento para CD, camiseta y sudadera (premios “objeto”) */
const PREMIUM_ICON_FILTER = `${NEON_GOLD} brightness(1.12) saturate(1.12) contrast(1.05)`;
const NEON_RED =
  "drop-shadow(0 0 8px rgba(230, 0, 38, 0.85)) drop-shadow(0 0 16px rgba(230, 0, 38, 0.45))";

const VINYL_SRC = "/svg/game/vinyl-svgrepo-com%20(1).svg";

const SECTOR_TINT: Record<PrizeId, string> = {
  pick_x1: "rgba(120, 18, 38, 0.58)",
  pick_x2: "rgba(140, 22, 42, 0.55)",
  pick_x4: "rgba(160, 28, 48, 0.52)",
  pick_x8: "rgba(180, 36, 52, 0.5)",
  pick_x10: "rgba(200, 48, 58, 0.55)",
  cd: "rgba(90, 40, 120, 0.48)",
  shirt: "rgba(40, 90, 140, 0.48)",
  hoodie: "rgba(30, 110, 90, 0.5)",
};

const ICON_SRC: Record<PrizeId, string> = {
  pick_x1: "/svg/game/guitar-pick-pick-svgrepo-com.svg",
  pick_x2: "/svg/game/guitar-pick-pick-svgrepo-com.svg",
  pick_x4: "/svg/game/guitar-pick-pick-svgrepo-com.svg",
  pick_x8: "/svg/game/guitar-pick-pick-svgrepo-com.svg",
  pick_x10: "/svg/game/guitar-pick-pick-svgrepo-com.svg",
  cd: "/svg/game/cd-case-dvd-svgrepo-com.svg",
  shirt: "/svg/game/shirt-svgrepo-com.svg",
  hoodie: "/svg/game/hoodie-svgrepo-com.svg",
};

const PICK_LABEL: Partial<Record<PrizeId, string>> = {
  pick_x1: "×1",
  pick_x2: "×2",
  pick_x4: "×4",
  pick_x8: "×8",
  pick_x10: "×10",
};

function buildConicBackground(): string {
  const parts: string[] = [];
  for (let i = 0; i < NUM_SECTORS; i++) {
    const id = SECTOR_PRIZES[i];
    const [min, max] = sectorAngleRange(i);
    parts.push(`${SECTOR_TINT[id]} ${min}deg ${max}deg`);
  }
  return `conic-gradient(from 0deg at 50% 50%, ${parts.join(", ")})`;
}

function sectorHighlightGradient(sectorIndex: number): string {
  const [min, max] = sectorAngleRange(sectorIndex);
  return `conic-gradient(from 0deg at 50% 50%, 
    transparent 0deg ${min}deg, 
    rgba(255, 240, 120, 0.65) ${min}deg ${max}deg, 
    transparent ${max}deg 360deg)`;
}

const EASE_DECEL: [number, number, number, number] = [0.12, 0.75, 0.08, 1];

/** Centro del icono de premio (hacia el surco) */
const ICON_RADIUS_PCT = 36;
/** Multiplicadores: un poco más hacia el borde (siempre “debajo” de la púa en sentido radial) */
const PICK_LABEL_RADIUS_PCT = 42.5;

function slotAtRadius(angleDeg: number, radiusPct: number): CSSProperties {
  const rad = (angleDeg * Math.PI) / 180;
  const x = Math.sin(rad) * radiusPct;
  const y = -Math.cos(rad) * radiusPct;
  return {
    left: `calc(50% + ${x}%)`,
    top: `calc(50% + ${y}%)`,
    transform: "translate(-50%, -50%)",
  };
}

type Props = {
  adminUnlimited: boolean;
};

export function EgunerokoSariaGame({ adminUnlimited }: Props) {
  const t = useTranslations("premium.egunerokoSaria");

  const rotationMv = useMotionValue(0);
  const rotationRef = useRef(0);
  const [phase, setPhase] = useState<"idle" | "spinning" | "result">("idle");
  const [prize, setPrize] = useState<PrizeId | null>(null);
  const [flashSector, setFlashSector] = useState<number | null>(null);

  const conicBackground = useMemo(() => buildConicBackground(), []);

  const prizeLabel = useCallback(
    (id: PrizeId) => {
      const key = `prizes.${id}` as const;
      return t(key);
    },
    [t]
  );

  const finishSpin = useCallback(
    (won: PrizeId, sectorIndex: number) => {
      setPhase("result");
      setPrize(won);
      setFlashSector(sectorIndex);
      if (!adminUnlimited && typeof window !== "undefined") {
        writeLastPlayToStorage();
      }
    },
    [adminUnlimited]
  );

  const handlePlay = useCallback(() => {
    if (phase === "spinning") return;
    setFlashSector(null);
    setPhase("spinning");
    setPrize(null);

    const { prize: won, sectorIndex } = drawOutcome();
    const angleOnWheel = targetAngleForSector(sectorIndex);
    const current = rotationRef.current;
    const next = computeFinalRotation(current, angleOnWheel, 5, 9);
    rotationRef.current = next;

    void (async () => {
      try {
        await animate(rotationMv, next, {
          duration: 5.85,
          ease: EASE_DECEL,
        });
        finishSpin(won, sectorIndex);
      } catch {
        /* animación cancelada */
      }
    })();
  }, [phase, rotationMv, finishSpin]);

  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-[#0a0a0a]">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(rgba(230,0,38,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(230,0,38,0.5) 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_20%,rgba(230,0,38,0.12)_0%,transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_80%_80%,rgba(255,180,40,0.08)_0%,transparent_50%)]" />

      <div className="relative z-10 mx-auto flex min-h-[100dvh] max-w-[1600px] flex-col items-center px-3 pb-10 pt-4 sm:px-6 lg:px-10">
        <div className="mb-2 text-center">
          <h1 className="font-display text-2xl tracking-tighter text-punk-white sm:text-4xl lg:text-5xl">
            <span className="bg-gradient-to-r from-punk-red via-[#ffd700] to-punk-red bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(230,0,38,0.5)]">
              {t("title")}
            </span>
          </h1>
          <p className="mt-1.5 font-body text-sm text-punk-white/55 sm:text-base">{t("subtitle")}</p>
        </div>

        <div className="relative mt-2 flex w-full max-w-[min(100vw,96vmin)] flex-1 items-center justify-center lg:max-w-[min(92vw,min(88vh,920px))]">
          <div
            className="absolute inset-0 m-auto aspect-square w-full max-w-[min(96vw,96vmin)] rounded-full border-2 border-[#2a1a0a] bg-gradient-to-b from-[#1a1510] via-[#0d0d0d] to-[#1a1510] shadow-[0_0_60px_rgba(0,0,0,0.85),inset_0_2px_8px_rgba(255,200,80,0.08)] lg:max-w-[min(92vw,min(88vh,920px))]"
            aria-hidden
          />
          <div className="absolute inset-0 m-auto aspect-square w-[98%] max-w-[min(94vw,94vmin)] rounded-full border border-[#ffd700]/20 lg:max-w-[min(90vw,min(86vh,900px))]" />

          <div className="relative z-[1] flex aspect-square w-full max-w-[min(94vw,94vmin)] items-center justify-center lg:max-w-[min(90vw,min(86vh,900px))]">
            <motion.div
              className="relative flex aspect-square w-full items-center justify-center rounded-full"
              style={{ rotate: rotationMv }}
            >
              <div
                className="absolute inset-[3%] rounded-full"
                style={{ background: conicBackground }}
              />
              <div
                className="absolute inset-[3%] rounded-full mix-blend-overlay opacity-90"
                style={{
                  background:
                    "radial-gradient(circle at 50% 50%, transparent 16%, rgba(0,0,0,0.45) 42%, rgba(0,0,0,0.82) 100%)",
                }}
              />

              <AnimatePresence>
                {phase === "result" && flashSector !== null && (
                  <motion.div
                    key={`flash-${flashSector}`}
                    className="absolute inset-[3%] z-[3] rounded-full"
                    style={{ background: sectorHighlightGradient(flashSector) }}
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: [0, 1, 0.88, 1, 0.72, 1],
                      filter: [
                        "brightness(1)",
                        "brightness(1.45)",
                        "brightness(1.2)",
                        "brightness(1.5)",
                        "brightness(1.15)",
                        "brightness(1.35)",
                      ],
                    }}
                    transition={{ duration: 1.35, times: [0, 0.12, 0.28, 0.45, 0.62, 1], ease: "easeOut" }}
                    exit={{ opacity: 0 }}
                  />
                )}
              </AnimatePresence>

              <img
                src={VINYL_SRC}
                alt=""
                className="relative z-[2] w-[92%] object-contain select-none"
                style={{ filter: `${NEON_RED} brightness(0.95) contrast(1.08)` }}
                draggable={false}
              />

              {Array.from({ length: NUM_SECTORS }, (_, i) => {
                const id = SECTOR_PRIZES[i];
                const deg = sectorCenterAngleDeg(i);
                const pickTag = PICK_LABEL[id];
                const iconFilter = id.startsWith("pick")
                  ? `${NEON_GOLD} brightness(1.05)`
                  : PREMIUM_ICON_FILTER;
                return (
                  <Fragment key={`s-${i}-${id}`}>
                    <div
                      className="absolute z-[4] flex h-[clamp(32px,10vmin,64px)] w-[clamp(32px,10vmin,64px)] items-center justify-center rounded-full bg-black/35 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] ring-1 ring-white/10"
                      style={slotAtRadius(deg, ICON_RADIUS_PCT)}
                    >
                      <div
                        className="flex h-full w-full items-center justify-center"
                        style={{
                          transform: `rotate(${deg + 180}deg)`,
                          filter: iconFilter,
                        }}
                      >
                        <img
                          src={ICON_SRC[id]}
                          alt=""
                          className="h-[62%] w-[62%] object-contain"
                          draggable={false}
                        />
                      </div>
                    </div>
                    {pickTag && (
                      <span
                        className="absolute z-[4] font-punch text-[clamp(8px,2.4vmin,13px)] font-bold uppercase tracking-wider text-[#ffd89a] drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]"
                        style={{
                          ...slotAtRadius(deg, PICK_LABEL_RADIUS_PCT),
                          transform: `translate(-50%, -50%) rotate(${-deg}deg)`,
                        }}
                      >
                        {pickTag}
                      </span>
                    )}
                  </Fragment>
                );
              })}

              <div className="absolute left-1/2 top-1/2 z-[5] flex h-[min(22%,120px)] w-[min(22%,120px)] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-[#ffd700]/70 bg-[#0a0a0a] shadow-[0_0_24px_rgba(255,200,80,0.35)]">
                <div className="relative h-[82%] w-[82%]">
                  <Image
                    src="/logo.png"
                    alt="Nafarrock"
                    fill
                    className="object-contain p-0.5"
                    sizes="120px"
                    priority
                  />
                </div>
              </div>
            </motion.div>

            {/* Indicador fijo en 12h (no rota): marca la línea de lectura donde cae el sector ganador */}
            <div className="pointer-events-none absolute inset-0 z-[12]" aria-hidden>
              <div className="absolute left-1/2 top-0 flex -translate-x-1/2 flex-col items-center">
                <div
                  className="h-0 w-0 border-l-[11px] border-r-[11px] border-t-[16px] border-l-transparent border-r-transparent border-t-[#ffd60a]"
                  style={{
                    filter:
                      "drop-shadow(0 0 10px rgba(255,200,80,0.95)) drop-shadow(0 0 18px rgba(230,0,38,0.45))",
                  }}
                />
                <div
                  className="mt-px w-[3px] rounded-full bg-gradient-to-b from-[#ffd700]/95 via-[#ffd700]/50 to-transparent"
                  style={{ height: "min(11vmin, 11%)" }}
                />
              </div>
              <div
                className="absolute left-1/2 z-[1] h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#ffd700]/80 bg-punk-red/90 shadow-[0_0_12px_rgba(255,200,80,0.9)]"
                style={{ top: `calc(50% - ${ICON_RADIUS_PCT}%)` }}
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex w-full max-w-lg flex-col items-center gap-1 sm:mt-8">
          <AnimatePresence mode="wait">
            {phase === "result" && prize && (
              <motion.div
                key="win"
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                className="w-full rounded-xl border border-punk-green/40 bg-punk-green/[0.08] px-4 py-3 text-center shadow-[0_0_24px_rgba(0,200,83,0.15)] backdrop-blur-sm sm:px-6 sm:py-4"
              >
                <p className="font-display text-base text-punk-white sm:text-lg">
                  {t("winMessage", { prize: prizeLabel(prize) })}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            type="button"
            disabled={phase === "spinning"}
            onClick={handlePlay}
            className="relative mt-2 overflow-hidden border border-[#ffd700]/90 bg-gradient-to-b from-[#1a1510] to-[#0a0a0a] px-8 py-3.5 font-punch text-xs uppercase tracking-[0.3em] text-[#ffd700] shadow-[0_0_20px_rgba(255,200,80,0.25)] transition-all hover:shadow-[0_0_32px_rgba(255,200,80,0.45)] disabled:cursor-not-allowed disabled:opacity-50 sm:px-10 sm:py-4 sm:text-sm sm:tracking-[0.35em]"
            whileHover={phase !== "spinning" ? { scale: 1.02 } : {}}
            whileTap={phase !== "spinning" ? { scale: 0.98 } : {}}
          >
            <span className="relative z-10">
              {phase === "spinning" ? t("spinning") : t("play")}
            </span>
            <motion.span
              className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-[#ffd700]/12 to-transparent"
              animate={phase === "spinning" ? { x: ["-100%", "200%"] } : {}}
              transition={{ repeat: Infinity, duration: 0.45, ease: "linear" }}
            />
          </motion.button>

          {adminUnlimited && (
            <p className="font-body text-[11px] text-punk-white/35">{t("adminMode")}</p>
          )}

          <Link
            href="/"
            className="mt-1 font-punch text-[11px] uppercase tracking-widest text-punk-white/35 transition-colors hover:text-punk-red"
          >
            ← {t("back")}
          </Link>
        </div>
      </div>
    </div>
  );
}
