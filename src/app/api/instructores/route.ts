// src/app/api/personas/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const [rows]: any = await db.query(`
      SELECT 
        p.id_persona AS id,
        p.nombre_completo AS nombre,
        p.rfc,
        p.contacto AS tel,
        p.udc,
        p.nivel_maximo_estudios AS estudios,
        GROUP_CONCAT(DISTINCT s.nombre_sector) AS sectores,
        GROUP_CONCAT(DISTINCT e.nombre_especialidad) AS especialidades
      FROM Personas p
      LEFT JOIN Personas_Sectores ps ON p.id_persona = ps.id_persona
      LEFT JOIN Sectores s ON ps.id_sector = s.id_sector
      LEFT JOIN Personas_Especialidades pe ON p.id_persona = pe.id_persona
      LEFT JOIN Especialidades e ON pe.id_especialidad = e.id_especialidad
      GROUP BY p.id_persona, p.nombre_completo, p.rfc, p.contacto, p.udc, p.nivel_maximo_estudios
    `);

    // Convertimos los sectores y especialidades en arrays
    const formattedRows = rows.map((row: any) => ({
      ...row,
      sectores: row.sectores ? row.sectores.split(",") : [],
      especialidades: row.especialidades ? row.especialidades.split(",") : [],
    }));

    return NextResponse.json(formattedRows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al obtener instructores" }, { status: 500 });
  }
}
