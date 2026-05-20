/**
 * Repository para Incidencias de Seguridad
 * Maneja todas las operaciones de base de datos
 */

const db = require('../config/database');

// Obtener empresa del usuario autenticado
async function obtenerEmpresaPorUsuario(idUsuario) {
  const sql = 'SELECT id_empresa FROM empresas WHERE id_usuario = ? AND estado = 1';
  return await db.queryOne(sql, [idUsuario]);
}

// Listar incidencias con filtros
async function listarIncidencias({
  idEmpresa,
  severidad,
  estadoIncidencia,
  busqueda,
  page = 1,
  pageSize = 10
}) {
  let sql = `
    SELECT id_incidencia, codigo_incidencia, titulo, severidad, estado_incidencia, 
           resumen_evento, ip_origen, fecha_registro, ultima_actualizacion
    FROM incidencias_seguridad 
    WHERE id_empresa = ? AND estado = 1
  `;
  const params = [idEmpresa];

  // Filtro por severidad
  if (severidad) {
    sql += ' AND severidad = ?';
    params.push(severidad);
  }

  // Filtro por estado
  if (estadoIncidencia) {
    sql += ' AND estado_incidencia = ?';
    params.push(estadoIncidencia);
  }

  // Filtro por búsqueda
  if (busqueda) {
    sql += ' AND (titulo LIKE ? OR codigo_incidencia LIKE ?)';
    const searchTerm = `%${busqueda}%`;
    params.push(searchTerm, searchTerm);
  }

  // Ordenar por fecha descendente
  sql += ' ORDER BY fecha_registro DESC';

  // Paginación
  const offset = (page - 1) * pageSize;
  sql += ' LIMIT ? OFFSET ?';
  params.push(pageSize, offset);

  return await db.query(sql, params);
}

// Contar incidencias con filtros
async function contarIncidencias({
  idEmpresa,
  severidad,
  estadoIncidencia,
  busqueda
}) {
  let sql = 'SELECT COUNT(*) as total FROM incidencias_seguridad WHERE id_empresa = ? AND estado = 1';
  const params = [idEmpresa];

  if (severidad) {
    sql += ' AND severidad = ?';
    params.push(severidad);
  }

  if (estadoIncidencia) {
    sql += ' AND estado_incidencia = ?';
    params.push(estadoIncidencia);
  }

  if (busqueda) {
    sql += ' AND (titulo LIKE ? OR codigo_incidencia LIKE ?)';
    const searchTerm = `%${busqueda}%`;
    params.push(searchTerm, searchTerm);
  }

  const result = await db.queryOne(sql, params);
  return result?.total || 0;
}

// Obtener incidencia por ID
async function obtenerIncidenciaPorId(idIncidencia, idEmpresa) {
  const sql = `
    SELECT * FROM incidencias_seguridad 
    WHERE id_incidencia = ? AND id_empresa = ? AND estado = 1
  `;
  return await db.queryOne(sql, [idIncidencia, idEmpresa]);
}

// Crear incidencia
async function crearIncidencia(idEmpresa, data) {
  const sql = `
    INSERT INTO incidencias_seguridad 
    (id_empresa, codigo_incidencia, titulo, severidad, estado_incidencia, 
     resumen_evento, ip_origen, dispositivo_navegador, marca_tiempo, 
     ubicacion_detectada, recomendacion, estado)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
  `;

  const estadoValue = data.estadoIncidencia || 'abierta';

  const result = await db.query(sql, [
    idEmpresa,
    data.codigoIncidencia,
    data.titulo,
    data.severidad,
    estadoValue,
    data.resumenEvento,
    data.ipOrigen || null,
    data.dispositivoNavegador || null,
    data.marcaTiempo ? new Date(data.marcaTiempo).toISOString() : null,
    null, // ubicacion_detectada se llena después de geolocalizacion
    data.recomendacion || null
  ]);

  return { id_incidencia: result.insertId };
}

