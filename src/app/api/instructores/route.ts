/**En esta parte hace la consulta todos los campos del instructor */


// /src/app/api/instructores/route.ts
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const nombre = searchParams.get("nombre") || "";
    const campo_formacion = searchParams.get("campo_formacion") || "Todos los campos";
    const especialidad = searchParams.get("especialidad") || "Todas las especialidades";
    const curso = searchParams.get("curso") || "Todos los cursos";

    let query = `
            SELECT
                I.id,
                I.nombre,
                I.apellido_paterno,
                I.apellido_materno,
                CONCAT_WS(' ', I.nombre, I.apellido_paterno, I.apellido_materno) AS nombre_completo,
                GROUP_CONCAT(DISTINCT S.campo_formacion) AS campos_formacion,
                GROUP_CONCAT(DISTINCT S.especialidad) AS especialidades,
                GROUP_CONCAT(DISTINCT S.curso) AS cursos,
                GROUP_CONCAT(DISTINCT ISX.status) AS status_cursos
            FROM INSTRUCTORES I
            LEFT JOIN INSTRUCTOR_SECTOR ISX ON I.id = ISX.id_instructor
            LEFT JOIN SECTOR S ON ISX.id_sector = S.id
        `;

    const conditions = [];
    const values = [];

    if (nombre) {
      conditions.push("CONCAT_WS(' ', I.nombre, I.apellido_paterno, I.apellido_materno) LIKE ?");
      values.push(`%${nombre}%`);
    }

    if (campo_formacion !== "Todos los campos") {
      conditions.push("S.campo_formacion = ?");
      values.push(campo_formacion);
    }

    if (especialidad !== "Todas las especialidades") {
      conditions.push("S.especialidad = ?");
      values.push(especialidad);
    }

    if (curso !== "Todos los cursos") {
      conditions.push("S.curso = ?");
      values.push(curso);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    query += " GROUP BY I.id";

    const [rows] = await db.query(query, values);

    if (!rows) {
      return NextResponse.json([]);
    }

    const formattedInstructores = (rows as any[]).map(row => ({
      ...row,
      sectores: [{
        campo_formacion: row.campos_formacion ? row.campos_formacion.split(',')[0] : null,
        especialidad: row.especialidades ? row.especialidades.split(',')[0] : null,
        curso: row.cursos ? row.cursos.split(',')[0] : null,
        status: row.status_cursos ? row.status_cursos.split(',')[0] : null
      }]
    }));

    return NextResponse.json(formattedInstructores);

  } catch (error: any) {
    console.error("Error en GET /api/instructores:", error.message);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}