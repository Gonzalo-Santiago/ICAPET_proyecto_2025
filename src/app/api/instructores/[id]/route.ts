// src/app/api/instructores/[id]/route.ts
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  try {
    const [[instructor]]: any = await db.query('SELECT * FROM INSTRUCTORES WHERE id = ?', [id]);
    const [sectores]: any = await db.query(
      `SELECT S.id, S.campo_formacion, S.especialidad, S.curso, ISec.status
       FROM INSTRUCTOR_SECTOR ISec
       JOIN SECTOR S ON ISec.id_sector = S.id
       WHERE ISec.id_instructor = ?`,
      [id]
    );
    return NextResponse.json({ instructor, sectores });
  } catch (e) {
    console.error('Error fetching instructor', e);
    return NextResponse.json({ error: 'Error al obtener instructor' }, { status: 500 });
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
}
