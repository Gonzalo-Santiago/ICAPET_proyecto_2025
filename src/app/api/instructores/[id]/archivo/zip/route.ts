// src\app\api\instructores\[id]\archivo\zip\route.ts

import { NextResponse } from "next/server";
import archiver from "archiver";
import { PassThrough } from "stream";
import { db as DB } from "@/lib/db";

const MAP: Record<string, { col: string; mime: string; ext: string }> = {
  rfc: { col: "RFC", mime: "application/pdf", ext: "pdf" },
  curp: { col: "CURP", mime: "application/pdf", ext: "pdf" },
  cedula: { col: "CEDULA", mime: "application/pdf", ext: "pdf" },
  ine: { col: "INE", mime: "application/pdf", ext: "pdf" },
  fotografia: { col: "FOTOGRAFIA", mime: "image/jpeg", ext: "jpg" },
};

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const tipos = Object.keys(MAP);

  const passthrough = new PassThrough();
  const archive = archiver("zip", { zlib: { level: 9 } });
  archive.pipe(passthrough);

  let archivosAgregados = 0;

  for (const tipo of tipos) {
    const m = MAP[tipo];
    const [rows]: any = await DB.query(
      `SELECT ${m.col} AS archivo FROM INSTRUCTORES WHERE id = ?`,
      [id]
    );

    if (!rows || rows.length === 0) {
      continue; // No instructor o archivo, sigue con otro
    }

    const blob: Buffer | null = rows[0].archivo ?? null;
    if (!blob) {
      continue; // Sin archivo para este tipo
    }

    // Agrega el buffer directamente al ZIP con el nombre correcto
    archive.append(blob, { name: `${tipo}.${m.ext}` });
    archivosAgregados++;
  }

  if (archivosAgregados === 0) {
    archive.abort();
    return new NextResponse("No se encontraron archivos para comprimir.", {
      status: 404,
    });
  }

  await archive.finalize();

  return new NextResponse(passthrough as any, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="instructor_${id}.zip"`,
    },
  });
}