// Crear activos para una incidencia
async function crearActivos(idIncidencia, activos) {
  if (!activos || activos.length === 0) {
    return [];
  }

  const resultados = [];

  for (const activo of activos) {
    const sql = `
      INSERT INTO incidencia_activos 
      (id_incidencia, nombre_activo, descripcion, tipo_activo, estado)
      VALUES (?, ?, ?, ?, 1)
    `;

    const result = await db.query(sql, [
      idIncidencia,
      activo.nombreActivo,
      activo.descripcion || null,
      activo.tipoActivo || null
    ]);

    resultados.push({ id_activo: result.insertId });
  }

  return resultados;
}

// Crear timeline para una incidencia
async function crearTimeline(idIncidencia, eventos) {
  if (!eventos || eventos.length === 0) {
    return [];
  }

  const resultados = [];

  for (const evento of eventos) {
    const sql = `
      INSERT INTO incidencia_timeline 
      (id_incidencia, titulo, descripcion, fecha_evento, tipo_evento, estado)
      VALUES (?, ?, ?, ?, ?, 1)
    `;

    const result = await db.query(sql, [
      idIncidencia,
      evento.titulo,
      evento.descripcion || null,
      new Date(evento.fechaEvento).toISOString(),
      evento.tipoEvento || 'deteccion'
    ]);

    resultados.push({ id_timeline: result.insertId });
  }

  return resultados;
}

// Crear acción para una incidencia
async function crearAccion(idIncidencia, data) {
  const sql = `
    INSERT INTO incidencia_acciones 
    (id_incidencia, accion, tipo_accion, ejecutada, estado)
    VALUES (?, ?, ?, ?, 1)
  `;

  const result = await db.query(sql, [
    idIncidencia,
    data.accion,
    data.tipoAccion,
    data.ejecutada ? 1 : 0
  ]);

  return { id_accion: result.insertId };
}

