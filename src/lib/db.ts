// src/lib/db.ts
import mysql from 'mysql2/promise';

export const db = await mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'icapet_pruebas_actualizado',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
