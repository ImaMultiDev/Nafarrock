import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { z } from "zod";
import { parseEventUrl } from "@/lib/event-url-parser";
import { extractEventIdFromUrl, getEventById } from "@/lib/ticketmaster";

const bodySchema = z.object({
  url: z.string().url().max(2000),
});

export type EventAutofillData = {
  title?: string;
  description?: string;
  imageUrl?: string;
  date?: string;
  endDate?: string;
  doorsOpen?: string;
  venueText?: string;
  price?: string;
  ticketUrl?: string;
  webUrl?: string;
};

function toDatetimeLocal(iso: string): string {
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  } catch {
    return "";
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { message: "URL inválida", data: null },
      { status: 400 }
    );
  }

  const url = parsed.data.url.trim();
  const urlHash = createHash("sha256").update(url.toLowerCase()).digest("hex");

  try {
    const cached = await prisma.eventAutofillCache.findUnique({
      where: { urlHash },
    });
    if (cached) {
      return NextResponse.json({ data: cached.data as EventAutofillData });
    }

    let parsedData = await parseEventUrl(url);

    if (!parsedData) {
      const apiKey = process.env.TICKETMASTER_API_KEY?.trim();
      const eventId = apiKey ? extractEventIdFromUrl(url) : null;

      if (eventId && apiKey) {
        const tmEvent = await getEventById(apiKey, eventId);
        if (tmEvent) {
          parsedData = {
            title: tmEvent.name,
            imageUrl: tmEvent.imageUrl ?? undefined,
            startDate: tmEvent.startDate ?? undefined,
            venueName: tmEvent.venueName ?? undefined,
            ticketUrl: tmEvent.url,
            webUrl: tmEvent.url,
          };
        }
      }

      if (!parsedData) {
        return NextResponse.json({
          data: null,
          message: "No se pudo extraer información de esta URL. Comprueba que sea una página de evento válida (Eventbrite, Ticketmaster, etc.).",
        });
      }
    }

    const data: EventAutofillData = {};

    if (parsedData.title) data.title = parsedData.title;
    if (parsedData.description) data.description = parsedData.description;
    if (parsedData.imageUrl) data.imageUrl = parsedData.imageUrl;
    if (parsedData.price) data.price = parsedData.price;
    if (parsedData.ticketUrl) data.ticketUrl = parsedData.ticketUrl;
    if (parsedData.webUrl) data.webUrl = parsedData.webUrl;

    if (parsedData.startDate) {
      data.date = toDatetimeLocal(parsedData.startDate);
      const minDate = new Date().toISOString().slice(0, 16);
      if (data.date && data.date < minDate) data.date = minDate;
    }
    if (parsedData.endDate) data.endDate = toDatetimeLocal(parsedData.endDate);

    if (parsedData.venueName) {
      data.venueText = parsedData.venueName.trim();
    }

    await prisma.eventAutofillCache.create({
      data: { urlHash, data: data as object },
    });

    return NextResponse.json({ data });
  } catch (err) {
    console.error("[event-autofill] Error:", err);
    return NextResponse.json(
      { data: null, message: "Error al procesar la URL. Inténtalo de nuevo." },
      { status: 500 }
    );
  }
}
