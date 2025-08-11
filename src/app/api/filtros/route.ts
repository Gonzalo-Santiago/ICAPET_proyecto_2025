

// /src/app/api/filtros/route.ts
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const campo = searchParams.get("campo_formacion");
  const especialidad = searchParams.get("especialidad");

  try {
    let query = "SELECT DISTINCT campo_formacion, especialidad, curso FROM SECTOR";
    const conditions = [];
    const values = [];

    if (campo && campo !== "Todos los campos") {
      conditions.push("campo_formacion = ?");
      values.push(campo);
    }
    if (especialidad && especialidad !== "Todas las especialidades") {
      conditions.push("especialidad = ?");
      values.push(especialidad);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    const [rows] = await db.query(query, values);

    const campoSet = new Set<string>();
    const especialidadSet = new Set<string>();
    const cursoSet = new Set<string>();

    for (const row of rows as any[]) {
      if (row.campo_formacion) campoSet.add(row.campo_formacion);
      if (row.especialidad) especialidadSet.add(row.especialidad);
      if (row.curso) cursoSet.add(row.curso);
    }

    return NextResponse.json({
      campo_formacion: Array.from(campoSet),
      especialidad: Array.from(especialidadSet),
      curso: Array.from(cursoSet),
    });
  } catch (error: any) {
    console.error("Error en filtros:", error.message);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}