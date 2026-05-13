
const mysql = require('mysql2/promise');
require('dotenv').config();

// Crear pool de conexiones para mejor rendimiento
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hackless_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelayMs: 0
});

// Función auxiliar para ejecutar consultas
async function query(sql, values = []) {
  try {
    const [rows] = await pool.execute(sql, values);
    return rows;
  } catch (error) {
    console.error('Error en la base de datos:', error);
    throw error;
  }
}

// Función auxiliar para obtener una sola fila
async function queryOne(sql, values = []) {
  const rows = await query(sql, values);
  return rows.length > 0 ? rows[0] : null;
}

module.exports = {
  pool,
  query,
  queryOne
};
