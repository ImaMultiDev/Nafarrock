import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { getCSVTemplate } from "@/lib/csv-bands";

export async function GET() {
  try {
    await requireAdmin();
    const csv = getCSVTemplate();
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="plantilla-bandas-nafarrock.csv"',
      },
    });
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }
    return NextResponse.json(
      { message: "Error al generar plantilla" },
      { status: 500 }
    );
  }
}
