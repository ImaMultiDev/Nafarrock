/**
 * Importación masiva de bandas desde CSV
 * Validación y tipos para el flujo admin
 */

import { parse } from "csv-parse/sync";
import { z } from "zod";

export const GENRES = [
  "punk",
  "rock urbano",
  "grunge",
  "hardcore",
  "indie",
  "alternativo",
  "metal",
] as const;

export const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Activa" },
  { value: "PAUSED", label: "En pausa" },
  { value: "INACTIVE", label: "Inactiva" },
] as const;

const urlSchema = z
  .string()
  .optional()
  .transform((val) => (val?.trim() ? val : undefined))
  .refine(
    (val) => !val || z.string().url().safeParse(val).success,
    "URL inválida"
  );

const rowSchema = z.object({
  nombre: z.string().min(1, "Nombre obligatorio"),
  biografia: z.string().optional().default(""),
  logo_url: urlSchema,
  imagen_url: urlSchema,
  localidad: z.string().optional().default(""),
  año_fundacion: z
    .string()
    .optional()
    .transform((val) => {
      if (!val?.trim()) return undefined;
      const n = parseInt(val, 10);
      return isNaN(n) ? undefined : n;
    })
    .refine(
      (n) =>
        n === undefined ||
        (n >= 1900 && n <= new Date().getFullYear()),
      "Año inválido (1900-actual)"
    ),
  estado: z
    .string()
    .optional()
    .default("")
    .transform((v) => (v?.trim() ? v : "activa"))
    .pipe(z.enum(["activa", "en pausa", "inactiva", "ACTIVE", "PAUSED", "INACTIVE"]))
    .transform((v) => {
      const map: Record<string, "ACTIVE" | "PAUSED" | "INACTIVE"> = {
        activa: "ACTIVE",
        "en pausa": "PAUSED",
        inactiva: "INACTIVE",
        ACTIVE: "ACTIVE",
        PAUSED: "PAUSED",
        INACTIVE: "INACTIVE",
      };
      return map[v.toLowerCase()] ?? "ACTIVE";
    }),
  generos: z
    .string()
    .optional()
    .default("")
    .transform((val) => {
      const list = val
        .split(/[,;|]/)
        .map((g) => g.trim().toLowerCase())
        .filter(Boolean);
      return [...new Set(list)];
    })
    .refine(
      (list) =>
        list.every((g) => GENRES.includes(g as (typeof GENRES)[number])),
      (list) => ({
        message: `Géneros inválidos: ${list.filter((g) => !GENRES.includes(g as (typeof GENRES)[number])).join(", ")}. Válidos: ${GENRES.join(", ")}`,
      })
    ),
  spotify_url: urlSchema,
  instagram_url: urlSchema,
  youtube_url: urlSchema,
  web_url: urlSchema,
  merch_url: urlSchema,
});

export type BandImportRow = z.infer<typeof rowSchema>;

export type RowValidationError = {
  row: number;
  message: string;
  field?: string;
};

export type CSVValidationResult = {
  valid: BandImportRow[];
  errors: RowValidationError[];
};

const EXPECTED_HEADERS = [
  "nombre",
  "biografia",
  "logo_url",
  "imagen_url",
  "localidad",
  "año_fundacion",
  "estado",
  "generos",
  "spotify_url",
  "instagram_url",
  "youtube_url",
  "web_url",
  "merch_url",
];

const HEADER_ALIASES: Record<string, string> = {
  ano_fundacion: "año_fundacion",
  anio_fundacion: "año_fundacion",
  ao_fundacion: "año_fundacion", // ñ normalizado
};

function normalizeHeader(h: string): string {
  let out = h
    .replace(/^\uFEFF/, "") // BOM
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  return HEADER_ALIASES[out] ?? out;
}

export function parseCSVBands(buffer: Buffer): CSVValidationResult {
  const valid: BandImportRow[] = [];
  const errors: RowValidationError[] = [];

  let records: string[][];
  try {
    records = parse(buffer, {
      bom: true,
      skip_empty_lines: true,
      relax_column_count: true,
      trim: true,
    });
  } catch (e) {
    return {
      valid: [],
      errors: [{ row: 0, message: `Error al parsear CSV: ${e instanceof Error ? e.message : String(e)}` }],
    };
  }

  if (records.length === 0) {
    return {
      valid: [],
      errors: [{ row: 0, message: "El archivo CSV está vacío" }],
    };
  }

  const rawHeaders = records[0];
  const headers = rawHeaders.map(normalizeHeader);

  const headerMap: Record<string, number> = {};
  for (let i = 0; i < headers.length; i++) {
    const h = HEADER_ALIASES[headers[i]] ?? headers[i];
    if (EXPECTED_HEADERS.includes(h)) {
      headerMap[h] = i;
    }
  }

  const missingHeaders = EXPECTED_HEADERS.filter((h) => !(h in headerMap));
  if (missingHeaders.length > 0) {
    return {
      valid: [],
      errors: [
        {
          row: 1,
          message: `Faltan columnas obligatorias: ${missingHeaders.join(", ")}`,
        },
      ],
    };
  }

  for (let i = 1; i < records.length; i++) {
    const rowNum = i + 1;
    const rawRow = records[i];

    const rowObj: Record<string, string> = {};
    for (const [key, idx] of Object.entries(headerMap)) {
      rowObj[key] = rawRow[idx] ?? "";
    }

    const result = rowSchema.safeParse(rowObj);
    if (result.success) {
      valid.push(result.data);
    } else {
      const firstError = result.error.errors[0];
      errors.push({
        row: rowNum,
        message: firstError?.message ?? "Error de validación",
        field: firstError?.path?.[0] as string | undefined,
      });
    }
  }

  return { valid, errors };
}

export function getCSVTemplate(): string {
  const headers = EXPECTED_HEADERS.join(",");
  const example =
    "Ejemplo Banda,\"Biografía de ejemplo.\",https://res.cloudinary.com/xxx/logo.png,https://res.cloudinary.com/xxx/img.png,Pamplona,2015,activa,\"punk, rock urbano\",https://open.spotify.com/...,https://instagram.com/...,https://youtube.com/...,https://web.com,https://tienda.com";
  return `${headers}\n${example}`;
}
