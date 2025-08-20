import { NextResponse as NR } from "next/server";
import { db as DB } from "@/lib/db";

// Función para detectar el tipo de archivo (MIME type)
function detectMime(buf: Buffer | null): { mime: string; ext: string } {
  if (!buf || buf.length < 4) return { mime: "application/octet-stream", ext: "bin" };
  const b = buf;
  // %PDF
  if (b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46) return { mime: "application/pdf", ext: "pdf" };
  // JPEG
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return { mime: "image/jpeg", ext: "jpg" };
  // PNG
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return { mime: "image/png", ext: "png" };
  // GIF
  if (b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46) return { mime: "image/gif", ext: "gif" };
  // WebP: RIFF....WEBP
  if (b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46) return { mime: "image/webp", ext: "webp" };
  return { mime: "application/octet-stream", ext: "bin" };
}

// Mapeo de tipos de archivo a columnas de la base de datos y nombres de archivo
const MAP: Record<string, { col: string; mime: string }> = {
  rfc: { col: "RFC", mime: "application/pdf" },
  curp: { col: "CURP", mime: "application/pdf" },
  cedula: { col: "CEDULA", mime: "application/pdf" },
  ine: { col: "INE", mime: "application/pdf" },
  fotografia: { col: "FOTOGRAFIA", mime: "image/jpeg" },
};

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string; tipo: string }> }
) {
  try {
    const { id, tipo } = await params; 
    const m = MAP[tipo?.toLowerCase()];
    if (!m) return NR.json({ error: "Tipo de archivo inválido" }, { status: 400 });

    const [rows]: any = await DB.query(
      `SELECT ${m.col} AS archivo FROM INSTRUCTORES WHERE id = ?`,
      [id]
    );
    if (!rows || rows.length === 0) {
      return NR.json({ error: "Instructor no encontrado" }, { status: 404 });
    }

    const blob: Buffer | null = rows[0].archivo ?? null;
    if (!blob) return NR.json({ error: "Archivo no encontrado" }, { status: 404 });

    // Corrección: Convierte el Buffer a Uint8Array.
    // El constructor de Response no acepta directamente un Buffer,
    // pero sí acepta tipos de datos como Uint8Array.
    const fileData = new Uint8Array(blob);

    return new Response(fileData, {
      status: 200,
      headers: {
        "Content-Type": m.mime,
        "Content-Disposition": `inline; filename="${tipo}_${id}.${m.mime.includes("pdf") ? "pdf" : "jpg"}"`,
      },
    });
  } catch (err: any) {
    console.error(err);
    return NR.json({ error: "Error en descarga" }, { status: 500 });
  }
}
