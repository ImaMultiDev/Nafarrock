/**
 * Patrones de validación habituales para email, URLs y contraseñas.
 */

/** Email: patrón común que evita formatos inválidos (ej. "a@b" pasa, "a@@" no) */
export const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;

export function isValidEmail(email: string): boolean {
  if (!email || email.length > 254) return false;
  return EMAIL_REGEX.test(email.trim());
}

/** URLs de redes sociales habituales: instagram, facebook, youtube, spotify, bandcamp, twitter/x, web genérica */
const SOCIAL_URL_PATTERNS = [
  /^https?:\/\/(www\.)?(instagram\.com|instagr\.am)\/.+/i,
  /^https?:\/\/(www\.)?(facebook\.com|fb\.com|fb\.me)\/.+/i,
  /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/.+/i,
  /^https?:\/\/(open\.)?spotify\.com\/.+/i,
  /^https?:\/\/([\w-]+\.)?bandcamp\.com\/.+/i,
  /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/.+/i,
  /^https?:\/\/.+/i, // Web genérica
];

export function isValidUrl(value: string): boolean {
  if (!value || value.trim() === "") return true;
  try {
    const url = new URL(value.trim());
    if (!["http:", "https:"].includes(url.protocol)) return false;
    return SOCIAL_URL_PATTERNS.some((p) => p.test(value.trim()));
  } catch {
    return false;
  }
}

/** Validación más estricta para webs genéricas */
export function isValidWebsiteUrl(value: string): boolean {
  if (!value || value.trim() === "") return true;
  try {
    const url = new URL(value.trim());
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
}

export type PasswordStrength = "weak" | "fair" | "good" | "strong";

const MIN_PASSWORD_LENGTH = 8;

export function getPasswordStrength(password: string): PasswordStrength {
  if (!password || password.length < MIN_PASSWORD_LENGTH) return "weak";
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  if (score <= 2) return "weak";
  if (score <= 3) return "fair";
  if (score <= 4) return "good";
  return "strong";
}

export function getPasswordStrengthLabel(s: PasswordStrength): string {
  return { weak: "Débil", fair: "Aceptable", good: "Buena", strong: "Fuerte" }[s];
}

export function getPasswordStrengthColor(s: PasswordStrength): string {
  return {
    weak: "bg-punk-red",
    fair: "bg-amber-500",
    good: "bg-punk-green",
    strong: "bg-punk-green",
  }[s];
}

/** Requisitos mínimos para contraseña válida */
export function getPasswordRequirements(password: string): { met: boolean; label: string }[] {
  return [
    { met: password.length >= MIN_PASSWORD_LENGTH, label: `Mínimo ${MIN_PASSWORD_LENGTH} caracteres` },
    { met: /[a-z]/.test(password), label: "Una minúscula" },
    { met: /[A-Z]/.test(password), label: "Una mayúscula" },
    { met: /\d/.test(password), label: "Un número" },
    { met: /[^a-zA-Z0-9]/.test(password), label: "Un carácter especial" },
  ];
}

export function isPasswordValid(password: string): boolean {
  return getPasswordRequirements(password).every((r) => r.met);
}
