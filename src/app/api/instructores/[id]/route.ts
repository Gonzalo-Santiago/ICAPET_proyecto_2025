// src/app/api/instructores/[id]/route.ts

import { db } from "@/lib/db";
import { NextResponse } from "next/server";

// ---- GET: Detalle de un instructor
export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const query = `
      SELECT
        I.id,
        I.nombre,
        I.apellido_paterno,
        I.apellido_materno,
        CONCAT_WS(' ', I.nombre, I.apellido_paterno, I.apellido_materno) AS nombre_completo,
        I.email,
        I.telefono AS contacto,
        I.nivel_estudio AS nivel_maximo_estudios,
        I.area_estudio,
        I.UDC,
        I.residencia,
        I.comentario AS descripcion,
        I.RFC,
        I.CEDULA,
        I.INE,
        I.FOTOGRAFIA,
        I.CURP,
        GROUP_CONCAT(
          CONCAT(
            '{"id":', S.id,
            ',"campo_formacion":"', REPLACE(IFNULL(S.campo_formacion,''),'"','\\"'), '"',
            ',"especialidad":"', REPLACE(IFNULL(S.especialidad,''),'"','\\"'), '"',
            ',"curso":"', REPLACE(IFNULL(S.curso,''),'"','\\"'), '"',
            ',"status":"', REPLACE(IFNULL(ISX.status,''),'"','\\"'), '"}'
          ) SEPARATOR ','
        ) AS sectores_json
      FROM INSTRUCTORES I
      LEFT JOIN INSTRUCTOR_SECTOR ISX ON I.id = ISX.id_instructor
      LEFT JOIN SECTOR S ON ISX.id_sector = S.id
      WHERE I.id = ?
      GROUP BY I.id;
    `;

    const [rows]: any = await db.query(query, [id]);
    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: "Instructor no encontrado" }, { status: 404 });
    }

    const r = rows[0];
    const sectores = r.sectores_json ? JSON.parse(`[${r.sectores_json}]`) : [];

    const toBase64 = (b: Buffer | null): string | null => (b ? Buffer.from(b).toString("base64") : null);

    return NextResponse.json({
      id: r.id,
      nombre: r.nombre,
      apellido_paterno: r.apellido_paterno,
      apellido_materno: r.apellido_materno,
      nombre_completo: r.nombre_completo,
      email: r.email,
      contacto: r.contacto,
      nivel_maximo_estudios: r.nivel_maximo_estudios,
      area_estudio: r.area_estudio,
      UDC: r.UDC,
      residencia: r.residencia,
      descripcion: r.descripcion,
      rfc_base64: toBase64(r.RFC),
      cedula_base64: toBase64(r.CEDULA),
      ine_base64: toBase64(r.INE),
      fotografia_base64: toBase64(r.FOTOGRAFIA),
      curp_base64: toBase64(r.CURP),
      sectores,
    });
  } catch (e: any) {
    console.error("GET /api/instructores/[id]", e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// ---- PUT: Actualizar datos + documentos + sectores (reemplaza asociación completa)
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const formData = await req.formData();

    // Campos de texto
    const nombre = (formData.get("nombre") as string) ?? null;
    const apellido_paterno = (formData.get("apellido_paterno") as string) ?? null;
    const apellido_materno = (formData.get("apellido_materno") as string) ?? null;
    const email = (formData.get("email") as string) ?? null;
    const telefono = (formData.get("telefono") as string) ?? null;
    const nivel_estudio = (formData.get("nivel_estudio") as string) ?? null;
    const area_estudio = (formData.get("area_estudio") as string) ?? null;
    const UDC = (formData.get("UDC") as string) ?? null;
    const residencia = (formData.get("residencia") as string) ?? null;
    const comentario = (formData.get("comentario") as string) ?? null;

    // Helper para aceptar File o base64 string o null
    const processFile = async (fileData: any) => {
      if (!fileData) return null;
      if (typeof fileData === "string") return Buffer.from(fileData, "base64");
      if (fileData instanceof File) {
        const ab = await fileData.arrayBuffer();
        return Buffer.from(ab);
      }
      return null;
    };

    const rfc = await processFile(formData.get("rfc"));
    const curp = await processFile(formData.get("curp"));
    const cedula = await processFile(formData.get("cedula"));
    const ine = await processFile(formData.get("ine"));
    const fotografia = await processFile(formData.get("fotografia"));

    // Sectores
    const sectoresJson = (formData.get("sectores") as string) ?? "[]";
    let sectores: { id: number; status: string }[] = [];
    try {
      sectores = JSON.parse(sectoresJson);
    } catch {
      return NextResponse.json({ success: false, message: "Sectores inválidos" }, { status: 400 });
    }

    await db.query("START TRANSACTION");
    try {
      // Construir UPDATE dinámico
      let update = `UPDATE INSTRUCTORES SET nombre=?, apellido_paterno=?, apellido_materno=?, telefono=?, email=?, nivel_estudio=?, area_estudio=?, UDC=?, residencia=?, comentario=?`;
      const vals: any[] = [
        nombre,
        apellido_paterno,
        apellido_materno,
        telefono,
        email,
        nivel_estudio,
        area_estudio,
        UDC,
        residencia,
        comentario,
      ];

      if (rfc !== null) { update += ", RFC=?"; vals.push(rfc); }
      if (curp !== null) { update += ", CURP=?"; vals.push(curp); }
      if (cedula !== null) { update += ", CEDULA=?"; vals.push(cedula); }
      if (ine !== null) { update += ", INE=?"; vals.push(ine); }
      if (fotografia !== null) { update += ", FOTOGRAFIA=?"; vals.push(fotografia); }

      update += " WHERE id=?";
      vals.push(id);

      await db.query(update, vals);

      // Reemplazar asociaciones de sectores
      await db.query("DELETE FROM INSTRUCTOR_SECTOR WHERE id_instructor = ?", [id]);
      for (const s of sectores) {
        await db.query(
          `INSERT INTO INSTRUCTOR_SECTOR (id_instructor, id_sector, status) VALUES (?, ?, ?)`,
          [id, s.id, s.status]
        );
      }

      await db.query("COMMIT");
      return NextResponse.json({ success: true });
    } catch (e) {
      await db.query("ROLLBACK");
      throw e;
    }
  } catch (e: any) {
    console.error("PUT /api/instructores/[id]", e);
    return NextResponse.json({ success: false, message: "Error interno" }, { status: 500 });
  }
}

// ---- DELETE: Eliminar instructor y su información asociada
export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    await db.query("START TRANSACTION");
    try {
      // Eliminar relaciones en tablas asociadas
      await db.query("DELETE FROM INSTRUCTOR_SECTOR WHERE id_instructor = ?", [id]);

      // Eliminar al instructor
      const [result]: any = await db.query("DELETE FROM INSTRUCTORES WHERE id = ?", [id]);

      if (result.affectedRows === 0) {
        await db.query("ROLLBACK");
        return NextResponse.json({ success: false, message: "Instructor no encontrado" }, { status: 404 });
      }

      await db.query("COMMIT");
      return NextResponse.json({ success: true });
    } catch (e) {
      await db.query("ROLLBACK");
      throw e;
    }
  } catch (e: any) {
    console.error("DELETE /api/instructores/[id]", e);
    return NextResponse.json({ success: false, message: "Error interno" }, { status: 500 });
  }
}