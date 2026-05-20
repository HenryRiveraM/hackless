const { query, queryOne } = require('../config/database');

async function findByNit(nit) {
  const sql = 'SELECT * FROM empresas WHERE nit = ?';
  return queryOne(sql, [nit]);
}

async function findByEmail(email) {
  const sql = 'SELECT * FROM empresas WHERE email_corporativo = ?';
  return queryOne(sql, [email]);
}

async function findByUserId(id_usuario) {
  const sql = 'SELECT * FROM empresas WHERE id_usuario = ?';
  return queryOne(sql, [id_usuario]);
}

async function findById(id_empresa) {
  const sql = `SELECT * FROM empresas WHERE id_empresa = ?`;
  return queryOne(sql, [id_empresa]);
}

async function create(id_usuario, nombre_empresa, industria, nit, nombre_admin, email_corporativo) {
  const sql = `INSERT INTO empresas (id_usuario, nombre_empresa, industria, nit, nombre_admin, email_corporativo, estado) 
               VALUES (?, ?, ?, ?, ?, ?, 1)`;
  const result = await query(sql, [id_usuario, nombre_empresa, industria, nit, nombre_admin, email_corporativo]);
  
  return findById(result.insertId);
}

async function update(id_empresa, data) {
  const fields = [];
  const values = [];
  
  if (data.nombre_empresa) {
    fields.push('nombre_empresa = ?');
    values.push(data.nombre_empresa);
  }
  if (data.industria) {
    fields.push('industria = ?');
    values.push(data.industria);
  }
  if (data.nit) {
    fields.push('nit = ?');
    values.push(data.nit);
  }
  if (data.nombre_admin) {
    fields.push('nombre_admin = ?');
    values.push(data.nombre_admin);
  }
  if (data.email_corporativo) {
    fields.push('email_corporativo = ?');
    values.push(data.email_corporativo);
  }
  if (data.estado !== undefined) {
    fields.push('estado = ?');
    values.push(data.estado);
  }
  
  if (fields.length === 0) {
    return findById(id_empresa);
  }
  
  values.push(id_empresa);
  
  const sql = `UPDATE empresas SET ${fields.join(', ')}, ultima_actualizacion = CURRENT_TIMESTAMP 
               WHERE id_empresa = ?`;
  await query(sql, values);
  
  return findById(id_empresa);
}

module.exports = {
  findByNit,
  findByEmail,
  findByUserId,
  findById,
  create,
  update
};
