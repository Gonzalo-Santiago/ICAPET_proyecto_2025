// src/app/api/instructores/[id]/route.ts
/*import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const { id: instructorId } = params;

    if (!instructorId) {
      return NextResponse.json({ error: "ID de instructor no proporcionado" }, { status: 400 });
    }

    const query = `
      SELECT
        I.*,
        I.comentario AS descripcion,
        CONCAT_WS(' ', I.nombre, I.apellido_paterno, I.apellido_materno) AS nombre_completo,
        I.telefono AS contacto,
        I.nivel_estudio AS nivel_maximo_estudios,
        I.RFC AS rfc_base64,
        I.CEDULA AS cedula_base64,
        I.INE AS ine_base64,
        I.FOTOGRAFIA AS fotografia_base64,
        I.CURP AS curp_base64,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'campo_formacion', S.campo_formacion,
            'especialidad', S.especialidad,
            'curso', S.curso,
            'status', ISX.status
          )
        ) AS sectores
      FROM INSTRUCTORES I
      LEFT JOIN INSTRUCTOR_SECTOR ISX ON I.id = ISX.id_instructor
      LEFT JOIN SECTOR S ON ISX.id_sector = S.id
      WHERE I.id = ?
      GROUP BY I.id
    `;

    const [rows] = await db.query(query, [instructorId]);

    if (!rows || (rows as any[]).length === 0) {
      return NextResponse.json({ error: "Instructor no encontrado" }, { status: 404 });
    }

    const instructor = (rows as any[])[0];
    const formattedSectores = instructor.sectores && instructor.sectores[0]?.campo_formacion ? instructor.sectores : [];

    return NextResponse.json({ ...instructor, sectores: formattedSectores });
  } catch (error: any) {
    console.error("Error en GET /api/instructores/[id]:", error.message);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  const formData = await req.formData();

  const fields = [
    'nombre', 'apellido_paterno', 'apellido_materno',
    'email', 'telefono',
    'nivel_estudio', 'area_estudio', 'UDC', 'residencia', 'comentario'
  ];
  const values = fields.map(f => formData.get(f) as string);

  const toBuffer = async (file: File | null) => file ? Buffer.from(await file.arrayBuffer()) : null;

  const rfc = await toBuffer(formData.get('rfc') as File | null);
  const curp = await toBuffer(formData.get('curp') as File | null);
  const cedula = await toBuffer(formData.get('cedula') as File | null);
  const ine = await toBuffer(formData.get('ine') as File | null);
  const fotografia = await toBuffer(formData.get('fotografia') as File | null);

  const sectoresJson = formData.get('sectores') as string;
  let sectores: { id: number; status: string }[] = [];
  try {
    sectores = JSON.parse(sectoresJson);
  } catch {
    return NextResponse.json({ success: false, message: 'Sectores inválidos' }, { status: 400 });
  }

  try {
    await db.query(
      `UPDATE INSTRUCTORES SET
        nombre=?, apellido_paterno=?, apellido_materno=?, email=?, telefono=?,
        nivel_estudio=?, area_estudio=?, UDC=?, residencia=?, comentario=?
        ${rfc ? ', RFC=?' : ''}${curp ? ', CURP=?' : ''}${cedula ? ', CEDULA=?' : ''}
        ${ine ? ', INE=?' : ''}${fotografia ? ', FOTOGRAFIA=?' : ''} WHERE id=?
      `,
      [
        ...values,
        ...(rfc ? [rfc] : []),
        ...(curp ? [curp] : []),
        ...(cedula ? [cedula] : []),
        ...(ine ? [ine] : []),
        ...(fotografia ? [fotografia] : []),
        id,
      ]
    );

    await db.query('DELETE FROM INSTRUCTOR_SECTOR WHERE id_instructor = ?', [id]);

    for (const sec of sectores) {
      await db.query(
        'INSERT INTO INSTRUCTOR_SECTOR (id_instructor, id_sector, status) VALUES (?, ?, ?)',
        [id, sec.id, sec.status]
      );
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Error updating instructor', e);
    return NextResponse.json({ error: 'Error al actualizar instructor' }, { status: 500 });
  }
}*/

