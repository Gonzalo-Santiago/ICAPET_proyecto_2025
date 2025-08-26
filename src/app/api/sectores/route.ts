import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [rows]: any = await db.query("SELECT id, campo_formacion, especialidad, curso FROM SECTOR");
    return NextResponse.json(rows);
  } catch {
    return NextResponse.json({ error: "Error al obtener sectores" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { campo_formacion, especialidad, curso } = await request.json();
    if (!campo_formacion || !especialidad || !curso) {
      return NextResponse.json({ error: "Faltan campos requeridos." }, { status: 400 });
    }
    await db.query("INSERT INTO SECTOR (campo_formacion, especialidad, curso) VALUES (?, ?, ?)", [
      campo_formacion,
      especialidad,
      curso,
    ]);
    return NextResponse.json({ message: "Sector creado." }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Error al insertar sector" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID requerido." }, { status: 400 });

    const { campo_formacion, especialidad, curso } = await request.json();
    if (!campo_formacion || !especialidad || !curso) {
      return NextResponse.json({ error: "Faltan campos para actualizar." }, { status: 400 });
    }

    const [result]: any = await db.query(
      "UPDATE SECTOR SET campo_formacion=?, especialidad=?, curso=? WHERE id=?",
      [campo_formacion, especialidad, curso, id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Sector no encontrado." }, { status: 404 });
    }

    return NextResponse.json({ message: "Sector actualizado." });
  } catch {
    return NextResponse.json({ error: "Error al actualizar sector" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID requerido." }, { status: 400 });

    const [result]: any = await db.query("DELETE FROM SECTOR WHERE id=?", [id]);
    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Sector no encontrado." }, { status: 404 });
    }

    return NextResponse.json({ message: "Sector eliminado." });
  } catch {
    return NextResponse.json({ error: "Error al eliminar sector" }, { status: 500 });
  }
}
