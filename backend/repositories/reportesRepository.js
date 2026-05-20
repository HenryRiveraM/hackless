const { query, queryOne } = require('../config/database');

async function obtenerTodos({ idEmpresa, periodo, page = 1, pageSize = 10 }) {
  let sql = `
    SELECT 
      id_reporte as idReporte,
      id_empresa as idEmpresa,
      periodo,
      puntaje_global as puntajeGlobal,
      resiliencia_phishing as resilienciaPhishing,
      capacitacion_completada as capacitacionCompletada,
      vulnerabilidades_criticas as vulnerabilidadesCriticas,
      resumen_ejecutivo as resumenEjecutivo,
      estado,
      fecha_registro as fechaRegistro,
      ultima_actualizacion as ultimaActualizacion
    FROM reportes_ejecutivos
    WHERE id_empresa = ? AND estado = 1
  `;
  
  const params = [idEmpresa];
  
  if (periodo) {
    sql += ` AND periodo = ?`;
    params.push(periodo);
  }
  
  const offset = (page - 1) * pageSize;
  sql += ` ORDER BY fecha_registro DESC LIMIT ? OFFSET ?`;
  params.push(pageSize, offset);
  
  return query(sql, params);
}

async function obtenerPorId(idReporte) {
  const sql = `
    SELECT 
      id_reporte as idReporte,
      id_empresa as idEmpresa,
      periodo,
      puntaje_global as puntajeGlobal,
      resiliencia_phishing as resilienciaPhishing,
      capacitacion_completada as capacitacionCompletada,
      vulnerabilidades_criticas as vulnerabilidadesCriticas,
      resumen_ejecutivo as resumenEjecutivo,
      estado,
      fecha_registro as fechaRegistro,
      ultima_actualizacion as ultimaActualizacion
    FROM reportes_ejecutivos
    WHERE id_reporte = ?
  `;
  
  return queryOne(sql, [idReporte]);
}

async function crear(reporte) {
  const sql = `
    INSERT INTO reportes_ejecutivos (
      id_empresa,
      periodo,
      puntaje_global,
      resiliencia_phishing,
      capacitacion_completada,
      vulnerabilidades_criticas,
      resumen_ejecutivo,
      estado
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 1)
  `;
  
  const params = [
    reporte.idEmpresa,
    reporte.periodo,
    reporte.puntajeGlobal,
    reporte.resilienciaPhishing,
    reporte.capacitacionCompletada,
    reporte.vulnerabilidadesCriticas,
    reporte.resumenEjecutivo
  ];
  
  const result = await query(sql, params);
  return obtenerPorId(result.insertId);
}

async function actualizar(idReporte, reporte) {
  const fields = [];
  const params = [];
  
  if (reporte.periodo !== undefined) {
    fields.push('periodo = ?');
    params.push(reporte.periodo);
  }
  if (reporte.puntajeGlobal !== undefined) {
    fields.push('puntaje_global = ?');
    params.push(reporte.puntajeGlobal);
  }
  if (reporte.resilienciaPhishing !== undefined) {
    fields.push('resiliencia_phishing = ?');
    params.push(reporte.resilienciaPhishing);
  }
  if (reporte.capacitacionCompletada !== undefined) {
    fields.push('capacitacion_completada = ?');
    params.push(reporte.capacitacionCompletada);
  }
  if (reporte.vulnerabilidadesCriticas !== undefined) {
    fields.push('vulnerabilidades_criticas = ?');
    params.push(reporte.vulnerabilidadesCriticas);
  }
  if (reporte.resumenEjecutivo !== undefined) {
    fields.push('resumen_ejecutivo = ?');
    params.push(reporte.resumenEjecutivo);
  }
  
  if (fields.length === 0) {
    return obtenerPorId(idReporte);
  }
  
  fields.push('ultima_actualizacion = CURRENT_TIMESTAMP');
  params.push(idReporte);
  
  const sql = `UPDATE reportes_ejecutivos SET ${fields.join(', ')} WHERE id_reporte = ?`;
  await query(sql, params);
  
  return obtenerPorId(idReporte);
}

async function eliminarLogico(idReporte) {
  const sql = `UPDATE reportes_ejecutivos SET estado = 0, ultima_actualizacion = CURRENT_TIMESTAMP WHERE id_reporte = ?`;
  await query(sql, [idReporte]);
}

async function contar({ idEmpresa, periodo }) {
  let sql = `SELECT COUNT(*) as total FROM reportes_ejecutivos WHERE id_empresa = ? AND estado = 1`;
  const params = [idEmpresa];
  
  if (periodo) {
    sql += ` AND periodo = ?`;
    params.push(periodo);
  }
  
  const result = await queryOne(sql, params);
  return result ? result.total : 0;
}

async function existeEmpresa(idEmpresa) {
  const sql = `SELECT id_empresa FROM empresas WHERE id_empresa = ?`;
  return queryOne(sql, [idEmpresa]);
}

module.exports = {
  obtenerTodos,
  obtenerPorId,
  crear,
  actualizar,
  eliminarLogico,
  contar,
  existeEmpresa
};
