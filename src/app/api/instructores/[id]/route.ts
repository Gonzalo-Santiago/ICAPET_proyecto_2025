// src/app/api/instructores/[id]/route.ts
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const {
      nombre,
      rfc,
      tel,
      udc,
      estudios,
      sectores = [],
      especialidades = [],
    } = await req.json();

    await db.query(
      `UPDATE Personas SET nombre_completo = ?, rfc = ?, contacto = ?, udc = ?, nivel_maximo_estudios = ? WHERE id_persona = ?`,
      [nombre, rfc, tel, udc, estudios, id]
    );

    await db.query(`DELETE FROM Personas_Sectores WHERE id_persona = ?`, [id]);
    await db.query(`DELETE FROM Personas_Especialidades WHERE id_persona = ?`, [id]);

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
    return NextResponse.json({ error: "Error en PUT" }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    await db.query(`DELETE FROM Personas_Sectores WHERE id_persona = ?`, [id]);
    await db.query(`DELETE FROM Personas_Especialidades WHERE id_persona = ?`, [id]);
    await db.query(`DELETE FROM Personas WHERE id_persona = ?`, [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Error en DELETE" }, { status: 500 });
  }
}
