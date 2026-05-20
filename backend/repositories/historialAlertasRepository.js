const db = require('../config/database');

class HistorialAlertasRepository {
  /**
   * Obtener empresa asociada al usuario
   * @param {number} idUsuario
   * @returns {Promise<Object>} { id_empresa, nombre_empresa }
   */
  async obtenerEmpresaPorUsuario(idUsuario) {
    const query = `
      SELECT id_empresa, nombre_empresa
      FROM empresas
      WHERE id_usuario = ? AND estado = 1
      LIMIT 1
    `;
    const rows = await db.query(query, [idUsuario]);
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Listar historial de alertas resueltas con filtros
   * @param {Object} filtros - {idEmpresa, categoria, severidad, busqueda, page, pageSize}
   * @returns {Promise<Array>}
   */
  async listarHistorial(filtros) {
    const { idEmpresa, categoria, severidad, busqueda, page = 1, pageSize = 10 } = filtros;

    let query = `
      SELECT 
        id_incidencia as idIncidencia,
        codigo_incidencia as codigoIncidencia,
        titulo,
        categoria,
        severidad,
        fecha_resolucion as fechaResolucion,
        administrador_responsable as administradorResponsable,
        metodo_resolucion as metodoResolucion,
        criticidad_reducida as criticidadReducida,
        tiempo_respuesta_segundos as tiempoRespuestaSegundos
      FROM incidencias_seguridad
      WHERE id_empresa = ? 
        AND estado = 1 
        AND estado_incidencia = 'resuelta'
    `;

    const params = [idEmpresa];

    // Filtro por categoría
    if (categoria) {
      query += ` AND categoria = ?`;
      params.push(categoria);
    }

    // Filtro por severidad
    if (severidad) {
      query += ` AND severidad = ?`;
      params.push(severidad);
    }

    // Búsqueda por código, título o administrador
    if (busqueda) {
      query += ` AND (codigo_incidencia LIKE ? OR titulo LIKE ? OR administrador_responsable LIKE ?)`;
      const searchTerm = `%${busqueda}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    // Ordenar por fecha de resolución descendente
    query += ` ORDER BY fecha_resolucion DESC`;

    // Paginación
    const offset = (page - 1) * pageSize;
    query += ` LIMIT ? OFFSET ?`;
    params.push(pageSize, offset);

    const rows = await db.query(query, params);
    return rows;
  }

  /**
   * Contar historial de alertas resueltas
   * @param {Object} filtros - {idEmpresa, categoria, severidad, busqueda}
   * @returns {Promise<number>}
   */
  async contarHistorial(filtros) {
    const { idEmpresa, categoria, severidad, busqueda } = filtros;

    let query = `
      SELECT COUNT(*) as total
      FROM incidencias_seguridad
      WHERE id_empresa = ? 
        AND estado = 1 
        AND estado_incidencia = 'resuelta'
    `;

    const params = [idEmpresa];

    // Filtro por categoría
    if (categoria) {
      query += ` AND categoria = ?`;
      params.push(categoria);
    }

    // Filtro por severidad
    if (severidad) {
      query += ` AND severidad = ?`;
      params.push(severidad);
    }

    // Búsqueda
    if (busqueda) {
      query += ` AND (codigo_incidencia LIKE ? OR titulo LIKE ? OR administrador_responsable LIKE ?)`;
      const searchTerm = `%${busqueda}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    const rows = await db.query(query, params);
    return rows[0].total;
  }

  /**
   * Obtener resumen de alertas resueltas
   * Calcula: totalResueltasMes, tiempoMedioRespuesta, criticidadReducidaPromedio
   * @param {number} idEmpresa
   * @returns {Promise<Object>}
   */
  async obtenerResumen(idEmpresa) {
    const query = `
      SELECT 
        COUNT(*) as totalResueltasMes,
        ROUND(AVG(tiempo_respuesta_segundos)) as tiempoMedioRespuesta,
        ROUND(AVG(criticidad_reducida), 2) as criticidadReducidaPromedio
      FROM incidencias_seguridad
      WHERE id_empresa = ? 
        AND estado = 1 
        AND estado_incidencia = 'resuelta'
        AND YEAR(fecha_resolucion) = YEAR(CURDATE())
        AND MONTH(fecha_resolucion) = MONTH(CURDATE())
    `;

    const rows = await db.query(query, [idEmpresa]);

    return {
      totalResueltasMes: rows[0].totalResueltasMes || 0,
      tiempoMedioRespuesta: rows[0].tiempoMedioRespuesta || 0,
      criticidadReducidaPromedio: parseFloat(rows[0].criticidadReducidaPromedio || 0).toFixed(2)
    };
  }

  /**
   * Obtener incidencia por ID
   * @param {number} idIncidencia
   * @param {number} idEmpresa - para validar propiedad
   * @returns {Promise<Object>}
   */
  async obtenerIncidenciaPorId(idIncidencia, idEmpresa) {
    const query = `
      SELECT 
        id_incidencia as idIncidencia,
        codigo_incidencia as codigoIncidencia,
        titulo,
        categoria,
        severidad,
        estado_incidencia as estadoIncidencia,
        estado_incidencia,
        fecha_registro as fechaRegistro,
        fecha_resolucion as fechaResolucion,
        tiempo_respuesta_segundos as tiempoRespuestaSegundos,
        metodo_resolucion as metodoResolucion,
        administrador_responsable as administradorResponsable,
        criticidad_reducida as criticidadReducida
      FROM incidencias_seguridad
      WHERE id_incidencia = ? AND id_empresa = ? AND estado = 1
    `;

    const rows = await db.query(query, [idIncidencia, idEmpresa]);
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Resolver incidencia - actualizar estado y detalles
   * @param {number} idIncidencia
   * @param {number} idEmpresa
   * @param {Object} data - {metodoResolucion, administradorResponsable, criticidadReducida}
   * @returns {Promise<Object>}
   */
  async resolverIncidencia(idIncidencia, idEmpresa, data) {
    const { metodoResolucion, administradorResponsable, criticidadReducida } = data;

    const query = `
      UPDATE incidencias_seguridad
      SET 
        estado_incidencia = 'resuelta',
        fecha_resolucion = NOW(),
        metodo_resolucion = ?,
        administrador_responsable = ?,
        criticidad_reducida = ?,
        tiempo_respuesta_segundos = TIMESTAMPDIFF(SECOND, fecha_registro, NOW()),
        ultima_actualizacion = NOW()
      WHERE id_incidencia = ? AND id_empresa = ? AND estado = 1
    `;

    await db.query(query, [
      metodoResolucion,
      administradorResponsable,
      criticidadReducida,
      idIncidencia,
      idEmpresa
    ]);

    return { idIncidencia };
  }

  /**
   * Crear evento en timeline
   * @param {number} idIncidencia
   * @param {Object} data - {titulo, descripcion, tipoEvento}
   * @returns {Promise<Object>}
   */
  async crearEventoTimeline(idIncidencia, data) {
    const { titulo, descripcion, tipoEvento } = data;

    const query = `
      INSERT INTO incidencia_timeline 
      (id_incidencia, titulo, descripcion, fecha_evento, tipo_evento, estado, fecha_registro)
      VALUES (?, ?, ?, NOW(), ?, 1, NOW())
    `;

    const result = await db.query(query, [
      idIncidencia,
      titulo,
      descripcion,
      tipoEvento
    ]);

    return { idTimeline: result?.insertId || result[0]?.insertId };
  }

  /**
   * Marcar acciones como ejecutadas
   * @param {number} idIncidencia
   * @returns {Promise<void>}
   */
  async marcarAccionesEjecutadas(idIncidencia) {
    const query = `
      UPDATE incidencia_acciones
      SET ejecutada = 1, fecha_ejecucion = NOW()
      WHERE id_incidencia = ? AND ejecutada = 0 AND estado = 1
    `;

    await db.query(query, [idIncidencia]);
  }

  /**
   * Exportar historial de alertas resueltas
   * @param {number} idEmpresa
   * @returns {Promise<Array>}
   */
  async exportarHistorial(idEmpresa) {
    const query = `
      SELECT 
        codigo_incidencia as codigoIncidencia,
        titulo,
        categoria,
        severidad,
        DATE(fecha_resolucion) as fechaResolucion,
        administrador_responsable as administradorResponsable,
        metodo_resolucion as metodoResolucion,
        criticidad_reducida as criticidadReducida,
        tiempo_respuesta_segundos as tiempoRespuestaSegundos
      FROM incidencias_seguridad
      WHERE id_empresa = ? 
        AND estado = 1 
        AND estado_incidencia = 'resuelta'
      ORDER BY fecha_resolucion DESC
    `;

    const rows = await db.query(query, [idEmpresa]);
    return rows;
  }
}

module.exports = new HistorialAlertasRepository();
