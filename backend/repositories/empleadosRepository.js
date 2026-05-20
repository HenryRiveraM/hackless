const { query, queryOne } = require('../config/database');

async function obtenerPorEmpresa({ idEmpresa, busqueda, departamento, estadoCapacitacion, page = 1, pageSize = 10 }) {
  let sql = `
    SELECT 
      id_empleado as idEmpleado,
      id_empresa as idEmpresa,
      nombre,
      email,
      departamento,
      puntaje_seguridad as puntajeSeguridad,
      estado_capacitacion as estadoCapacitacion,
      estado,
      fecha_registro as fechaRegistro,
      ultima_actualizacion as ultimaActualizacion
    FROM empleados
    WHERE id_empresa = ? AND estado = 1
  `;
  
  const params = [idEmpresa];
  
  if (busqueda) {
    sql += ` AND (nombre LIKE ? OR email LIKE ? OR departamento LIKE ?)`;
    const searchTerm = `%${busqueda}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }
  
  if (departamento) {
    sql += ` AND departamento = ?`;
    params.push(departamento);
  }
  
  if (estadoCapacitacion) {
    sql += ` AND estado_capacitacion = ?`;
    params.push(estadoCapacitacion);
  }
  
  const limit = Math.max(1, parseInt(pageSize, 10) || 10);
  const currentPage = Math.max(1, parseInt(page, 10) || 1);
  const offset = (currentPage - 1) * limit;
  sql += ` ORDER BY fecha_registro DESC LIMIT ${limit} OFFSET ${offset}`;
  
  return query(sql, params);
}

async function obtenerPorId(idEmpleado) {
  const sql = `
    SELECT 
      id_empleado as idEmpleado,
      id_empresa as idEmpresa,
      nombre,
      email,
      departamento,
      puntaje_seguridad as puntajeSeguridad,
      estado_capacitacion as estadoCapacitacion,
      estado,
      fecha_registro as fechaRegistro,
      ultima_actualizacion as ultimaActualizacion
    FROM empleados
    WHERE id_empleado = ?
  `;
  
  return queryOne(sql, [idEmpleado]);
}

async function existeEmpresa(idEmpresa) {
  const sql = `SELECT id_empresa FROM empresas WHERE id_empresa = ?`;
  return queryOne(sql, [idEmpresa]);
}

async function existeEmailEnEmpresa({ idEmpresa, email, idEmpleadoExcluir = null }) {
  let sql = `SELECT id_empleado FROM empleados WHERE id_empresa = ? AND email = ?`;
  const params = [idEmpresa, email];
  
  if (idEmpleadoExcluir) {
    sql += ` AND id_empleado != ?`;
    params.push(idEmpleadoExcluir);
  }
  
  return queryOne(sql, params);
}

async function crear(empleado) {
  const sql = `
    INSERT INTO empleados (
      id_empresa,
      nombre,
      email,
      departamento,
      puntaje_seguridad,
      estado_capacitacion,
      estado
    ) VALUES (?, ?, ?, ?, ?, ?, 1)
  `;
  
  const params = [
    empleado.idEmpresa,
    empleado.nombre,
    empleado.email,
    empleado.departamento,
    empleado.puntajeSeguridad || 0,
    empleado.estadoCapacitacion || 'pendiente'
  ];
  
  const result = await query(sql, params);
  return obtenerPorId(result.insertId);
}

async function actualizar(idEmpleado, empleado) {
  const fields = [];
  const params = [];
  
  if (empleado.nombre !== undefined) {
    fields.push('nombre = ?');
    params.push(empleado.nombre);
  }
  if (empleado.email !== undefined) {
    fields.push('email = ?');
    params.push(empleado.email);
  }
  if (empleado.departamento !== undefined) {
    fields.push('departamento = ?');
    params.push(empleado.departamento);
  }
  if (empleado.puntajeSeguridad !== undefined) {
    fields.push('puntaje_seguridad = ?');
    params.push(empleado.puntajeSeguridad);
  }
  if (empleado.estadoCapacitacion !== undefined) {
    fields.push('estado_capacitacion = ?');
    params.push(empleado.estadoCapacitacion);
  }
  
  if (fields.length === 0) {
    return obtenerPorId(idEmpleado);
  }
  
  fields.push('ultima_actualizacion = CURRENT_TIMESTAMP');
  params.push(idEmpleado);
  
  const sql = `UPDATE empleados SET ${fields.join(', ')} WHERE id_empleado = ?`;
  await query(sql, params);
  
  return obtenerPorId(idEmpleado);
}

async function eliminarLogico(idEmpleado) {
  const sql = `UPDATE empleados SET estado = 0, ultima_actualizacion = CURRENT_TIMESTAMP WHERE id_empleado = ?`;
  await query(sql, [idEmpleado]);
}

async function contarPorEmpresa({ idEmpresa, busqueda, departamento, estadoCapacitacion }) {
  let sql = `SELECT COUNT(*) as total FROM empleados WHERE id_empresa = ? AND estado = 1`;
  const params = [idEmpresa];
  
  if (busqueda) {
    sql += ` AND (nombre LIKE ? OR email LIKE ? OR departamento LIKE ?)`;
    const searchTerm = `%${busqueda}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }
  
  if (departamento) {
    sql += ` AND departamento = ?`;
    params.push(departamento);
  }
  
  if (estadoCapacitacion) {
    sql += ` AND estado_capacitacion = ?`;
    params.push(estadoCapacitacion);
  }
  
  const result = await queryOne(sql, params);
  return result ? result.total : 0;
}

async function obtenerResumen(idEmpresa) {
  const sql = `
    SELECT
      COUNT(*) as totalEmpleados,
      ROUND(AVG(puntaje_seguridad), 2) as puntajePromedio,
      SUM(CASE WHEN estado_capacitacion = 'completado' THEN 1 ELSE 0 END) as completados
    FROM empleados
    WHERE id_empresa = ? AND estado = 1
  `;
  
  return queryOne(sql, [idEmpresa]);
}

module.exports = {
  obtenerPorEmpresa,
  obtenerPorId,
  existeEmpresa,
  existeEmailEnEmpresa,
  crear,
  actualizar,
  eliminarLogico,
  contarPorEmpresa,
  obtenerResumen
};
