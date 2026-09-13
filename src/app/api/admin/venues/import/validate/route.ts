import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { parseCSVVenues } from "@/lib/csv-venues";

export async function POST(req: Request) {
  try {
    await requireAdmin();

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { message: "No se ha subido ningún archivo" },
        { status: 400 }
      );
    }

    if (!file.name.toLowerCase().endsWith(".csv")) {
      return NextResponse.json(
        { message: "El archivo debe ser un CSV (.csv)" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = parseCSVVenues(buffer);

    return NextResponse.json(result);
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }
    console.error("CSV validate venues:", e);
    return NextResponse.json(
      { message: "Error al validar el archivo" },
      { status: 500 }
    );
  }
}
