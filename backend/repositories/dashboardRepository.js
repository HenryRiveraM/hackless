const db = require('../config/database');

/**
 * Dashboard Repository
 * Capa de acceso a datos para el dashboard
 */

/**
 * Obtener empresa asociada a un usuario
 * @param {number} idUsuario
 * @returns {Promise<Object>} Empresa del usuario
 */
async function obtenerEmpresaPorUsuario(idUsuario) {
  try {
    const query = `
      SELECT id_empresa, nombre_empresa
      FROM empresas
      WHERE id_usuario = ? AND estado = 1
      LIMIT 1
    `;
    const rows = await db.query(query, [idUsuario]);
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    throw new Error(`Error obteniendo empresa: ${error.message}`);
  }
}

/**
 * Obtener puntaje de seguridad promedio
 * @param {number} idEmpresa
 * @returns {Promise<number>} Puntaje promedio
 */
async function obtenerPuntajeSeguridad(idEmpresa) {
  try {
    const query = `
      SELECT AVG(puntaje_seguridad) as puntaje
      FROM empleados
      WHERE id_empresa = ? AND estado = 1
    `;
    const rows = await db.query(query, [idEmpresa]);
    return rows.length > 0 ? Math.round(rows[0].puntaje || 0) : 0;
  } catch (error) {
    throw new Error(`Error obteniendo puntaje de seguridad: ${error.message}`);
  }
}

/**
 * Contar total de empleados activos
 * @param {number} idEmpresa
 * @returns {Promise<number>} Total de empleados
 */
async function contarTotalEmpleados(idEmpresa) {
  try {
    const query = `
      SELECT COUNT(*) as total
      FROM empleados
      WHERE id_empresa = ? AND estado = 1
    `;
    const rows = await db.query(query, [idEmpresa]);
    return rows[0].total || 0;
  } catch (error) {
    throw new Error(`Error contando empleados: ${error.message}`);
  }
}

/**
 * Contar empleados con capacitación completada
 * @param {number} idEmpresa
 * @returns {Promise<number>} Empleados capacitados
 */
async function contarEmpleadosCapacitados(idEmpresa) {
  try {
    const query = `
      SELECT COUNT(*) as total
      FROM empleados
      WHERE id_empresa = ? AND estado = 1
      AND estado_capacitacion = 'completado'
    `;
    const rows = await db.query(query, [idEmpresa]);
    return rows[0].total || 0;
  } catch (error) {
    throw new Error(`Error contando capacitados: ${error.message}`);
  }
}

/**
 * Contar capacitaciones pendientes
 * @param {number} idEmpresa
 * @returns {Promise<number>} Capacitaciones pendientes
 */
async function contarCapacitacionesPendientes(idEmpresa) {
  try {
    const query = `
      SELECT COUNT(*) as total
      FROM empleados
      WHERE id_empresa = ? AND estado = 1
      AND estado_capacitacion IN ('pendiente', 'en_progreso', 'vencido')
    `;
    const rows = await db.query(query, [idEmpresa]);
    return rows[0].total || 0;
  } catch (error) {
    throw new Error(`Error contando pendientes: ${error.message}`);
  }
}

/**
 * Obtener última auditoría realizada
 * @param {number} idEmpresa
 * @returns {Promise<Object>} Última auditoría
 */
async function obtenerUltimaAuditoria(idEmpresa) {
  try {
    const query = `
      SELECT fecha_registro, estado
      FROM reportes_ejecutivos
      WHERE id_empresa = ? AND estado = 1
      ORDER BY fecha_registro DESC
      LIMIT 1
    `;
    const rows = await db.query(query, [idEmpresa]);
    
    if (rows.length === 0) {
      return {
        fecha: null,
        estado: 'Sin auditorías'
      };
    }
    
    return {
      fecha: rows[0].fecha_registro ? rows[0].fecha_registro.toISOString().split('T')[0] : null,
      estado: rows[0].estado === 1 ? 'Completada' : 'Pendiente'
    };
  } catch (error) {
    throw new Error(`Error obteniendo última auditoría: ${error.message}`);
  }
}

/**
 * Contar puertos abiertos detectados
 * @param {number} idEmpresa
 * @returns {Promise<number>} Puertos abiertos
 */
async function contarPuertosAbiertosDetectados(idEmpresa) {
  try {
    const query = `
      SELECT COUNT(*) as total
      FROM incidencias_seguridad
      WHERE id_empresa = ? 
      AND estado = 1 
      AND estado_incidencia != 'resuelta'
      AND (
        categoria = 'vulnerabilidades'
        OR titulo LIKE '%puerto%'
      )
    `;
    const rows = await db.query(query, [idEmpresa]);
    return rows[0].total || 0;
  } catch (error) {
    throw new Error(`Error contando puertos abiertos: ${error.message}`);
  }
}

