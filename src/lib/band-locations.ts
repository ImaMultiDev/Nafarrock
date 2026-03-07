import { z } from "zod";

/**
 * Territorios válidos para la localidad de bandas
 * Hegoalde: Nafarroa, Araba, Bizkaia, Gipuzkoa
 * Iparralde: Lapurdi, Nafarroa Beherea, Zuberoa
 */
export const BAND_LOCATIONS = [
  "Nafarroa",
  "Araba",
  "Bizkaia",
  "Gipuzkoa",
  "Lapurdi",
  "Nafarroa Beherea",
  "Zuberoa",
] as const;

export type BandLocation = (typeof BAND_LOCATIONS)[number];

export function isValidBandLocation(value: string | null | undefined): value is BandLocation {
  return value != null && BAND_LOCATIONS.includes(value as BandLocation);
}

/** Schema Zod para validar location de banda (opcional o uno de los 4 territorios) */
export const bandLocationSchema = z
  .union([z.enum(BAND_LOCATIONS), z.literal("")])
  .optional()
  .nullable()
  .transform((v) => (v === "" ? null : v));
