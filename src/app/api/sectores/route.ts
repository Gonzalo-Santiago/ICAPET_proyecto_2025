// src/app/api/sectores/route.ts
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const [rows]: any = await db.query('SELECT id, campo_formacion, especialidad, curso FROM SECTOR');
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error al obtener sectores:', error);
    return NextResponse.json({ error: 'Error al obtener sectores' }, { status: 500 });
  }
}
