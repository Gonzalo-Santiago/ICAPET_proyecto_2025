/**
 *autor: maximiliano pacheco perez
 * fecha de inicio 12 de agosto
 * Descripción: interfaz de logueo para la aplicacion web filtro de instructores......
 */


// src\app\api\login\route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  const { username, password } = await req.json();

  const [rows]: any = await db.query(
    'SELECT * FROM USERS WHERE username = ? AND password = ? LIMIT 1',
    [username, password]
  );

  if (rows.length === 0) {
    return NextResponse.json({ success: false, message: 'Credenciales incorrectas' }, { status: 401 });
  }

  const user = rows[0];

  const res = NextResponse.json({ success: true, role: user.role });
  res.cookies.set('role', user.role, {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60,
  });

  return res;
}
