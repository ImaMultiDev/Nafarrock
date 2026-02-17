/**
 * Genera slug URL-friendly a partir de un texto
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quitar acentos
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function uniqueSlug(
  checkExists: (slug: string) => Promise<boolean>,
  baseSlug: string
): Promise<string> {
  let slug = slugify(baseSlug);
  if (!slug) slug = "entity";
  let final = slug;
  let n = 0;
  while (await checkExists(final)) {
    n++;
    final = `${slug}-${n}`;
  }
  return final;
}
