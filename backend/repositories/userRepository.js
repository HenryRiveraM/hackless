const { query, queryOne } = require('../config/database');

async function findByEmail(email) {
  const sql = 'SELECT * FROM usuarios WHERE email = ?';
  return queryOne(sql, [email]);
}

async function findById(id) {
  const sql = 'SELECT id_usuario, nombre, email, rol, estado, fecha_registro FROM usuarios WHERE id_usuario = ?';
  return queryOne(sql, [id]);
}

async function create(nombre, email, passwordHash, rol = 'usuario') {
  const sql = `INSERT INTO usuarios (nombre, email, password_hash, rol, estado) 
               VALUES (?, ?, ?, ?, 1)`;
  const result = await query(sql, [nombre, email, passwordHash, rol]);
  
  return findById(result.insertId);
}

async function update(id, data) {
  const fields = [];
  const values = [];
  
  if (data.nombre) {
    fields.push('nombre = ?');
    values.push(data.nombre);
  }
  if (data.estado !== undefined) {
    fields.push('estado = ?');
    values.push(data.estado);
  }
  
  values.push(id);
  
  const sql = `UPDATE usuarios SET ${fields.join(', ')}, ultima_actualizacion = CURRENT_TIMESTAMP 
               WHERE id_usuario = ?`;
  await query(sql, values);
  
  return findById(id);
}

module.exports = {
  findByEmail,
  findById,
  create,
  update
};