/**
 * Obtener datos de phishing
 * @param {number} idEmpresa
 * @returns {Promise<Object>} Datos de phishing
 */
async function obtenerDatosPhishing(idEmpresa) {
  try {
    // Total de empleados
    const queryTotal = `
      SELECT COUNT(*) as total
      FROM empleados
      WHERE id_empresa = ? AND estado = 1
    `;
    const rowsTotal = await db.query(queryTotal, [idEmpresa]);
    const totalEmpleados = rowsTotal[0]?.total || 0;
    
    // Empleados seguros (no vencidos)
    const querySeguros = `
      SELECT COUNT(*) as total
      FROM empleados
      WHERE id_empresa = ? AND estado = 1
      AND estado_capacitacion != 'vencido'
    `;
    const rowsSeguros = await db.query(querySeguros, [idEmpresa]);
    const seguros = rowsSeguros[0]?.total || 0;
    
    // Empleados con clics (vencidos)
    const queryClics = `
      SELECT COUNT(*) as total
      FROM empleados
      WHERE id_empresa = ? AND estado = 1
      AND estado_capacitacion = 'vencido'
    `;
    const rowsClics = await db.query(queryClics, [idEmpresa]);
    const clics = rowsClics[0]?.total || 0;
    
    // Calcular porcentaje
    const porcentajeSeguro = totalEmpleados > 0 
      ? Math.round((seguros / totalEmpleados) * 100) 
      : 0;
    
    return {
      porcentajeSeguro,
      seguros,
      clics
    };
  } catch (error) {
    throw new Error(`Error obteniendo datos de phishing: ${error.message}`);
  }
}

/**
 * Obtener progreso de capacitación últimos 6 meses
 * @param {number} idEmpresa
 * @returns {Promise<Array>} Progreso por mes
 */
async function obtenerProgresoCapacitacion(idEmpresa) {
  try {
    const query = `
      SELECT 
        DATE_FORMAT(fecha_registro, '%Y-%m') as mes,
        COUNT(*) as cantidad
      FROM empleados
      WHERE id_empresa = ? AND estado = 1
      AND estado_capacitacion = 'completado'
      AND fecha_registro >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(fecha_registro, '%Y-%m')
      ORDER BY mes ASC
    `;
    const rows = await db.query(query, [idEmpresa]);
    
    // Mapear meses
    const mesesSpanish = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const resultado = [];
    
    // Inicializar últimos 6 meses
    const ahora = new Date();
    for (let i = 5; i >= 0; i--) {
      const fecha = new Date();
      fecha.setMonth(fecha.getMonth() - i);
      const mesNum = fecha.getMonth();
      const mesStr = mesesSpanish[mesNum];
      resultado.push({
        mes: mesStr,
        valor: 0
      });
    }
    
    // Llenar valores desde la BD
    rows.forEach(row => {
      const [year, month] = row.mes.split('-');
      const mesNum = parseInt(month) - 1;
      const mesStr = mesesSpanish[mesNum];
      
      const idx = resultado.findIndex(r => r.mes === mesStr);
      if (idx !== -1) {
        resultado[idx].valor = row.cantidad;
      }
    });
    
    return resultado;
  } catch (error) {
    throw new Error(`Error obteniendo progreso de capacitación: ${error.message}`);
  }
}

/**
 * Listar recomendaciones de seguridad
 * @param {number} idEmpresa
 * @param {Object} filtros Filtros opcionales
 * @returns {Promise<Array>} Lista de recomendaciones
 */
async function listarRecomendaciones(idEmpresa, filtros = {}) {
  try {
    let query = `
      SELECT 
        id_recomendacion,
        titulo,
        descripcion,
        prioridad,
        accion_texto,
        accion_url,
        estado_recomendacion,
        fecha_registro
      FROM recomendaciones_seguridad
      WHERE id_empresa = ? AND estado = 1
    `;
    
    const params = [idEmpresa];
    
    // Filtro por prioridad
    if (filtros.prioridad) {
      query += ` AND prioridad = ?`;
      params.push(filtros.prioridad);
    }
    
    // Filtro por estado de recomendación
    if (filtros.estadoRecomendacion) {
      query += ` AND estado_recomendacion = ?`;
      params.push(filtros.estadoRecomendacion);
    }
    
    // Ordenar por prioridad y fecha
    query += `
      ORDER BY
        CASE prioridad
          WHEN 'urgente' THEN 1
          WHEN 'atencion' THEN 2
          WHEN 'baja' THEN 3
        END,
        fecha_registro DESC
    `;
    
    const rows = await db.query(query, params);
    
    // Mapear salida
    return rows.map(row => ({
      idRecomendacion: row.id_recomendacion,
      titulo: row.titulo,
      descripcion: row.descripcion,
      prioridad: row.prioridad,
      accionTexto: row.accion_texto,
      accionUrl: row.accion_url,
      estadoRecomendacion: row.estado_recomendacion,
      fechaRegistro: row.fecha_registro
    }));
  } catch (error) {
    throw new Error(`Error listando recomendaciones: ${error.message}`);
  }
}

