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



/**
 * CODIGO CHALO
 */

/**
 * Maneja las peticiones POST para insertar nuevos datos en la tabla SECTOR.
 * Espera un JSON en el cuerpo de la petición con los campos: campo_formacion, especialidad, y curso.
 */
export async function POST(request: Request) {
  try {
    // 1. Extraer los datos del cuerpo de la petición JSON
    const { campo_formacion, especialidad, curso } = await request.json();

    // 2. Validar que los datos requeridos estén presentes
    if (!campo_formacion || !especialidad || !curso) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: campo_formacion, especialidad y curso.' },
        { status: 400 }
      );
    }

    // 3. Definir la consulta SQL de inserción
    // Usamos '?' para prevenir ataques de inyección SQL.
    const sql = 'INSERT INTO SECTOR (campo_formacion, especialidad, curso) VALUES (?, ?, ?)';
    const values = [campo_formacion, especialidad, curso];

    // 4. Ejecutar la consulta en la base de datos
    await db.query(sql, values);

    // 5. Devolver una respuesta exitosa
    return NextResponse.json(
      { message: 'Registro insertado exitosamente.' },
      { status: 201 } // 201 Created (Creado) es el código estándar para una inserción exitosa.
    );
  } catch (error) {
    console.error('Error al insertar sector:', error);
    // 500 Internal Server Error (Error interno del servidor)
    return NextResponse.json({ error: 'Error al insertar sector' }, { status: 500 });
  }
}

/**
 * Maneja las peticiones PUT para actualizar datos en la tabla SECTOR.
 * Espera un JSON en el cuerpo con los campos a actualizar.
 * La ruta debe ser dinámica, por ejemplo: /api/sectores?id=[id].
 */
export async function PUT(request: Request) {
  try {
    // 1. Obtener el ID del sector de los parámetros de consulta
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID del sector no proporcionado.' }, { status: 400 });
    }

    // 2. Extraer los datos del cuerpo de la petición
    const { campo_formacion, especialidad, curso } = await request.json();

    // 3. Validar los datos
    if (!campo_formacion || !especialidad || !curso) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos para la actualización.' },
        { status: 400 }
      );
    }

    // 4. Definir la consulta SQL de actualización
    const sql = 'UPDATE SECTOR SET campo_formacion = ?, especialidad = ?, curso = ? WHERE id = ?';
    const values = [campo_formacion, especialidad, curso, id];

    // 5. Ejecutar la consulta
    const [result]: any = await db.query(sql, values);

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Sector no encontrado o sin cambios.' }, { status: 404 });
    }

    // 6. Devolver una respuesta exitosa
    return NextResponse.json({ message: 'Sector actualizado con éxito.' }, { status: 200 });

  } catch (error) {
    console.error('Error al actualizar sector:', error);
    return NextResponse.json({ error: 'Error al actualizar sector' }, { status: 500 });
  }
}


/**
 * Función para eliminar a los sectores 
 */

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID del sector no proporcionado.' }, { status: 400 });
    }

    const sql = 'DELETE FROM SECTOR WHERE id = ?';
    const [result]: any = await db.query(sql, [id]);

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Sector no encontrado.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Sector eliminado exitosamente.' });
  } catch (error) {
    console.error('Error al eliminar sector:', error);
    return NextResponse.json({ error: 'Error al eliminar sector.' }, { status: 500 });
  }
}
