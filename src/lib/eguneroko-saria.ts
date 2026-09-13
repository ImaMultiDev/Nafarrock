/**
 * Eguneroko Saria — sectores iguales en el vinilo (0° = arriba, horario).
 * Puntero fijo en 12h: al frenar, el centro del sector elegido coincide con la aguja.
 */

export type PrizeId =
  | "pick_x1"
  | "pick_x2"
  | "pick_x4"
  | "pick_x8"
  | "pick_x10"
  | "cd"
  | "shirt"
  | "hoodie";

/** Número de sectores iguales en el disco (360° / N cada uno) */
export const NUM_SECTORS = 16;

const DEG_PER_SECTOR = 360 / NUM_SECTORS;

/**
 * Reparto en 16 sectores: muchos ×1/×2, premios gordos separados.
 * Orden horario desde 12h: sector 0 = [0°, 22.5°), …
 */
export const SECTOR_PRIZES: readonly PrizeId[] = [
  "pick_x1",
  "pick_x2",
  "pick_x1",
  "pick_x4",
  "pick_x1",
  "pick_x2",
  "pick_x1",
  "pick_x10",
  "pick_x4",
  "pick_x1",
  "pick_x2",
  "shirt",
  "pick_x1",
  "pick_x8",
  "hoodie",
  "cd",
] as const;

const MS_PER_DAY = 24 * 60 * 60 * 1000;
export const STORAGE_KEY_LAST_PLAY = "nafarrock_eguneroko_saria_last_play";

/** [min, max) en grados para el sector i */
export function sectorAngleRange(i: number): [number, number] {
  const clamped = ((i % NUM_SECTORS) + NUM_SECTORS) % NUM_SECTORS;
  const min = clamped * DEG_PER_SECTOR;
  return [min, min + DEG_PER_SECTOR];
}

/** Centro del sector i (para icono y parada exacta) */
export function sectorCenterAngleDeg(i: number): number {
  const [min, max] = sectorAngleRange(i);
  return (min + max) / 2;
}

/**
 * Rotación total para que el punto del vinilo a `targetAngleDeg` quede en 12h.
 * Convención CSS: rotate positivo = horario. Tras girar R°, lo que estaba en T°
 * del vinilo pasa a (T+R) mod 360 en el espacio fijo; queremos T+R ≡ 0 ⇒ R ≡ −T.
 */
export function computeFinalRotation(
  currentRotation: number,
  targetAngleOnWheelDeg: number,
  minFullSpins: number,
  maxFullSpins: number
): number {
  const spins =
    minFullSpins +
    Math.floor(Math.random() * (maxFullSpins - minFullSpins + 1));
  const T = ((targetAngleOnWheelDeg % 360) + 360) % 360;
  const align = (360 - T) % 360;
  return currentRotation + spins * 360 + align;
}

export type DrawOutcome = {
  prize: PrizeId;
  sectorIndex: number;
};

/** Sorteo uniforme por sector (frecuencia ≈ reparto en SECTOR_PRIZES) */
export function drawOutcome(): DrawOutcome {
  const sectorIndex = Math.floor(Math.random() * NUM_SECTORS);
  const prize = SECTOR_PRIZES[sectorIndex];
  return { prize, sectorIndex };
}

/** Ángulo exacto de parada (centro del sector) — usar siempre este, no un rango aleatorio */
export function targetAngleForSector(sectorIndex: number): number {
  return sectorCenterAngleDeg(sectorIndex);
}

export function canPlayAgain(lastPlayIso: string | null): boolean {
  if (!lastPlayIso) return true;
  const last = new Date(lastPlayIso).getTime();
  if (Number.isNaN(last)) return true;
  return Date.now() - last >= MS_PER_DAY;
}

export function readLastPlayFromStorage(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(STORAGE_KEY_LAST_PLAY);
  } catch {
    return null;
  }
}

export function writeLastPlayToStorage(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_LAST_PLAY, new Date().toISOString());
  } catch {
    /* ignore */
  }
}

export function punkReactionIntensity(prize: PrizeId): 1 | 2 | 3 | 4 | 5 {
  if (prize === "pick_x10" || prize === "hoodie") return 5;
  if (prize === "pick_x8" || prize === "shirt") return 4;
  if (prize === "cd" || prize === "pick_x4") return 3;
  if (prize === "pick_x2") return 2;
  return 1;
}
