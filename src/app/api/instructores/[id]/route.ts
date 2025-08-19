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

/*// src\app\api\instructores\[id]\route.ts
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



export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: instructorId } = await context.params;

    if (!instructorId) {
      return NextResponse.json(
        { error: "ID de instructor no proporcionado" },
        { status: 400 }
      );
    }

    const formData = await req.formData();

    // Campos de formulario
    const nombre = formData.get("nombre") as string;
    const apellido_paterno = formData.get("apellido_paterno") as string;
    const apellido_materno = formData.get("apellido_materno") as string;
    const email = formData.get("email") as string;
    const telefono = formData.get("telefono") as string;
    const nivel_estudio = formData.get("nivel_estudio") as string;
    const area_estudio = formData.get("area_estudio") as string;
    const UDC = formData.get("UDC") as string;
    const residencia = formData.get("residencia") as string;
    const comentario = formData.get("comentario") as string;

    // Función para procesar archivos - maneja tanto Files como strings
    const processFile = async (fileData: any) => {
      // Si es null o undefined, devolvemos null
      if (!fileData) return null;

      // Si es un string (base64), lo convertimos a Buffer
      if (typeof fileData === "string") {
        // Extraer solo la parte base64 del string data:application/pdf;base64,...
        const base64Data = fileData.split(',')[1] || fileData;
        return Buffer.from(base64Data, "base64");
      }
      // Si es un File, lo convertimos a Buffer
      else if (fileData instanceof File) {
        const arrayBuffer = await fileData.arrayBuffer();
        return Buffer.from(arrayBuffer);
      }
      // Si es otro tipo de objeto, devolvemos null
      return null;
    };

    // Procesar archivos
    const rfc = await processFile(formData.get("rfc"));
    const curp = await processFile(formData.get("curp"));
    const cedula = await processFile(formData.get("cedula"));
    const ine = await processFile(formData.get("ine"));
    const fotografia = await processFile(formData.get("fotografia"));

    // Sectores seleccionados
    const sectoresJson = formData.get("sectores") as string;
    let sectores: { id: number; status: string }[] = [];
    try {
      sectores = JSON.parse(sectoresJson);
    } catch (e) {
      return NextResponse.json(
        { success: false, message: "Sectores inválidos" },
        { status: 400 }
      );
    }

    // Iniciar transacción
    await db.query("START TRANSACTION");

    try {
      // Construir consulta UPDATE dinámicamente
      let updateQuery = `
        UPDATE INSTRUCTORES 
        SET nombre = ?, apellido_paterno = ?, apellido_materno = ?, 
            telefono = ?, email = ?, nivel_estudio = ?, area_estudio = ?, 
            UDC = ?, residencia = ?, comentario = ?
      `;

      const values: any[] = [
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

      // Agregar campos de archivo solo si se proporcionan
      if (rfc !== null) {
        updateQuery += ", RFC = ?";
        values.push(rfc);
      }
      if (curp !== null) {
        updateQuery += ", CURP = ?";
        values.push(curp);
      }
      if (cedula !== null) {
        updateQuery += ", CEDULA = ?";
        values.push(cedula);
      }
      if (ine !== null) {
        updateQuery += ", INE = ?";
        values.push(ine);
      }
      if (fotografia !== null) {
        updateQuery += ", FOTOGRAFIA = ?";
        values.push(fotografia);
      }

      updateQuery += " WHERE id = ?";
      values.push(instructorId);

      // Ejecutar la consulta de actualización
      await db.query(updateQuery, values);

      // Eliminar sectores existentes
      await db.query(
        "DELETE FROM INSTRUCTOR_SECTOR WHERE id_instructor = ?",
        [instructorId]
      );

      // Insertar nuevos sectores
      for (const sec of sectores) {
        await db.query(
          `INSERT INTO INSTRUCTOR_SECTOR (id_instructor, id_sector, status) VALUES (?, ?, ?)`,
          [instructorId, sec.id, sec.status]
        );
      }

      await db.query("COMMIT");
      return NextResponse.json({ success: true });
    } catch (error) {
      await db.query("ROLLBACK");
      throw error;
    }
  } catch (error: any) {
    console.error("Error en PUT /api/instructores/[id]:", error.message);
    return NextResponse.json(
      { success: false, message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}*/


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