const db = require('../config/database');

/**
 * Inicializar tablas de phishing plantillas
 * @returns {Promise<void>}
 */
async function inicializarTablasPlantillas() {
  try {
    // Crear tabla phishing_plantillas
    const createPlantillasTable = `
      CREATE TABLE IF NOT EXISTS phishing_plantillas (
        id_plantilla INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(150) NOT NULL,
        asunto VARCHAR(200) NOT NULL,
        contenido_html TEXT NOT NULL,
        imagen_preview_url TEXT,
        estado TINYINT DEFAULT 1,
        fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await db.execute(createPlantillasTable);

    // Verificar si campanas_phishing tiene columna id_plantilla
    const checkColumn = `
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'campanas_phishing' AND COLUMN_NAME = 'id_plantilla'
    `;
    const [rows] = await db.execute(checkColumn);

    if (rows.length === 0) {
      const alterTable = `
        ALTER TABLE campanas_phishing
        ADD COLUMN id_plantilla INT NULL,
        ADD CONSTRAINT fk_campana_plantilla
        FOREIGN KEY (id_plantilla)
        REFERENCES phishing_plantillas(id_plantilla)
        ON DELETE SET NULL
      `;
      await db.execute(alterTable);
    }

    console.log('Tablas de phishing plantillas inicializadas correctamente');
  } catch (error) {
    console.error('Error inicializando tablas de phishing:', error.message);
  }
}

/**
 * Obtener todas las campañas con métricas
 * @returns {Promise<Array>}
 */
async function obtenerCampanas() {
  try {
    const query = `
      SELECT 
        cp.id_campana,
        cp.nombre,
        cp.descripcion,
        cp.asunto_email,
        cp.estado_campana,
        cp.fecha_inicio,
        cp.fecha_fin,
        COUNT(DISTINCT pe.id_empleado) as total_empleados,
        COALESCE(SUM(CASE WHEN pev.tipo_evento = 'clic' THEN 1 ELSE 0 END), 0) as total_clicks,
        COALESCE(SUM(CASE WHEN pev.tipo_evento = 'abierto' THEN 1 ELSE 0 END), 0) as total_abiertos,
        COALESCE(SUM(CASE WHEN pev.tipo_evento = 'reportado' THEN 1 ELSE 0 END), 0) as total_reportados
      FROM campanas_phishing cp
      LEFT JOIN phishing_empleados pe ON cp.id_campana = pe.id_campana
      LEFT JOIN phishing_eventos pev ON cp.id_campana = pev.id_campana
      GROUP BY cp.id_campana
      ORDER BY cp.fecha_inicio DESC
    `;
    const [rows] = await db.execute(query);
    
    return rows.map(row => ({
      id: row.id_campana,
      nombre: row.nombre,
      descripcion: row.descripcion,
      asuntoEmail: row.asunto_email,
      estadoCampana: row.estado_campana,
      fechaInicio: row.fecha_inicio,
      fechaFin: row.fecha_fin,
      totalEmpleados: row.total_empleados || 0,
      totalClicks: row.total_clicks || 0,
      totalAbiertos: row.total_abiertos || 0,
      totalReportados: row.total_reportados || 0
    }));
  } catch (error) {
    throw new Error(`Error obteniendo campañas: ${error.message}`);
  }
}

/**
 * Obtener campaña por ID con métricas
 * @param {number} idCampana
 * @returns {Promise<Object>}
 */
async function obtenerCampanaPorId(idCampana) {
  try {
    const query = `
      SELECT 
        cp.id_campana,
        cp.nombre,
        cp.descripcion,
        cp.asunto_email,
        cp.estado_campana,
        cp.fecha_inicio,
        cp.fecha_fin,
        COUNT(DISTINCT pe.id_empleado) as total_empleados,
        COALESCE(SUM(CASE WHEN pev.tipo_evento = 'clic' THEN 1 ELSE 0 END), 0) as total_clicks,
        COALESCE(SUM(CASE WHEN pev.tipo_evento = 'abierto' THEN 1 ELSE 0 END), 0) as total_abiertos,
        COALESCE(SUM(CASE WHEN pev.tipo_evento = 'reportado' THEN 1 ELSE 0 END), 0) as total_reportados
      FROM campanas_phishing cp
      LEFT JOIN phishing_empleados pe ON cp.id_campana = pe.id_campana
      LEFT JOIN phishing_eventos pev ON cp.id_campana = pev.id_campana
      WHERE cp.id_campana = ?
      GROUP BY cp.id_campana
    `;
    const [rows] = await db.execute(query, [idCampana]);
    if (rows.length === 0) return null;
    
    const row = rows[0];
    return {
      id: row.id_campana,
      nombre: row.nombre,
      descripcion: row.descripcion,
      asuntoEmail: row.asunto_email,
      estadoCampana: row.estado_campana,
      fechaInicio: row.fecha_inicio,
      fechaFin: row.fecha_fin,
      totalEmpleados: row.total_empleados || 0,
      totalClicks: row.total_clicks || 0,
      totalAbiertos: row.total_abiertos || 0,
      totalReportados: row.total_reportados || 0
    };
  } catch (error) {
    throw new Error(`Error obteniendo campaña: ${error.message}`);
  }
}

/**
 * Crear campaña
 * @param {Object} data
 * @returns {Promise<number>}
 */
async function crearCampana(data) {
  try {
    const query = `
      INSERT INTO campanas_phishing (
        id_empresa,
        nombre,
        descripcion,
        asunto_email,
        plantilla_email,
        id_plantilla,
        estado_campana,
        fecha_inicio
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    `;
    const [result] = await db.execute(query, [
      data.idEmpresa,
      data.nombre,
      data.descripcion,
      data.asuntoEmail,
      data.plantillaEmail || '',
      data.idPlantilla || null,
      data.estadoCampana || 'activa'
    ]);
    
    return result.insertId;
  } catch (error) {
    throw new Error(`Error creando campaña: ${error.message}`);
  }
}

/**
 * Actualizar campaña
 * @param {number} idCampana
 * @param {Object} data
 * @returns {Promise<boolean>}
 */
async function actualizarCampana(idCampana, data) {
  try {
    let query = 'UPDATE campanas_phishing SET ';
    const params = [];
    const campos = [];

    if (data.nombre !== undefined) {
      campos.push('nombre = ?');
      params.push(data.nombre);
    }
    if (data.descripcion !== undefined) {
      campos.push('descripcion = ?');
      params.push(data.descripcion);
    }
    if (data.asuntoEmail !== undefined) {
      campos.push('asunto_email = ?');
      params.push(data.asuntoEmail);
    }
    if (data.estadoCampana !== undefined) {
      campos.push('estado_campana = ?');
      params.push(data.estadoCampana);
    }
    if (data.fechaInicio !== undefined) {
      campos.push('fecha_inicio = ?');
      params.push(data.fechaInicio);
    }
    if (data.fechaFin !== undefined) {
      campos.push('fecha_fin = ?');
      params.push(data.fechaFin);
    }

    if (campos.length === 0) return false;

    query += campos.join(', ') + ' WHERE id_campana = ?';
    params.push(idCampana);

    const [result] = await db.execute(query, params);
    return result.affectedRows > 0;
  } catch (error) {
    throw new Error(`Error actualizando campaña: ${error.message}`);
  }
}

/**
 * Eliminar campaña
 * @param {number} idCampana
 * @returns {Promise<boolean>}
 */
async function eliminarCampana(idCampana) {
  try {
    const query = 'DELETE FROM campanas_phishing WHERE id_campana = ?';
    const [result] = await db.execute(query, [idCampana]);
    return result.affectedRows > 0;
  } catch (error) {
    throw new Error(`Error eliminando campaña: ${error.message}`);
  }
}

/**
 * Obtener empleados de una campaña
 * @param {number} idCampana
 * @returns {Promise<Array>}
 */
async function obtenerEmpleadosCampana(idCampana) {
  try {
    const query = `
      SELECT DISTINCT pe.id_empleado
      FROM phishing_empleados pe
      WHERE pe.id_campana = ?
    `;
    const [rows] = await db.execute(query, [idCampana]);
    return rows.map(row => row.id_empleado);
  } catch (error) {
    throw new Error(`Error obteniendo empleados: ${error.message}`);
  }
}

/**
 * Asignar empleados a campaña
 * @param {number} idCampana
 * @param {Array} empleados
 * @returns {Promise<number>}
 */
async function asignarEmpleados(idCampana, empleados) {
  try {
    let asignados = 0;

    for (const idEmpleado of empleados) {
      // Verificar si ya existe
      const checkQuery = 'SELECT id_empleado FROM phishing_empleados WHERE id_campana = ? AND id_empleado = ?';
      const [checkRows] = await db.execute(checkQuery, [idCampana, idEmpleado]);

      if (checkRows.length === 0) {
        const insertQuery = 'INSERT INTO phishing_empleados (id_campana, id_empleado, estado_participacion) VALUES (?, ?, ?)';
        await db.execute(insertQuery, [idCampana, idEmpleado, 'pendiente']);
        asignados++;
      }
    }

    return asignados;
  } catch (error) {
    throw new Error(`Error asignando empleados: ${error.message}`);
  }
}

/**
 * Crear evento phishing
 * @param {Object} data
 * @returns {Promise<number>}
 */
async function crearEventoPhishing(data) {
  try {
    const query = `
      INSERT INTO phishing_eventos (
        id_campana,
        id_empleado,
        tipo_evento,
        fecha_evento
      ) VALUES (?, ?, ?, ?)
    `;
    const [result] = await db.execute(query, [
      data.idCampana,
      data.idEmpleado,
      data.tipoEvento,
      data.fechaEvento
    ]);
    
    return result.insertId;
  } catch (error) {
    throw new Error(`Error creando evento: ${error.message}`);
  }
}

/**
 * Obtener dashboard de campaña
 * @param {number} idCampana
 * @returns {Promise<Object>}
 */
async function obtenerDashboardCampana(idCampana) {
  try {
    const query = `
      SELECT 
        COUNT(DISTINCT pe.id_empleado) as total_empleados,
        COALESCE(SUM(CASE WHEN pev.tipo_evento = 'abierto' THEN 1 ELSE 0 END), 0) as abiertos,
        COALESCE(SUM(CASE WHEN pev.tipo_evento = 'clic' THEN 1 ELSE 0 END), 0) as clicks,
        COALESCE(SUM(CASE WHEN pev.tipo_evento = 'reportado' THEN 1 ELSE 0 END), 0) as reportados,
        COALESCE(SUM(CASE WHEN pev.tipo_evento = 'ignorado' THEN 1 ELSE 0 END), 0) as ignorados
      FROM campanas_phishing cp
      LEFT JOIN phishing_empleados pe ON cp.id_campana = pe.id_campana
      LEFT JOIN phishing_eventos pev ON cp.id_campana = pev.id_campana
      WHERE cp.id_campana = ?
      GROUP BY cp.id_campana
    `;
    const [rows] = await db.execute(query, [idCampana]);
    
    if (rows.length === 0) return null;

    const row = rows[0];
    const total = row.total_empleados || 1;
    const riesgo = Math.round(((row.clicks * 40 + row.abiertos * 10 + row.ignorados * 5) / (total * 100)) * 100);

    return {
      totalEmpleados: row.total_empleados || 0,
      abiertos: row.abiertos || 0,
      clicks: row.clicks || 0,
      reportados: row.reportados || 0,
      ignorados: row.ignorados || 0,
      porcentajeRiesgo: Math.min(100, Math.max(0, riesgo))
    };
  } catch (error) {
    throw new Error(`Error obteniendo dashboard: ${error.message}`);
  }
}

/**
 * Obtener detalle empleados de campaña con eventos
 * @param {number} idCampana
 * @returns {Promise<Array>}
 */
async function obtenerDetalleEmpleadosCampana(idCampana) {
  try {
    const query = `
      SELECT 
        e.id_empleado,
        e.nombre,
        e.departamento,
        CASE 
          WHEN pev.tipo_evento = 'clic' THEN 'Clic'
          WHEN pev.tipo_evento = 'abierto' THEN 'Abierto'
          WHEN pev.tipo_evento = 'reportado' THEN 'Reportó'
          WHEN pev.tipo_evento = 'ignorado' THEN 'No interactuó'
          ELSE 'No interactuó'
        END as estado,
        pev.fecha_evento
      FROM phishing_empleados pe
      LEFT JOIN empleados e ON pe.id_empleado = e.id_empleado
      LEFT JOIN phishing_eventos pev ON pe.id_campana = pev.id_campana AND pe.id_empleado = pev.id_empleado
      WHERE pe.id_campana = ?
      ORDER BY pev.fecha_evento DESC, e.id_empleado ASC
    `;
    const [rows] = await db.execute(query, [idCampana]);

    return rows.map(row => ({
      idEmpleado: row.id_empleado,
      nombre: row.nombre,
      departamento: row.departamento,
      estado: row.estado,
      fechaEvento: row.fecha_evento
    }));
  } catch (error) {
    throw new Error(`Error obteniendo detalle empleados: ${error.message}`);
  }
}

/**
 * Obtener historial de campañas finalizadas
 * @returns {Promise<Array>}
 */
async function obtenerHistorialCampanas() {
  try {
    const query = `
      SELECT 
        cp.id_campana,
        cp.nombre,
        cp.fecha_inicio,
        cp.fecha_fin,
        COUNT(DISTINCT pe.id_empleado) as empleados,
        COALESCE(SUM(CASE WHEN pev.tipo_evento = 'clic' THEN 1 ELSE 0 END), 0) as clicks,
        COALESCE(SUM(CASE WHEN pev.tipo_evento = 'reportado' THEN 1 ELSE 0 END), 0) as reportados
      FROM campanas_phishing cp
      LEFT JOIN phishing_empleados pe ON cp.id_campana = pe.id_campana
      LEFT JOIN phishing_eventos pev ON cp.id_campana = pev.id_campana
      WHERE cp.estado_campana = 'finalizada'
      GROUP BY cp.id_campana
      ORDER BY cp.fecha_fin DESC
    `;
    const [rows] = await db.execute(query);

    return rows.map(row => ({
      id: row.id_campana,
      nombre: row.nombre,
      fecha: row.fecha_fin,
      empleados: row.empleados || 0,
      clicks: row.clicks || 0,
      reportados: row.reportados || 0,
      riesgo: Math.min(100, Math.max(0, Math.round((row.clicks * 40) / ((row.empleados || 1) * 100) * 100)))
    }));
  } catch (error) {
    throw new Error(`Error obteniendo historial: ${error.message}`);
  }
}

/**
 * Obtener detalle empleado con historial
 * @param {number} idEmpleado
 * @returns {Promise<Object>}
 */
async function obtenerDetalleEmpleado(idEmpleado) {
  try {
    const query = `
      SELECT 
        cp.id_campana,
        cp.nombre as nombre_campana,
        COALESCE(SUM(CASE WHEN pev.tipo_evento = 'clic' THEN 1 ELSE 0 END), 0) as clicks,
        COALESCE(SUM(CASE WHEN pev.tipo_evento = 'reportado' THEN 1 ELSE 0 END), 0) as reportados,
        COALESCE(SUM(CASE WHEN pev.tipo_evento = 'abierto' THEN 1 ELSE 0 END), 0) as abiertos,
        COALESCE(SUM(CASE WHEN pev.tipo_evento = 'ignorado' THEN 1 ELSE 0 END), 0) as ignorados
      FROM phishing_empleados pe
      LEFT JOIN campanas_phishing cp ON pe.id_campana = cp.id_campana
      LEFT JOIN phishing_eventos pev ON pe.id_campana = pev.id_campana AND pe.id_empleado = pev.id_empleado
      WHERE pe.id_empleado = ?
      GROUP BY cp.id_campana
      ORDER BY cp.fecha_inicio DESC
    `;
    const [rows] = await db.execute(query, [idEmpleado]);

    let totalClicks = 0;
    let totalReportados = 0;
    let totalAbiertos = 0;
    let totalIgnorados = 0;

    const campanas = rows.map(row => {
      totalClicks += row.clicks;
      totalReportados += row.reportados;
      totalAbiertos += row.abiertos;
      totalIgnorados += row.ignorados;

      return {
        idCampana: row.id_campana,
        nombreCampana: row.nombre_campana,
        clicks: row.clicks,
        reportados: row.reportados,
        abiertos: row.abiertos,
        ignorados: row.ignorados
      };
    });

    // Calcular riesgo usuario: clic +40, abierto +10, ignorado +5, reportado -20
    let riesgoUsuario = (totalClicks * 40) + (totalAbiertos * 10) + (totalIgnorados * 5) - (totalReportados * 20);
    riesgoUsuario = Math.min(100, Math.max(0, riesgoUsuario));

    return {
      idEmpleado,
      campanas,
      cantidadClicks: totalClicks,
      cantidadReportes: totalReportados,
      cantidadAbiertos: totalAbiertos,
      cantidadIgnorados: totalIgnorados,
      riesgoUsuario
    };
  } catch (error) {
    throw new Error(`Error obteniendo detalle empleado: ${error.message}`);
  }
}

/**
 * Obtener empresa de usuario
 * @param {number} idUsuario
 * @returns {Promise<number>}
 */
async function obtenerEmpresaPorUsuario(idUsuario) {
  try {
    const query = `
      SELECT id_empresa FROM empresas WHERE id_usuario = ? AND estado = 1
    `;
    const [rows] = await db.execute(query, [idUsuario]);
    if (rows.length === 0) return null;
    return rows[0].id_empresa;
  } catch (error) {
    throw new Error(`Error obteniendo empresa: ${error.message}`);
  }
}

/**
 * Listar plantillas activas
 * @returns {Promise<Array>}
 */
async function listarPlantillas() {
  try {
    const query = `
      SELECT 
        id_plantilla,
        nombre,
        asunto,
        imagen_preview_url
      FROM phishing_plantillas
      WHERE estado = 1
      ORDER BY fecha_registro DESC
    `;
    const [rows] = await db.execute(query);
    return rows.map(row => ({
      idPlantilla: row.id_plantilla,
      nombre: row.nombre,
      asunto: row.asunto,
      imagenPreviewUrl: row.imagen_preview_url
    }));
  } catch (error) {
    throw new Error(`Error listando plantillas: ${error.message}`);
  }
}

/**
 * Obtener plantilla por ID
 * @param {number} idPlantilla
 * @returns {Promise<Object>}
 */
async function obtenerPlantillaPorId(idPlantilla) {
  try {
    const query = `
      SELECT 
        id_plantilla,
        nombre,
        asunto,
        contenido_html,
        imagen_preview_url
      FROM phishing_plantillas
      WHERE id_plantilla = ? AND estado = 1
    `;
    const [rows] = await db.execute(query, [idPlantilla]);
    if (rows.length === 0) return null;
    
    const row = rows[0];
    return {
      idPlantilla: row.id_plantilla,
      nombre: row.nombre,
      asunto: row.asunto,
      contenidoHtml: row.contenido_html,
      imagenPreviewUrl: row.imagen_preview_url
    };
  } catch (error) {
    throw new Error(`Error obteniendo plantilla: ${error.message}`);
  }
}

/**
 * Validar que empleados pertenecen a empresa
 * @param {number} idEmpresa
 * @param {Array} empleados
 * @returns {Promise<boolean>}
 */
async function validarEmpleadosEmpresa(idEmpresa, empleados) {
  try {
    if (!empleados || empleados.length === 0) return false;

    const placeholders = empleados.map(() => '?').join(',');
    const query = `
      SELECT COUNT(*) as total FROM empleados 
      WHERE id_empresa = ? AND id_empleado IN (${placeholders})
    `;
    const params = [idEmpresa, ...empleados];
    const [rows] = await db.execute(query, params);
    
    return rows[0].total === empleados.length;
  } catch (error) {
    throw new Error(`Error validando empleados: ${error.message}`);
  }
}

/**
 * Crear eventos iniciales "enviado" para campaña
 * @param {number} idCampana
 * @param {Array} empleados
 * @returns {Promise<number>}
 */
async function crearEventosIniciales(idCampana, empleados) {
  try {
    let eventosCreados = 0;

    for (const idEmpleado of empleados) {
      const query = `
        INSERT INTO phishing_eventos (
          id_campana,
          id_empleado,
          tipo_evento,
          fecha_evento
        ) VALUES (?, ?, 'enviado', NOW())
      `;
      await db.execute(query, [idCampana, idEmpleado]);
      eventosCreados++;
    }

    return eventosCreados;
  } catch (error) {
    throw new Error(`Error creando eventos iniciales: ${error.message}`);
  }
}

module.exports = {
  inicializarTablasPlantillas,
  obtenerCampanas,
  obtenerCampanaPorId,
  crearCampana,
  actualizarCampana,
  eliminarCampana,
  obtenerEmpleadosCampana,
  asignarEmpleados,
  crearEventoPhishing,
  obtenerDashboardCampana,
  obtenerDetalleEmpleadosCampana,
  obtenerHistorialCampanas,
  obtenerDetalleEmpleado,
  obtenerEmpresaPorUsuario,
  listarPlantillas,
  obtenerPlantillaPorId,
  validarEmpleadosEmpresa,
  crearEventosIniciales
};
