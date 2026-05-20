const db = require('../config/database');

/**
 * Auditorías Repository
 * Capa de acceso a datos para auditorías
 */

/**
 * Obtener empresa asociada a un usuario
 * @param {number} idUsuario
 * @returns {Promise<Object>} { id_empresa, nombre_empresa }
 */
async function obtenerEmpresaPorUsuario(idUsuario) {
  try {
    const query = `
      SELECT id_empresa, nombre_empresa
      FROM empresas
      WHERE id_usuario = ? AND estado = 1
      LIMIT 1
    `;
    const [rows] = await db.execute(query, [idUsuario]);
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    throw new Error(`Error obteniendo empresa: ${error.message}`);
  }
}

/**
 * Crear una auditoría
 * @param {number} idEmpresa
 * @param {Object} data - { target, tipo, estadoAuditoria, resumenResultado, detalleResultado }
 * @returns {Promise<number>} ID de la auditoría creada
 */
async function crearAuditoria(idEmpresa, data) {
  try {
    const query = `
      INSERT INTO auditorias (
        id_empresa,
        target,
        tipo,
        estado_auditoria,
        resumen_resultado,
        detalle_resultado
      ) VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.execute(query, [
      idEmpresa,
      data.target,
      data.tipo,
      data.estadoAuditoria,
      data.resumenResultado,
      data.detalleResultado
    ]);
    return result.insertId;
  } catch (error) {
    throw new Error(`Error creando auditoría: ${error.message}`);
  }
}

/**
 * Listar auditorías con filtros
 * @param {number} idEmpresa
 * @param {Object} filtros - { tipo, estadoAuditoria, busqueda, page, pageSize }
 * @returns {Promise<Array>}
 */
async function listarAuditorias(idEmpresa, filtros) {
  try {
    const { tipo, estadoAuditoria, busqueda, page = 1, pageSize = 10 } = filtros;

    let query = `
      SELECT 
        id_auditoria,
        target,
        tipo,
        estado_auditoria,
        resumen_resultado,
        detalle_resultado,
        fecha_auditoria
      FROM auditorias
      WHERE id_empresa = ? AND estado = 1
    `;

    const params = [idEmpresa];

    // Filtro por tipo
    if (tipo) {
      query += ` AND tipo = ?`;
      params.push(tipo);
    }

    // Filtro por estado de auditoría
    if (estadoAuditoria) {
      query += ` AND estado_auditoria = ?`;
      params.push(estadoAuditoria);
    }

    // Búsqueda
    if (busqueda) {
      query += ` AND (target LIKE ? OR resumen_resultado LIKE ?)`;
      const searchTerm = `%${busqueda}%`;
      params.push(searchTerm, searchTerm);
    }

    // Ordenar por fecha descendente
    query += ` ORDER BY fecha_auditoria DESC`;

    // Paginación
    const limit = Math.max(1, parseInt(pageSize, 10) || 10);
    const currentPage = Math.max(1, parseInt(page, 10) || 1);
    const offset = (currentPage - 1) * limit;
    query += ` LIMIT ${limit} OFFSET ${offset}`;

    const [rows] = await db.execute(query, params);

    // Mapear salida
    return rows.map(row => ({
      idAuditoria: row.id_auditoria,
      target: row.target,
      tipo: row.tipo,
      estadoAuditoria: row.estado_auditoria,
      resumenResultado: row.resumen_resultado,
      detalleResultado: row.detalle_resultado,
      fechaAuditoria: row.fecha_auditoria
    }));
  } catch (error) {
    throw new Error(`Error listando auditorías: ${error.message}`);
  }
}

/**
 * Contar auditorías con filtros
 * @param {number} idEmpresa
 * @param {Object} filtros - { tipo, estadoAuditoria, busqueda }
 * @returns {Promise<number>}
 */
async function contarAuditorias(idEmpresa, filtros) {
  try {
    const { tipo, estadoAuditoria, busqueda } = filtros;

    let query = `
      SELECT COUNT(*) as total
      FROM auditorias
      WHERE id_empresa = ? AND estado = 1
    `;

    const params = [idEmpresa];

    // Filtro por tipo
    if (tipo) {
      query += ` AND tipo = ?`;
      params.push(tipo);
    }

    // Filtro por estado de auditoría
    if (estadoAuditoria) {
      query += ` AND estado_auditoria = ?`;
      params.push(estadoAuditoria);
    }

    // Búsqueda
    if (busqueda) {
      query += ` AND (target LIKE ? OR resumen_resultado LIKE ?)`;
      const searchTerm = `%${busqueda}%`;
      params.push(searchTerm, searchTerm);
    }

    const [rows] = await db.execute(query, params);
    return rows[0].total || 0;
  } catch (error) {
    throw new Error(`Error contando auditorías: ${error.message}`);
  }
}

/**
 * Obtener auditoría por ID
 * @param {number} idAuditoria
 * @param {number} idEmpresa - para validar propiedad
 * @returns {Promise<Object>}
 */
async function obtenerAuditoriaPorId(idAuditoria, idEmpresa) {
  try {
    const query = `
      SELECT 
        id_auditoria,
        target,
        tipo,
        estado_auditoria,
        resumen_resultado,
        detalle_resultado,
        fecha_auditoria
      FROM auditorias
      WHERE id_auditoria = ? AND id_empresa = ? AND estado = 1
    `;

    const [rows] = await db.execute(query, [idAuditoria, idEmpresa]);

    if (rows.length === 0) {
      return null;
    }

    const row = rows[0];
    return {
      idAuditoria: row.id_auditoria,
      target: row.target,
      tipo: row.tipo,
      estadoAuditoria: row.estado_auditoria,
      resumenResultado: row.resumen_resultado,
      detalleResultado: row.detalle_resultado,
      fechaAuditoria: row.fecha_auditoria
    };
  } catch (error) {
    throw new Error(`Error obteniendo auditoría: ${error.message}`);
  }
}

/**
 * Eliminar auditoría (soft delete)
 * @param {number} idAuditoria
 * @param {number} idEmpresa
 * @returns {Promise<Object>}
 */
async function eliminarAuditoria(idAuditoria, idEmpresa) {
  try {
    const query = `
      UPDATE auditorias
      SET estado = 0
      WHERE id_auditoria = ? AND id_empresa = ? AND estado = 1
    `;

    const [result] = await db.execute(query, [idAuditoria, idEmpresa]);

    return {
      affectedRows: result.affectedRows,
      success: result.affectedRows > 0
    };
  } catch (error) {
    throw new Error(`Error eliminando auditoría: ${error.message}`);
  }
}

/**
 * Crear resultado de auditoría
 * @param {number} idAuditoria
 * @param {Object} data
 * @returns {Promise<number>}
 */
async function crearResultadoAuditoria(idAuditoria, data) {
  try {
    const query = `
      INSERT INTO auditoria_resultados (
        id_auditoria,
        puntuacion_seguridad,
        nivel_riesgo,
        resumen_general,
        plan_accion,
        escaneos_totales,
        amenazas_bloqueadas,
        servicios_protegidos
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.execute(query, [
      idAuditoria,
      data.puntuacionSeguridad,
      data.nivelRiesgo,
      data.resumenGeneral,
      data.planAccion,
      data.escaneosTotales,
      data.amenazasBloqueadas,
      data.serviciosProtegidos
    ]);
    return result.insertId;
  } catch (error) {
    throw new Error(`Error creando resultado: ${error.message}`);
  }
}

/**
 * Crear hallazgo
 * @param {number} idAuditoria
 * @param {Object} data
 * @returns {Promise<number>}
 */
async function crearHallazgo(idAuditoria, data) {
  try {
    const query = `
      INSERT INTO auditoria_hallazgos (
        id_auditoria,
        titulo,
        descripcion,
        severidad
      ) VALUES (?, ?, ?, ?)
    `;
    const [result] = await db.execute(query, [
      idAuditoria,
      data.titulo,
      data.descripcion,
      data.severidad
    ]);
    return result.insertId;
  } catch (error) {
    throw new Error(`Error creando hallazgo: ${error.message}`);
  }
}

/**
 * Obtener resultado de auditoría
 * @param {number} idAuditoria
 * @returns {Promise<Object>}
 */
async function obtenerResultadoAuditoria(idAuditoria) {
  try {
    const query = `
      SELECT 
        id_resultado,
        puntuacion_seguridad,
        nivel_riesgo,
        resumen_general,
        plan_accion,
        escaneos_totales,
        amenazas_bloqueadas,
        servicios_protegidos
      FROM auditoria_resultados
      WHERE id_auditoria = ?
      LIMIT 1
    `;
    const [rows] = await db.execute(query, [idAuditoria]);
    
    if (rows.length === 0) return null;
    
    const row = rows[0];
    return {
      idResultado: row.id_resultado,
      puntuacionSeguridad: row.puntuacion_seguridad,
      nivelRiesgo: row.nivel_riesgo,
      resumenGeneral: row.resumen_general,
      planAccion: row.plan_accion,
      escaneosTotales: row.escaneos_totales,
      amenazasBloqueadas: row.amenazas_bloqueadas,
      serviciosProtegidos: row.servicios_protegidos
    };
  } catch (error) {
    throw new Error(`Error obteniendo resultado: ${error.message}`);
  }
}

/**
 * Obtener hallazgos de auditoría
 * @param {number} idAuditoria
 * @returns {Promise<Array>}
 */
async function obtenerHallazgosAuditoria(idAuditoria) {
  try {
    const query = `
      SELECT 
        id_hallazgo,
        titulo,
        descripcion,
        severidad
      FROM auditoria_hallazgos
      WHERE id_auditoria = ? AND estado = 1
      ORDER BY 
        CASE severidad
          WHEN 'critico' THEN 1
          WHEN 'advertencia' THEN 2
          WHEN 'informativo' THEN 3
        END
    `;
    const [rows] = await db.execute(query, [idAuditoria]);
    
    return rows.map(row => ({
      idHallazgo: row.id_hallazgo,
      titulo: row.titulo,
      descripcion: row.descripcion,
      severidad: row.severidad
    }));
  } catch (error) {
    throw new Error(`Error obteniendo hallazgos: ${error.message}`);
  }
}

/**
 * Crear auditoría con proceso
 * @param {number} idEmpresa
 * @param {Object} data - { target, tipo }
 * @returns {Promise<number>}
 */
async function crearAuditoriaProceso(idEmpresa, data) {
  try {
    const query = `
      INSERT INTO auditorias (
        id_empresa,
        target,
        tipo,
        estado_auditoria,
        estado_proceso,
        fecha_inicio
      ) VALUES (?, ?, ?, 'pending', 'procesando', NOW())
    `;
    const [result] = await db.execute(query, [
      idEmpresa,
      data.target,
      data.tipo
    ]);
    return result.insertId;
  } catch (error) {
    throw new Error(`Error creando auditoría: ${error.message}`);
  }
}

/**
 * Actualizar proceso de auditoría
 * @param {number} idAuditoria
 * @param {number} idEmpresa
 * @param {Object} data - { estadoProceso, estadoAuditoria, errorProceso }
 * @returns {Promise<Object>}
 */
async function actualizarAuditoriaProceso(idAuditoria, idEmpresa, data) {
  try {
    let query = `
      UPDATE auditorias
      SET estado_proceso = ?
    `;
    const params = [data.estadoProceso];

    if (data.estadoAuditoria) {
      query += `, estado_auditoria = ?`;
      params.push(data.estadoAuditoria);
    }

    if (data.errorProceso) {
      query += `, error_proceso = ?`;
      params.push(data.errorProceso);
    }

    if (data.estadoProceso === 'completado' || data.estadoProceso === 'fallido') {
      query += `, fecha_fin = NOW()`;
    }

    query += ` WHERE id_auditoria = ? AND id_empresa = ?`;
    params.push(idAuditoria, idEmpresa);

    const [result] = await db.execute(query, params);

    return {
      affectedRows: result.affectedRows,
      success: result.affectedRows > 0
    };
  } catch (error) {
    throw new Error(`Error actualizando auditoría: ${error.message}`);
  }
}

/**
 * Crear múltiples hallazgos de auditoría
 * @param {number} idAuditoria
 * @param {Array} hallazgos - array de { titulo, descripcion, severidad }
 * @returns {Promise<Array>}
 */
async function crearHallazgosAuditoria(idAuditoria, hallazgos) {
  try {
    const ids = [];
    
    for (const hallazgo of hallazgos) {
      const query = `
        INSERT INTO auditoria_hallazgos (
          id_auditoria,
          titulo,
          descripcion,
          severidad
        ) VALUES (?, ?, ?, ?)
      `;
      const [result] = await db.execute(query, [
        idAuditoria,
        hallazgo.titulo,
        hallazgo.descripcion,
        hallazgo.severidad
      ]);
      ids.push(result.insertId);
    }

    return ids;
  } catch (error) {
    throw new Error(`Error creando hallazgos: ${error.message}`);
  }
}

module.exports = {
  obtenerEmpresaPorUsuario,
  crearAuditoria,
  listarAuditorias,
  contarAuditorias,
  obtenerAuditoriaPorId,
  eliminarAuditoria,
  crearResultadoAuditoria,
  crearHallazgo,
  obtenerResultadoAuditoria,
  obtenerHallazgosAuditoria,
  crearAuditoriaProceso,
  actualizarAuditoriaProceso,
  crearHallazgosAuditoria
};
