


// /src/app/api/instructores/[id]/route.ts
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request, context: { params: { id: string } }) {
    try {
        const { id: instructorId } = await context.params;

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
            'curso', S.curso
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