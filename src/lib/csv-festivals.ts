/**
 * Importación masiva de festivales desde CSV
 * Perfil Festival + edición opcional (Event tipo FESTIVAL) si hay fechas
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

/** Acepta YYYY-MM-DD o DD/MM/YYYY → Date a medianoche UTC, o null si vacío */
function parseOptionalDate(raw: string | undefined): Date | null | "invalid" {
  const v = raw?.trim();
  if (!v) return null;

  // YYYY-MM-DD
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v);
  if (iso) {
    const y = Number(iso[1]);
    const m = Number(iso[2]);
    const d = Number(iso[3]);
    const date = new Date(Date.UTC(y, m - 1, d));
    if (
      date.getUTCFullYear() === y &&
      date.getUTCMonth() === m - 1 &&
      date.getUTCDate() === d
    ) {
      return date;
    }
    return "invalid";
  }

  // DD/MM/YYYY
  const eu = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(v);
  if (eu) {
    const d = Number(eu[1]);
    const m = Number(eu[2]);
    const y = Number(eu[3]);
    const date = new Date(Date.UTC(y, m - 1, d));
    if (
      date.getUTCFullYear() === y &&
      date.getUTCMonth() === m - 1 &&
      date.getUTCDate() === d
    ) {
      return date;
    }
    return "invalid";
  }

  return "invalid";
}

const dateFieldSchema = z
  .string()
  .optional()
  .default("")
  .superRefine((v, ctx) => {
    if (!v?.trim()) return;
    if (parseOptionalDate(v) === "invalid") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Fecha inválida (usa YYYY-MM-DD o DD/MM/YYYY)",
      });
    }
  })
  .transform((v) => {
    const parsed = parseOptionalDate(v);
    return parsed === "invalid" ? null : parsed;
  });

const imagesSchema = z
  .string()
  .optional()
  .default("")
  .transform((val) => {
    if (!val?.trim()) return [] as string[];
    return [
      ...new Set(
        val
          .split(/[|;]/)
          .map((u) => u.trim())
          .filter(Boolean)
      ),
    ];
  })
  .refine(
    (list) => list.every((u) => z.string().url().safeParse(u).success),
    "imagenes: cada valor debe ser una URL válida (separar con | o ;)"
  );

const floatOptional = z
  .string()
  .optional()
  .default("")
  .superRefine((val, ctx) => {
    if (!val?.trim()) return;
    const n = Number(val.replace(",", "."));
    if (!Number.isFinite(n)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Número inválido" });
    }
  })
  .transform((val) => {
    if (!val?.trim()) return null;
    const n = Number(val.replace(",", "."));
    return Number.isFinite(n) ? n : null;
  });

const rowSchema = z
  .object({
    nombre: z.string().min(1, "Nombre obligatorio"),
    ubicacion: z
      .string()
      .optional()
      .default("")
      .transform((v) => (v?.trim() ? v : null)),
    descripcion: z
      .string()
      .optional()
      .default("")
      .transform((v) => (v?.trim() ? v : null)),
    anio_fundacion: z
      .string()
      .optional()
      .default("")
      .superRefine((val, ctx) => {
        if (!val?.trim()) return;
        const n = parseInt(val, 10);
        if (
          Number.isNaN(n) ||
          n < 1900 ||
          n > new Date().getFullYear() + 1
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Año de fundación inválido (1900–actual)",
          });
        }
      })
      .transform((val) => {
        if (!val?.trim()) return null;
        const n = parseInt(val, 10);
        return Number.isNaN(n) ? null : n;
      }),
    fecha_inicio: dateFieldSchema,
    fecha_fin: dateFieldSchema,
    web_url: urlSchema,
    instagram_url: urlSchema,
    facebook_url: urlSchema,
    logo_url: urlSchema,
    imagenes: imagesSchema,
    latitud: floatOptional,
    longitud: floatOptional,
  })
  .superRefine((data, ctx) => {
    if (data.fecha_fin && !data.fecha_inicio) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "fecha_fin requiere fecha_inicio",
        path: ["fecha_fin"],
      });
    }
    if (data.fecha_inicio && data.fecha_fin && data.fecha_fin < data.fecha_inicio) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "fecha_fin debe ser ≥ fecha_inicio",
        path: ["fecha_fin"],
      });
    }
  });

export type FestivalImportRow = z.infer<typeof rowSchema>;

export type RowValidationError = {
  row: number;
  message: string;
  field?: string;
};