// Crear geolocalización
async function crearGeolocalizacion(idIncidencia, data) {
  const sql = `
    INSERT INTO incidencia_geolocalizacion 
    (id_incidencia, ip_origen, pais, ciudad, region, latitud, longitud, proveedor, raw_response)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const result = await db.query(sql, [
    idIncidencia,
    data.ipOrigen || null,
    data.pais || null,
    data.ciudad || null,
    data.region || null,
    data.latitud || null,
    data.longitud || null,
    data.proveedor || null,
    data.rawResponse || null
  ]);

  return { id_geo: result.insertId };
}

// Obtener geolocalización de una incidencia
async function obtenerGeolocalizacion(idIncidencia) {
  const sql = `
    SELECT id_geo, ip_origen, pais, ciudad, region, latitud, longitud, proveedor, raw_response
    FROM incidencia_geolocalizacion 
    WHERE id_incidencia = ?
    LIMIT 1
  `;
  return await db.queryOne(sql, [idIncidencia]);
}

// Actualizar incidencia
async function actualizarIncidencia(idIncidencia, idEmpresa, data) {
  const campos = [];
  const valores = [];

  if (data.titulo !== undefined) {
    campos.push('titulo = ?');
    valores.push(data.titulo);
  }

  if (data.severidad !== undefined) {
    campos.push('severidad = ?');
    valores.push(data.severidad);
  }

  if (data.estadoIncidencia !== undefined) {
    campos.push('estado_incidencia = ?');
    valores.push(data.estadoIncidencia);
  }

  if (data.resumenEvento !== undefined) {
    campos.push('resumen_evento = ?');
    valores.push(data.resumenEvento);
  }

  if (data.recomendacion !== undefined) {
    campos.push('recomendacion = ?');
    valores.push(data.recomendacion);
  }

  if (campos.length === 0) {
    return null;
  }

  valores.push(idIncidencia);
  valores.push(idEmpresa);

  const sql = `
    UPDATE incidencias_seguridad 
    SET ${campos.join(', ')}, ultima_actualizacion = CURRENT_TIMESTAMP
    WHERE id_incidencia = ? AND id_empresa = ?
  `;

  await db.query(sql, valores);

  return await obtenerIncidenciaPorId(idIncidencia, idEmpresa);
}

// Actualizar estado de incidencia
async function actualizarEstado(idIncidencia, idEmpresa, estadoIncidencia) {
  const sql = `
    UPDATE incidencias_seguridad 
    SET estado_incidencia = ?, ultima_actualizacion = CURRENT_TIMESTAMP
    WHERE id_incidencia = ? AND id_empresa = ?
  `;

  await db.query(sql, [estadoIncidencia, idIncidencia, idEmpresa]);

  return await obtenerIncidenciaPorId(idIncidencia, idEmpresa);
}

// Eliminar lógico (soft delete)
async function eliminarLogico(idIncidencia, idEmpresa) {
  const sql = `
    UPDATE incidencias_seguridad 
    SET estado = 0, ultima_actualizacion = CURRENT_TIMESTAMP
    WHERE id_incidencia = ? AND id_empresa = ?
  `;
  return await db.query(sql, [idIncidencia, idEmpresa]);
}

// Listar activos de una incidencia
async function listarActivos(idIncidencia) {
  const sql = `
    SELECT id_activo, id_incidencia, nombre_activo, descripcion, tipo_activo, fecha_registro
    FROM incidencia_activos 
    WHERE id_incidencia = ? AND estado = 1
    ORDER BY fecha_registro DESC
  `;
  return await db.query(sql, [idIncidencia]);
}

// Listar timeline de una incidencia
async function listarTimeline(idIncidencia) {
  const sql = `
    SELECT id_timeline, id_incidencia, titulo, descripcion, fecha_evento, tipo_evento, fecha_registro
    FROM incidencia_timeline 
    WHERE id_incidencia = ? AND estado = 1
    ORDER BY fecha_evento DESC
  `;
  return await db.query(sql, [idIncidencia]);
}

// Listar acciones de una incidencia
async function listarAcciones(idIncidencia) {
  const sql = `
    SELECT id_accion, id_incidencia, accion, tipo_accion, ejecutada, fecha_ejecucion, fecha_registro
    FROM incidencia_acciones 
    WHERE id_incidencia = ? AND estado = 1
    ORDER BY fecha_registro DESC
  `;
  return await db.query(sql, [idIncidencia]);
}

// Agregar acción a timeline cuando se crea acción
async function agregarTimelineAccion(idIncidencia, accion, tipoAccion) {
  const sql = `
    INSERT INTO incidencia_timeline 
    (id_incidencia, titulo, descripcion, fecha_evento, tipo_evento, estado)
    VALUES (?, ?, ?, ?, ?, 1)
  `;

  const titulo = `Acción ${tipoAccion}: ${accion}`;
  const tipoEvento = 'respuesta';

  return await db.query(sql, [
    idIncidencia,
    titulo,
    `Acción automática registrada: ${accion}`,
    new Date().toISOString(),
    tipoEvento
  ]);
}

// Obtener resumen de incidencias
async function obtenerResumen(idEmpresa) {
  const sql = `
    SELECT 
      SUM(CASE WHEN severidad = 'critico' THEN 1 ELSE 0 END) as critico,
      SUM(CASE WHEN severidad = 'alto' THEN 1 ELSE 0 END) as alto,
      SUM(CASE WHEN severidad = 'medio' THEN 1 ELSE 0 END) as medio,
      SUM(CASE WHEN severidad = 'bajo' THEN 1 ELSE 0 END) as bajo,
      SUM(CASE WHEN estado_incidencia != 'resuelta' THEN 1 ELSE 0 END) as pendientes
    FROM incidencias_seguridad 
    WHERE id_empresa = ? AND estado = 1
  `;

  const result = await db.queryOne(sql, [idEmpresa]);

  return {
    critico: result?.critico || 0,
    alto: result?.alto || 0,
    medio: result?.medio || 0,
    bajo: result?.bajo || 0,
    pendientes: result?.pendientes || 0
  };
}

module.exports = {
  obtenerEmpresaPorUsuario,
  listarIncidencias,
  contarIncidencias,
  obtenerIncidenciaPorId,
  crearIncidencia,
  crearActivos,
  crearTimeline,
  crearAccion,
  crearGeolocalizacion,
  obtenerGeolocalizacion,
  actualizarIncidencia,
  actualizarEstado,
  eliminarLogico,
  listarActivos,
  listarTimeline,
  listarAcciones,
  agregarTimelineAccion,
  obtenerResumen
};
