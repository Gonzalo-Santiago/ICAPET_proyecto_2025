/**Programador: Gonzalo Santiago Garcia
 * Fecha: 13/08/2025
 * Descripcion: Se encarga de filtrar los datos del instructor
 */


// /src/app/api/filtros/route.ts
/*import { db } from "@/lib/db";
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
}*/
// /src/app/api/filtros/route.ts
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const campo = searchParams.get("campo_formacion");
  const especialidad = searchParams.get("especialidad");

  try {
    let query = `
      SELECT DISTINCT 
        S.campo_formacion, 
        S.especialidad, 
        S.curso,
        I.comentario
      FROM SECTOR S
      LEFT JOIN INSTRUCTOR_SECTOR ISX ON S.id = ISX.id_sector
      LEFT JOIN INSTRUCTORES I ON ISX.id_instructor = I.id
    `;

    const conditions = [];
    const values: any[] = [];

    if (campo && campo !== "Todos los campos") {
      conditions.push("S.campo_formacion = ?");
      values.push(campo);
    }
    if (especialidad && especialidad !== "Todas las especialidades") {
      conditions.push("S.especialidad = ?");
      values.push(especialidad);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    const [rows] = await db.query(query, values);

    const campoSet = new Set<string>();
    const especialidadSet = new Set<string>();
    const cursoSet = new Set<string>();
    const comentarioSet = new Set<string>();

    for (const row of rows as any[]) {
      if (row.campo_formacion) campoSet.add(row.campo_formacion);
      if (row.especialidad) especialidadSet.add(row.especialidad);
      if (row.curso) cursoSet.add(row.curso);
      if (row.comentario) comentarioSet.add(row.comentario);
    }

    return NextResponse.json({
      campo_formacion: Array.from(campoSet),
      especialidad: Array.from(especialidadSet),
      curso: Array.from(cursoSet),
      comentario: Array.from(comentarioSet), // 👈 ahora incluye comentarios
    });
  } catch (error: any) {
    console.error("Error en filtros:", error.message);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
