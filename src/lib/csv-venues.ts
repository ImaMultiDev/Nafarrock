/**
 * Importación masiva de espacios/salas desde CSV
 * Validación y tipos para el flujo admin
 */

import { parse } from "csv-parse/sync";
import { z } from "zod";

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
  ciudad: z.string().min(1, "Ciudad obligatoria"),
  direccion: z.string().optional().default("").transform((v) => (v?.trim() ? v : null)),
  descripcion: z.string().optional().default("").transform((v) => (v?.trim() ? v : null)),
  web_url: urlSchema,
  maps_url: urlSchema,
  instagram_url: urlSchema,
  facebook_url: urlSchema,
});

export type VenueImportRow = z.infer<typeof rowSchema>;

export type RowValidationError = {
  row: number;
  message: string;
  field?: string;
};

export type CSVValidationResult = {
  valid: VenueImportRow[];
  errors: RowValidationError[];
};

const EXPECTED_HEADERS = [
  "nombre",
  "ciudad",
  "direccion",
  "descripcion",
  "web_url",
  "maps_url",
  "instagram_url",
  "facebook_url",
] as const;

const HEADER_ALIASES: Record<string, string> = {
  nombre: "nombre",
  ciudad: "ciudad",
  direccion: "direccion",
  direcció: "direccion",
  descripcion: "descripcion",
  descripción: "descripcion",
  "web(url)": "web_url",
  weburl: "web_url",
  web_url: "web_url",
  "maps(url)": "maps_url",
  mapsurl: "maps_url",
  maps_url: "maps_url",
  map_url: "maps_url",
  "instagram(url)": "instagram_url",
  instagramurl: "instagram_url",
  instagram_url: "instagram_url",
  "facebook(url)": "facebook_url",
  facebookurl: "facebook_url",
  facebook_url: "facebook_url",
};

function normalizeHeader(h: string): string {
  let out = h
    .replace(/^\uFEFF/, "") // BOM
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[()]/g, "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  return HEADER_ALIASES[out] ?? out;
}

export function parseCSVVenues(buffer: Buffer): CSVValidationResult {
  const valid: VenueImportRow[] = [];
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
      errors: [
        {
          row: 0,
          message: `Error al parsear CSV: ${e instanceof Error ? e.message : String(e)}`,
        },
      ],
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
    const h = headers[i];
    const mapped = HEADER_ALIASES[h] ?? h;
    if (EXPECTED_HEADERS.includes(mapped as (typeof EXPECTED_HEADERS)[number])) {
      headerMap[mapped] = i;
    }
  }

  // Mínimo: nombre y ciudad obligatorios
  const requiredHeaders = ["nombre", "ciudad"] as const;
  const missingHeaders = requiredHeaders.filter((h) => !(h in headerMap));
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
    for (const key of EXPECTED_HEADERS) {
      const idx = headerMap[key];
      rowObj[key] = idx !== undefined ? (rawRow[idx] ?? "") : "";
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

export function getCSVVenuesTemplate(): string {
  const headers =
    "Nombre,Ciudad,Dirección,Descripción,Web(URL),Maps(URL),Instagram(URL),Facebook(URL)";
  const example =
    "Zentral,Pamplona,Mercado de Santo Domingo s/n,\"El epicentro moderno del directo.\",https://zentralpamplona.com/,,https://www.instagram.com/zentralpamplona/,https://www.facebook.com/zentralpamplona";
  return `${headers}\n${example}`;
}
