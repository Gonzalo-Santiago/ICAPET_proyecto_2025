// src/app/api/instructores/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET: listar instructores
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
      GROUP BY p.id_persona
    `);

    const formatted = rows.map((row: any) => ({
      ...row,
      sectores: row.sectores ? row.sectores.split(",") : [],
      especialidades: row.especialidades ? row.especialidades.split(",") : [],
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    return NextResponse.json({ error: "Error en GET" }, { status: 500 });
  }
}

// POST: agregar nuevo instructor
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      nombre,
      rfc,
      tel,
      udc,
      estudios,
      sectores = [],
      especialidades = [],
    } = body;

    const [result]: any = await db.query(
      `INSERT INTO Personas (nombre_completo, rfc, contacto, udc, nivel_maximo_estudios)
       VALUES (?, ?, ?, ?, ?)`,
      [nombre, rfc, tel, udc, estudios]
    );

    const id = result.insertId;

    for (const sector of sectores) {
      const [sectorRow]: any = await db.query(`SELECT id_sector FROM Sectores WHERE nombre_sector = ?`, [sector]);
      if (sectorRow.length)
        await db.query(`INSERT INTO Personas_Sectores (id_persona, id_sector) VALUES (?, ?)`, [id, sectorRow[0].id_sector]);
    }

    for (const esp of especialidades) {
      const [espRow]: any = await db.query(`SELECT id_especialidad FROM Especialidades WHERE nombre_especialidad = ?`, [esp]);
      if (espRow.length)
        await db.query(`INSERT INTO Personas_Especialidades (id_persona, id_especialidad) VALUES (?, ?)`, [id, espRow[0].id_especialidad]);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error en POST" }, { status: 500 });
  }
}