export type CSVValidationResult = {
  valid: FestivalImportRow[];
  errors: RowValidationError[];
};

const EXPECTED_HEADERS = [
  "nombre",
  "ubicacion",
  "descripcion",
  "anio_fundacion",
  "fecha_inicio",
  "fecha_fin",
  "web_url",
  "instagram_url",
  "facebook_url",
  "logo_url",
  "imagenes",
  "latitud",
  "longitud",
] as const;

const HEADER_ALIASES: Record<string, string> = {
  nombre: "nombre",
  ubicacion: "ubicacion",
  localizacion: "ubicacion",
  location: "ubicacion",
  ciudad: "ubicacion",
  descripcion: "descripcion",
  anio_fundacion: "anio_fundacion",
  ano_fundacion: "anio_fundacion",
  founded_year: "anio_fundacion",
  fecha_inicio: "fecha_inicio",
  fecha_inicio_edicion: "fecha_inicio",
  start_date: "fecha_inicio",
  fecha_fin: "fecha_fin",
  fecha_fin_edicion: "fecha_fin",
  end_date: "fecha_fin",
  "web(url)": "web_url",
  weburl: "web_url",
  web_url: "web_url",
  "instagram(url)": "instagram_url",
  instagramurl: "instagram_url",
  instagram_url: "instagram_url",
  "facebook(url)": "facebook_url",
  facebookurl: "facebook_url",
  facebook_url: "facebook_url",
  "logo(url)": "logo_url",
  logourl: "logo_url",
  logo_url: "logo_url",
  imagenes: "imagenes",
  images: "imagenes",
  fotos: "imagenes",
  latitud: "latitud",
  latitude: "latitud",
  lat: "latitud",
  longitud: "longitud",
  longitude: "longitud",
  lng: "longitud",
  lon: "longitud",
};

function normalizeHeader(h: string): string {
  let out = h
    .replace(/^\uFEFF/, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[()]/g, "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  return HEADER_ALIASES[out] ?? out;
}

export function parseCSVFestivals(buffer: Buffer): CSVValidationResult {
  const valid: FestivalImportRow[] = [];
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

  if (!("nombre" in headerMap)) {
    return {
      valid: [],
      errors: [
        {
          row: 1,
          message: "Falta la columna obligatoria: nombre",
        },
      ],
    };
  }

  for (let i = 1; i < records.length; i++) {
    const rowNum = i + 1;
    const rawRow = records[i];

    // Fila completamente vacía → saltar
    if (rawRow.every((c) => !c?.trim())) continue;

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

export function getCSVFestivalsTemplate(): string {
  const headers = [
    "Nombre",
    "Ubicacion",
    "Descripcion",
    "Anio_fundacion",
    "Fecha_inicio",
    "Fecha_fin",
    "Web(URL)",
    "Instagram(URL)",
    "Facebook(URL)",
    "Logo(URL)",
    "Imagenes",
    "Latitud",
    "Longitud",
  ].join(",");

  const example = [
    "Azkena Rock Festival",
    "Vitoria-Gasteiz",
    "\"Festival de rock en el norte.\"",
    "2002",
    "2026-06-18",
    "2026-06-20",
    "https://www.azkenarockfestival.com/",
    "https://www.instagram.com/azkenarockfestival/",
    "https://www.facebook.com/azkenarockfestival",
    "https://ejemplo.com/logo-azkena.png",
    "https://ejemplo.com/foto1.jpg|https://ejemplo.com/foto2.jpg",
    "42.8467",
    "-2.6716",
  ].join(",");

  return `${headers}\n${example}`;
}

/** Cabeceras canónicas para documentación (agente / operadores) */
export const FESTIVAL_CSV_SPEC = {
  required: ["nombre"] as const,
  optional: [
    "ubicacion",
    "descripcion",
    "anio_fundacion",
    "fecha_inicio",
    "fecha_fin",
    "web_url",
    "instagram_url",
    "facebook_url",
    "logo_url",
    "imagenes",
    "latitud",
    "longitud",
  ] as const,
  notes: {
    fecha_inicio:
      "Si se informa, se crea un Evento tipo FESTIVAL vinculado (sin bandas). Formatos: YYYY-MM-DD o DD/MM/YYYY.",
    fecha_fin: "Opcional; requiere fecha_inicio. Mismos formatos.",
    imagenes: "URLs separadas por | o ; (galería del perfil Festival).",
    logo_url: "URL del logo del festival.",
  },
} as const;
