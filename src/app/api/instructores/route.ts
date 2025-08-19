/*// src/app/api/instructores/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
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

  // Función para convertir File a Buffer
  const toBuffer = async (file: File | null) => {
    if (!file) return null;
    const arrayBuffer = await file.arrayBuffer();
    return Buffer.from(arrayBuffer);
  };

  const rfc = await toBuffer(formData.get("rfc") as File | null);
  const curp = await toBuffer(formData.get("curp") as File | null);
  const cedula = await toBuffer(formData.get("cedula") as File | null);
  const ine = await toBuffer(formData.get("ine") as File | null);
  const fotografia = await toBuffer(formData.get("fotografia") as File | null);

  // Sectores seleccionados (esperamos JSON string)
  const sectoresJson = formData.get("sectores") as string;
  let sectores: { id: number; status: "Formal" | "Informal" }[] = [];
  try {
    sectores = JSON.parse(sectoresJson);
  } catch (e) {
    return NextResponse.json({ success: false, message: "Sectores inválidos" }, { status: 400 });
  }

  try {
    // Insertar instructor
    const [result]: any = await db.query(
      `INSERT INTO INSTRUCTORES 
      (nombre, apellido_paterno, apellido_materno, RFC, CEDULA, INE, FOTOGRAFIA, CURP, telefono, email, nivel_estudio, area_estudio, UDC, residencia, comentario)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nombre,
        apellido_paterno,
        apellido_materno,
        rfc,
        cedula,
        ine,
        fotografia,
        curp,
        telefono,
        email,
        nivel_estudio,
        area_estudio,
        UDC,
        residencia,
        comentario,
      ]
    );

    const instructorId = result.insertId;

    // Insertar sectores relacionados
    for (const sec of sectores) {
      await db.query(
        `INSERT INTO INSTRUCTOR_SECTOR (id_instructor, id_sector, status) VALUES (?, ?, ?)`,
        [instructorId, sec.id, sec.status]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al guardar instructor", error);
    return NextResponse.json({ success: false, message: "Error de servidor" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const nombre = searchParams.get("nombre") || "";
    const campo_formacion = searchParams.get("campo_formacion") || "Todos los campos";
    const especialidad = searchParams.get("especialidad") || "Todas las especialidades";
    const curso = searchParams.get("curso") || "Todos los cursos";
    const comentario = searchParams.get("comentario") || ""; // ← nuevo

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

    if (comentario) { // ← nuevo filtro
      conditions.push("I.comentario LIKE ?");
      values.push(`%${comentario}%`);
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

    // Formatear la respuesta para incluir un array de sectores simplificado
    const formattedInstructores = (rows as any[]).map((row) => ({
      ...row,
      sectores: [
        {
          campo_formacion: row.campos_formacion ? row.campos_formacion.split(",")[0] : null,
          especialidad: row.especialidades ? row.especialidades.split(",")[0] : null,
          curso: row.cursos ? row.cursos.split(",")[0] : null,
          status: row.status_cursos ? row.status_cursos.split(",")[0] : null,
        },
      ],
    }));

    return NextResponse.json(formattedInstructores);
  } catch (error: any) {
    console.error("Error en GET /api/instructores:", error.message);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}*/

// src/app/api/instructores/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Definimos los tipos de status para asegurar la consistencia.
// Estos deben coincidir con el ENUM de la base de datos y con el array STATUS_OPTIONS del frontend.
type InstructorStatus =
  | "Experto Impírico"
  | "Experto con educación NO formal"
  | "Experto con Educación formal"
  | "Licenciatura"
  | "Maestría"
  | "Doctorado"
  | "Instructor en Territorios Bienestar"
  | "Capacitador de cursos Mujeres Transformando su Futuro";

export async function POST(req: Request) {
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

  // Función para convertir File a Buffer
  const toBuffer = async (file: File | null) => {
    if (!file) return null;
    const arrayBuffer = await file.arrayBuffer();
    return Buffer.from(arrayBuffer);
  };

  const rfc = await toBuffer(formData.get("rfc") as File | null);
  const curp = await toBuffer(formData.get("curp") as File | null);
  const cedula = await toBuffer(formData.get("cedula") as File | null);
  const ine = await toBuffer(formData.get("ine") as File | null);
  const fotografia = await toBuffer(formData.get("fotografia") as File | null);

  // Sectores seleccionados (esperamos JSON string)
  const sectoresJson = formData.get("sectores") as string;
  // ¡Aquí está la corrección! El tipo de status ahora coincide con el del frontend y la base de datos.
  let sectores: { id: number; status: InstructorStatus }[] = [];
  try {
    sectores = JSON.parse(sectoresJson);
  } catch (e) {
    return NextResponse.json({ success: false, message: "Sectores inválidos" }, { status: 400 });
  }

  try {
    // Insertar instructor
    const [result]: any = await db.query(
      `INSERT INTO INSTRUCTORES
       (nombre, apellido_paterno, apellido_materno, RFC, CEDULA, INE, FOTOGRAFIA, CURP, telefono, email, nivel_estudio, area_estudio, UDC, residencia, comentario)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nombre,
        apellido_paterno,
        apellido_materno,
        rfc,
        cedula,
        ine,
        fotografia,
        curp,
        telefono,
        email,
        nivel_estudio,
        area_estudio,
        UDC,
        residencia,
        comentario,
      ]
    );

    const instructorId = result.insertId;

    // Insertar sectores relacionados
    for (const sec of sectores) {
      await db.query(
        `INSERT INTO INSTRUCTOR_SECTOR (id_instructor, id_sector, status) VALUES (?, ?, ?)`,
        [instructorId, sec.id, sec.status]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al guardar instructor", error);
    return NextResponse.json({ success: false, message: "Error de servidor" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const nombre = searchParams.get("nombre") || "";
    const campo_formacion = searchParams.get("campo_formacion") || "Todos los campos";
    const especialidad = searchParams.get("especialidad") || "Todas las especialidades";
    const curso = searchParams.get("curso") || "Todos los cursos";
    const comentario = searchParams.get("comentario") || "";

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

    if (comentario) {
      conditions.push("I.comentario LIKE ?");
      values.push(`%${comentario}%`);
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

    // Formatear la respuesta para incluir un array de sectores simplificado
    const formattedInstructores = (rows as any[]).map((row) => ({
      ...row,
      sectores: [
        {
          campo_formacion: row.campos_formacion ? row.campos_formacion.split(",")[0] : null,
          especialidad: row.especialidades ? row.especialidades.split(",")[0] : null,
          curso: row.cursos ? row.cursos.split(",")[0] : null,
          status: row.status_cursos ? row.status_cursos.split(",")[0] : null,
        },
      ],
    }));

    return NextResponse.json(formattedInstructores);
  } catch (error: any) {
    console.error("Error en GET /api/instructores:", error.message);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