/*import { db } from "@/lib/db";
import { NextResponse } from "next/server";

// ✅ GET: Obtener un instructor por ID
export async function GET(req: Request, context: { params: { id: string } }) {
  try {
    const instructorId = context.params.id;

    if (!instructorId) {
      return NextResponse.json({ error: "ID de instructor no proporcionado" }, { status: 400 });
    }

    const query = `
      SELECT
        I.*,
        I.comentario AS descripcion,
        CONCAT_WS(' ', I.nombre, I.apellido_paterno, I.apellido_materno) AS nombre_completo,
        I.telefono AS contacto,
        I.nivel_estudio AS nivel_maximo_estudios,
        I.RFC AS rfc_base64,
        I.CEDULA AS cedula_base64,
        I.INE AS ine_base64,
        I.FOTOGRAFIA AS fotografia_base64,
        I.CURP AS curp_base64,
        GROUP_CONCAT(
          CONCAT(
            '{"campo_formacion":"', S.campo_formacion,
            '","especialidad":"', S.especialidad,
            '","curso":"', S.curso,
            '","status":"', ISX.status, '"}'
          ) SEPARATOR ','
        ) AS sectores_json
      FROM INSTRUCTORES I
      LEFT JOIN INSTRUCTOR_SECTOR ISX ON I.id = ISX.id_instructor
      LEFT JOIN SECTOR S ON ISX.id_sector = S.id
      WHERE I.id = ?
      GROUP BY I.id
    `;

    const [rows] = await db.query(query, [instructorId]);

    if (!rows || (rows as any[]).length === 0) {
      return NextResponse.json({ error: "Instructor no encontrado" }, { status: 404 });
    }

    const instructor = (rows as any[])[0];
    const sectores = instructor.sectores_json
      ? JSON.parse(`[${instructor.sectores_json}]`)
      : [];

    return NextResponse.json({ ...instructor, sectores });
  } catch (error: any) {
    console.error("Error en GET /api/instructores/[id]:", error.message);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// ✅ PUT: Actualizar un instructor por ID
export async function PUT(req: Request, context: { params: { id: string } }) {
  const id = context.params.id;
  const formData = await req.formData();

  const fields = [
    "nombre", "apellido_paterno", "apellido_materno",
    "email", "telefono",
    "nivel_estudio", "area_estudio", "UDC", "residencia", "comentario"
  ];
  const values = fields.map(f => formData.get(f) as string);

  const toBuffer = async (file: File | null) => file ? Buffer.from(await file.arrayBuffer()) : null;

  const rfc = await toBuffer(formData.get("rfc") as File | null);
  const curp = await toBuffer(formData.get("curp") as File | null);
  const cedula = await toBuffer(formData.get("cedula") as File | null);
  const ine = await toBuffer(formData.get("ine") as File | null);
  const fotografia = await toBuffer(formData.get("fotografia") as File | null);

  const sectoresJson = formData.get("sectores") as string;
  let sectores: { id: number; status: string }[] = [];
  try {
    sectores = JSON.parse(sectoresJson);
  } catch {
    return NextResponse.json({ success: false, message: "Sectores inválidos" }, { status: 400 });
  }

  try {
    await db.query(
      `UPDATE INSTRUCTORES SET
        nombre=?, apellido_paterno=?, apellido_materno=?, email=?, telefono=?,
        nivel_estudio=?, area_estudio=?, UDC=?, residencia=?, comentario=?
        ${rfc ? ", RFC=?" : ""}${curp ? ", CURP=?" : ""}${cedula ? ", CEDULA=?" : ""}
        ${ine ? ", INE=?" : ""}${fotografia ? ", FOTOGRAFIA=?" : ""} WHERE id=?`,
      [
        ...values,
        ...(rfc ? [rfc] : []),
        ...(curp ? [curp] : []),
        ...(cedula ? [cedula] : []),
        ...(ine ? [ine] : []),
        ...(fotografia ? [fotografia] : []),
        id,
      ]
    );

    await db.query("DELETE FROM INSTRUCTOR_SECTOR WHERE id_instructor = ?", [id]);

    for (const sec of sectores) {
      await db.query(
        "INSERT INTO INSTRUCTOR_SECTOR (id_instructor, id_sector, status) VALUES (?, ?, ?)",
        [id, sec.id, sec.status]
      );
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Error updating instructor", e);
    return NextResponse.json({ error: "Error al actualizar instructor" }, { status: 500 });
  }
}
*/

import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: instructorId } = await context.params; // 👈 await obligatorio

    if (!instructorId) {
      return NextResponse.json(
        { error: "ID de instructor no proporcionado" },
        { status: 400 }
      );
    }

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
        I.RFC AS rfc_base64,
        I.CEDULA AS cedula_base64,
        I.INE AS ine_base64,
        I.FOTOGRAFIA AS fotografia_base64,
        I.CURP AS curp_base64,
        GROUP_CONCAT(
          CONCAT(
            '{"campo_formacion":"', S.campo_formacion,
            '","especialidad":"', S.especialidad,
            '","curso":"', S.curso,
            '","status":"', ISX.status, '"}'
          ) SEPARATOR ','
        ) AS sectores_json
      FROM INSTRUCTORES I
      LEFT JOIN INSTRUCTOR_SECTOR ISX ON I.id = ISX.id_instructor
      LEFT JOIN SECTOR S ON ISX.id_sector = S.id
      WHERE I.id = ?
      GROUP BY I.id
    `;

    const [rows] = await db.query(query, [instructorId]);

    if (!rows || (rows as any[]).length === 0) {
      return NextResponse.json({ error: "Instructor no encontrado" }, { status: 404 });
    }

    const instructor = (rows as any[])[0];
    const sectores = instructor.sectores_json
      ? JSON.parse(`[${instructor.sectores_json}]`)
      : [];

    return NextResponse.json({ ...instructor, sectores });
  } catch (error: any) {
    console.error("Error en GET /api/instructores/[id]:", error.message);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

