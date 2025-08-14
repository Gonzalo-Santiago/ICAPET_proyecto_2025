// src/app/api/instructores/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  const formData = await req.formData();

  // Campos de formulario
  const nombre = formData.get('nombre') as string;
  const apellido_paterno = formData.get('apellido_paterno') as string;
  const apellido_materno = formData.get('apellido_materno') as string;
  const email = formData.get('email') as string;
  const telefono = formData.get('telefono') as string;
  const nivel_estudio = formData.get('nivel_estudio') as string;
  const area_estudio = formData.get('area_estudio') as string;
  const UDC = formData.get('UDC') as string;
  const residencia = formData.get('residencia') as string;
  const comentario = formData.get('comentario') as string;

  // Archivos: Blob en formato file
  const toBuffer = async (file: File | null) => {
    if (!file) return null;
    const arrayBuffer = await file.arrayBuffer();
    return Buffer.from(arrayBuffer);
  };

  const rfc = await toBuffer(formData.get('rfc') as File | null);
  const curp = await toBuffer(formData.get('curp') as File | null);
  const cedula = await toBuffer(formData.get('cedula') as File | null);
  const ine = await toBuffer(formData.get('ine') as File | null);
  const fotografia = await toBuffer(formData.get('fotografia') as File | null);

  // Sectores seleccionados
  const sectoresJson = formData.get('sectores') as string;
  let sectores: { id: number; status: 'Formal' | 'Informal' }[] = [];
  try {
    sectores = JSON.parse(sectoresJson);
  } catch (e) {
    return NextResponse.json({ success: false, message: 'Sectores inválidos' }, { status: 400 });
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

    // Insertar cada sector seleccionado
    for (const sec of sectores) {
      await db.query(
        `INSERT INTO INSTRUCTOR_SECTOR (id_instructor, id_sector, status) VALUES (?, ?, ?)`,
        [instructorId, sec.id, sec.status]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al guardar instructor', error);
    return NextResponse.json({ success: false, message: 'Error de servidor' }, { status: 500 });
  }
}