/**
 * Crear recomendación de seguridad
 * @param {number} idEmpresa
 * @param {Object} data Datos de la recomendación
 * @returns {Promise<number>} ID de la recomendación creada
 */
async function crearRecomendacion(idEmpresa, data) {
  try {
    const query = `
      INSERT INTO recomendaciones_seguridad (
        id_empresa,
        titulo,
        descripcion,
        prioridad,
        accion_texto,
        accion_url,
        estado_recomendacion
      ) VALUES (?, ?, ?, ?, ?, ?, 'pendiente')
    `;
    
    const params = [
      idEmpresa,
      data.titulo,
      data.descripcion || null,
      data.prioridad || 'atencion',
      data.accionTexto || null,
      data.accionUrl || null
    ];
    
    const result = await db.query(query, params);
    return result.insertId;
  } catch (error) {
    throw new Error(`Error creando recomendación: ${error.message}`);
  }
}

/**
 * Obtener recomendación por ID
 * @param {number} idRecomendacion
 * @param {number} idEmpresa
 * @returns {Promise<Object>} Datos de la recomendación
 */
async function obtenerRecomendacionPorId(idRecomendacion, idEmpresa) {
  try {
    const query = `
      SELECT 
        id_recomendacion,
        titulo,
        descripcion,
        prioridad,
        accion_texto,
        accion_url,
        estado_recomendacion,
        fecha_registro
      FROM recomendaciones_seguridad
      WHERE id_recomendacion = ? AND id_empresa = ? AND estado = 1
    `;
    
    const rows = await db.query(query, [idRecomendacion, idEmpresa]);
    
    if (rows.length === 0) {
      return null;
    }
    
    const row = rows[0];
    return {
      idRecomendacion: row.id_recomendacion,
      titulo: row.titulo,
      descripcion: row.descripcion,
      prioridad: row.prioridad,
      accionTexto: row.accion_texto,
      accionUrl: row.accion_url,
      estadoRecomendacion: row.estado_recomendacion,
      fechaRegistro: row.fecha_registro
    };
  } catch (error) {
    throw new Error(`Error obteniendo recomendación: ${error.message}`);
  }
}

/**
 * Actualizar estado de recomendación
 * @param {number} idRecomendacion
 * @param {number} idEmpresa
 * @param {string} estadoRecomendacion
 * @returns {Promise<Object>} Resultado de la actualización
 */
async function actualizarEstadoRecomendacion(idRecomendacion, idEmpresa, estadoRecomendacion) {
  try {
    const query = `
      UPDATE recomendaciones_seguridad
      SET estado_recomendacion = ?
      WHERE id_recomendacion = ? AND id_empresa = ? AND estado = 1
    `;
    
    const result = await db.query(query, [estadoRecomendacion, idRecomendacion, idEmpresa]);
    
    return {
      affectedRows: result.affectedRows,
      success: result.affectedRows > 0
    };
  } catch (error) {
    throw new Error(`Error actualizando recomendación: ${error.message}`);
  }
}

/**
 * Eliminar recomendación (soft delete)
 * @param {number} idRecomendacion
 * @param {number} idEmpresa
 * @returns {Promise<Object>} Resultado de la eliminación
 */
async function eliminarRecomendacion(idRecomendacion, idEmpresa) {
  try {
    const query = `
      UPDATE recomendaciones_seguridad
      SET estado = 0
      WHERE id_recomendacion = ? AND id_empresa = ? AND estado = 1
    `;
    
    const result = await db.query(query, [idRecomendacion, idEmpresa]);
    
    return {
      affectedRows: result.affectedRows,
      success: result.affectedRows > 0
    };
  } catch (error) {
    throw new Error(`Error eliminando recomendación: ${error.message}`);
  }
}

module.exports = {
  obtenerEmpresaPorUsuario,
  obtenerPuntajeSeguridad,
  contarTotalEmpleados,
  contarEmpleadosCapacitados,
  contarCapacitacionesPendientes,
  obtenerUltimaAuditoria,
  contarPuertosAbiertosDetectados,
  obtenerDatosPhishing,
  obtenerProgresoCapacitacion,
  listarRecomendaciones,
  crearRecomendacion,
  obtenerRecomendacionPorId,
  actualizarEstadoRecomendacion,
  eliminarRecomendacion
};
