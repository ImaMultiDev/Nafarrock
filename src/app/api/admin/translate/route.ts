import { NextResponse } from "next/server";
import { createHash } from "crypto";
import OpenAI from "openai";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { z } from "zod";

const MAX_TEXT_LENGTH = 4000;

const bodySchema = z.object({
  text: z.string().min(1).max(MAX_TEXT_LENGTH),
});

const SYSTEM_PROMPT = `Traduce el siguiente texto del castellano al euskera batua (euskara estándar).
- Mantén los nombres propios sin traducir (bandas, lugares, personas, marcas).
- Usa un tono natural para textos culturales o musicales.
- No cambies formato ni estructura (párrafos, listas).
- Devuelve solo la traducción, sin explicaciones ni comentarios.`;

export async function POST(req: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey?.trim()) {
    return NextResponse.json(
      { message: "Servicio de traducción no configurado" },
      { status: 503 }
    );
  }

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Texto inválido o demasiado largo" },
      { status: 400 }
    );
  }

  const { text } = parsed.data;
  const normalized = text.trim().toLowerCase();
  const sourceHash = createHash("sha256").update(normalized).digest("hex");

  try {
    const cached = await prisma.translationCache.findUnique({
      where: { sourceHash },
    });
    if (cached) {
      return NextResponse.json({ translated: cached.translatedText });
    }

    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: text },
      ],
      temperature: 0.3,
    });

    const translated = completion.choices[0]?.message?.content?.trim();
    if (!translated) {
      return NextResponse.json(
        { message: "No se pudo generar la traducción" },
        { status: 500 }
      );
    }

    await prisma.translationCache.create({
      data: { sourceHash, translatedText: translated },
    });

    return NextResponse.json({ translated });
  } catch (err) {
    console.error("[translate] OpenAI error:", err);
    return NextResponse.json(
      { message: "Error al traducir. Inténtalo de nuevo." },
      { status: 500 }
    );
  }
}
