/**
 * Repository para Alertas de Seguridad
 * Maneja todas las operaciones de base de datos
 */

const db = require('../config/database');

// Obtener empresa del usuario autenticado
async function obtenerEmpresaPorUsuario(idUsuario) {
  const sql = 'SELECT id_empresa FROM empresas WHERE id_usuario = ? AND estado = 1';
  const result = await db.queryOne(sql, [idUsuario]);
  return result;
}

// Listar alertas con filtros
async function listarAlertas({
  idEmpresa,
  categoria,
  severidad,
  estadoAlerta,
  busqueda,
  page = 1,
  pageSize = 10
}) {
  let sql = 'SELECT id_alerta, titulo, descripcion, categoria, severidad, estado_alerta, fecha_alerta FROM alertas_seguridad WHERE id_empresa = ? AND estado = 1';
  const params = [idEmpresa];

  // Filtro por categoría
  if (categoria) {
    sql += ' AND categoria = ?';
    params.push(categoria);
  }

  // Filtro por severidad
  if (severidad) {
    sql += ' AND severidad = ?';
    params.push(severidad);
  }

  // Filtro por estado de alerta
  if (estadoAlerta) {
    sql += ' AND estado_alerta = ?';
    params.push(estadoAlerta);
  }

  // Filtro por búsqueda (titulo o descripcion)
  if (busqueda) {
    sql += ' AND (titulo LIKE ? OR descripcion LIKE ?)';
    const searchTerm = `%${busqueda}%`;
    params.push(searchTerm, searchTerm);
  }

  // Ordenar por fecha descendente
  sql += ' ORDER BY fecha_alerta DESC';

  // Paginación
  const safePageSize = parseInt(pageSize) || 10;
  const safePage = parseInt(page) || 1;
  const offset = (safePage - 1) * safePageSize;
  sql += ` LIMIT ${safePageSize} OFFSET ${offset}`;

  return await db.query(sql, params);
}

// Contar alertas con filtros
async function contarAlertas({
  idEmpresa,
  categoria,
  severidad,
  estadoAlerta,
  busqueda
}) {
  let sql = 'SELECT COUNT(*) as total FROM alertas_seguridad WHERE id_empresa = ? AND estado = 1';
  const params = [idEmpresa];

  if (categoria) {
    sql += ' AND categoria = ?';
    params.push(categoria);
  }

  if (severidad) {
    sql += ' AND severidad = ?';
    params.push(severidad);
  }

  if (estadoAlerta) {
    sql += ' AND estado_alerta = ?';
    params.push(estadoAlerta);
  }

  if (busqueda) {
    sql += ' AND (titulo LIKE ? OR descripcion LIKE ?)';
    const searchTerm = `%${busqueda}%`;
    params.push(searchTerm, searchTerm);
  }

  const result = await db.queryOne(sql, params);
  return result?.total || 0;
}

// Obtener alerta por ID
async function obtenerAlertaPorId(idAlerta, idEmpresa) {
  const sql = 'SELECT * FROM alertas_seguridad WHERE id_alerta = ? AND id_empresa = ? AND estado = 1';
  return await db.queryOne(sql, [idAlerta, idEmpresa]);
}

// Obtener detalle de alerta
async function obtenerDetallePorAlerta(idAlerta) {
  const sql = 'SELECT * FROM alertas_detalle WHERE id_alerta = ? LIMIT 1';
  return await db.queryOne(sql, [idAlerta]);
}

// Crear alerta
async function crearAlerta(idEmpresa, data) {
  const sql = `
    INSERT INTO alertas_seguridad 
    (id_empresa, titulo, descripcion, categoria, severidad, estado_alerta, estado)
    VALUES (?, ?, ?, ?, ?, ?, 1)
  `;

  const estadoAlertaValue = data.estadoAlerta || 'abierta';
  const result = await db.query(sql, [
    idEmpresa,
    data.titulo,
    data.descripcion,
    data.categoria,
    data.severidad,
    estadoAlertaValue
  ]);

  return { id_alerta: result.insertId };
}

