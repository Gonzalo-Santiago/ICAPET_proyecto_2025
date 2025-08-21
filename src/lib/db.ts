// src/lib/db.ts
import mysql from 'mysql2/promise';

export const db = await mysql.createPool({
  host: '192.168.1.18',
  user: 'icapetRemota',
  password: '6011',
  database: 'icapet_instructores_2025',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