// Crear detalle de alerta
async function crearDetalle(idAlerta, data) {
  const sql = `
    INSERT INTO alertas_detalle 
    (id_alerta, codigo_alerta, descripcion_tecnica, activos_afectados, remediacion, imagen_url)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  return await db.query(sql, [
    idAlerta,
    data.codigoAlerta || null,
    data.descripcionTecnica || null,
    data.activosAfectados || null,
    data.remediacion || null,
    data.imagenUrl || null
  ]);
}

// Crear detalle si no existe
async function crearDetalleSiNoExiste(idAlerta, data) {
  const existente = await obtenerDetallePorAlerta(idAlerta);
  
  if (!existente) {
    return await crearDetalle(idAlerta, data);
  }
  
  return existente;
}

// Actualizar alerta
async function actualizarAlerta(idAlerta, idEmpresa, data) {
  const campos = [];
  const valores = [];

  if (data.titulo) {
    campos.push('titulo = ?');
    valores.push(data.titulo);
  }
  if (data.descripcion) {
    campos.push('descripcion = ?');
    valores.push(data.descripcion);
  }
  if (data.categoria) {
    campos.push('categoria = ?');
    valores.push(data.categoria);
  }
  if (data.severidad) {
    campos.push('severidad = ?');
    valores.push(data.severidad);
  }
  if (data.estadoAlerta) {
    campos.push('estado_alerta = ?');
    valores.push(data.estadoAlerta);
  }

  if (campos.length === 0) {
    return null;
  }

  valores.push(idAlerta);
  valores.push(idEmpresa);

  const sql = `UPDATE alertas_seguridad SET ${campos.join(', ')} WHERE id_alerta = ? AND id_empresa = ?`;
  
  await db.query(sql, valores);
  
  // Retornar la alerta actualizada
  return await obtenerAlertaPorId(idAlerta, idEmpresa);
}

// Actualizar detalle
async function actualizarDetalle(idAlerta, data) {
  const campos = [];
  const valores = [];

  if (data.codigoAlerta !== undefined) {
    campos.push('codigo_alerta = ?');
    valores.push(data.codigoAlerta);
  }
  if (data.descripcionTecnica !== undefined) {
    campos.push('descripcion_tecnica = ?');
    valores.push(data.descripcionTecnica);
  }
  if (data.activosAfectados !== undefined) {
    campos.push('activos_afectados = ?');
    valores.push(data.activosAfectados);
  }
  if (data.remediacion !== undefined) {
    campos.push('remediacion = ?');
    valores.push(data.remediacion);
  }
  if (data.imagenUrl !== undefined) {
    campos.push('imagen_url = ?');
    valores.push(data.imagenUrl);
  }

  if (campos.length === 0) {
    return null;
  }

  valores.push(idAlerta);

  const sql = `UPDATE alertas_detalle SET ${campos.join(', ')} WHERE id_alerta = ?`;
  
  return await db.query(sql, valores);
}

// Actualizar estado de alerta
async function actualizarEstadoAlerta(idAlerta, idEmpresa, estadoAlerta) {
  const sql = 'UPDATE alertas_seguridad SET estado_alerta = ? WHERE id_alerta = ? AND id_empresa = ?';
  
  await db.query(sql, [estadoAlerta, idAlerta, idEmpresa]);
  
  return await obtenerAlertaPorId(idAlerta, idEmpresa);
}

// Eliminar lógico (soft delete)
async function eliminarLogico(idAlerta, idEmpresa) {
  const sql = 'UPDATE alertas_seguridad SET estado = 0 WHERE id_alerta = ? AND id_empresa = ?';
  return await db.query(sql, [idAlerta, idEmpresa]);
}

// Obtener resumen de alertas
async function obtenerResumen(idEmpresa) {
  const sql = `
    SELECT 
      SUM(CASE WHEN estado_alerta != 'resuelta' THEN 1 ELSE 0 END) as pendientes,
      SUM(CASE WHEN severidad = 'critica' THEN 1 ELSE 0 END) as critica,
      SUM(CASE WHEN severidad = 'alta' THEN 1 ELSE 0 END) as alta,
      SUM(CASE WHEN severidad = 'media' THEN 1 ELSE 0 END) as media,
      SUM(CASE WHEN severidad = 'baja' THEN 1 ELSE 0 END) as baja
    FROM alertas_seguridad 
    WHERE id_empresa = ? AND estado = 1
  `;

  const result = await db.queryOne(sql, [idEmpresa]);
  
  return {
    pendientes: result?.pendientes || 0,
    critica: result?.critica || 0,
    alta: result?.alta || 0,
    media: result?.media || 0,
    baja: result?.baja || 0
  };
}

module.exports = {
  obtenerEmpresaPorUsuario,
  listarAlertas,
  contarAlertas,
  obtenerAlertaPorId,
  obtenerDetallePorAlerta,
  crearAlerta,
  crearDetalle,
  crearDetalleSiNoExiste,
  actualizarAlerta,
  actualizarDetalle,
  actualizarEstadoAlerta,
  eliminarLogico,
  obtenerResumen
};
