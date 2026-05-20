const historialRepository = require('../repositories/historialAlertasRepository');

class HistorialAlertasService {
  /**
   * Listar historial de alertas resueltas
   * @param {number} idUsuario
   * @param {Object} filtros
   * @returns {Promise<Object>}
   */
  async listarHistorial(idUsuario, filtros) {
    // 1. Obtener empresa del usuario
    const empresa = await historialRepository.obtenerEmpresaPorUsuario(idUsuario);
    if (!empresa) {
      throw new Error('No existe una empresa asociada al usuario autenticado');
    }

    const idEmpresa = empresa.id_empresa;

    // 2. Validar paginación
    const page = parseInt(filtros.page) || 1;
    const pageSize = parseInt(filtros.pageSize) || 10;

    if (page < 1) {
      throw new Error('El número de página debe ser mayor a 0');
    }

    if (pageSize < 1 || pageSize > 100) {
      throw new Error('El tamaño de página debe estar entre 1 y 100');
    }

    // 3. Listar historial
    const items = await historialRepository.listarHistorial({
      idEmpresa,
      categoria: filtros.categoria,
      severidad: filtros.severidad,
      busqueda: filtros.busqueda,
      page,
      pageSize
    });

    // 4. Contar total
    const total = await historialRepository.contarHistorial({
      idEmpresa,
      categoria: filtros.categoria,
      severidad: filtros.severidad,
      busqueda: filtros.busqueda
    });

    return {
      items,
      total,
      page,
      pageSize
    };
  }

  /**
   * Obtener resumen de alertas resueltas
   * @param {number} idUsuario
   * @returns {Promise<Object>}
   */
  async obtenerResumen(idUsuario) {
    // 1. Obtener empresa del usuario
    const empresa = await historialRepository.obtenerEmpresaPorUsuario(idUsuario);
    if (!empresa) {
      throw new Error('No existe una empresa asociada al usuario autenticado');
    }

    const idEmpresa = empresa.id_empresa;

    // 2. Obtener resumen
    const resumen = await historialRepository.obtenerResumen(idEmpresa);

    return resumen;
  }

  /**
   * Resolver una incidencia
   * @param {number} idUsuario
   * @param {number} idIncidencia
   * @param {Object} data - {metodoResolucion, administradorResponsable, criticidadReducida}
   * @returns {Promise<Object>}
   */
  async resolverIncidencia(idUsuario, idIncidencia, data) {
    // 1. Obtener empresa del usuario
    const empresa = await historialRepository.obtenerEmpresaPorUsuario(idUsuario);
    if (!empresa) {
      throw new Error('No existe una empresa asociada al usuario autenticado');
    }

    const idEmpresa = empresa.id_empresa;

    // 2. Validar datos requeridos
    if (!data.metodoResolucion || data.metodoResolucion.trim() === '') {
      throw new Error('El método de resolución es obligatorio');
    }

    if (!data.administradorResponsable || data.administradorResponsable.trim() === '') {
      throw new Error('El administrador responsable es obligatorio');
    }

    // 3. Validar criticidad reducida
    const criticidad = parseFloat(data.criticidadReducida);
    if (isNaN(criticidad) || criticidad < 0 || criticidad > 100) {
      throw new Error('La criticidad reducida debe estar entre 0 y 100');
    }

    // 4. Validar método de resolución permitido
    const metodosPermitidos = [
      'Automatico',
      'Manual',
      'Password Reset',
      'MFA',
      'Bloqueo IP',
      'Revocacion Sesiones'
    ];

    if (!metodosPermitidos.includes(data.metodoResolucion)) {
      throw new Error(`El método de resolución no es válido. Métodos permitidos: ${metodosPermitidos.join(', ')}`);
    }

    // 5. Verificar que la incidencia existe
    const incidencia = await historialRepository.obtenerIncidenciaPorId(idIncidencia, idEmpresa);
    if (!incidencia) {
      throw new Error('La incidencia no existe');
    }

    // 6. Verificar que no esté ya resuelta
    if (incidencia.estado_incidencia === 'resuelta') {
      throw new Error('La incidencia ya está resuelta');
    }

    // 7. Resolver incidencia
    await historialRepository.resolverIncidencia(idIncidencia, idEmpresa, {
      metodoResolucion: data.metodoResolucion,
      administradorResponsable: data.administradorResponsable,
      criticidadReducida: criticidad
    });

    // 8. Crear evento en timeline
    await historialRepository.crearEventoTimeline(idIncidencia, {
      titulo: 'Incidencia Resuelta',
      descripcion: 'Incidencia mitigada exitosamente',
      tipoEvento: 'resolucion'
    });

    // 9. Marcar acciones relacionadas como ejecutadas (opcional)
    await historialRepository.marcarAccionesEjecutadas(idIncidencia);

    return {
      idIncidencia,
      estadoIncidencia: 'resuelta',
      fechaResolucion: new Date().toISOString()
    };
  }

  /**
   * Exportar historial de alertas resueltas
   * @param {number} idUsuario
   * @param {string} formato - 'json', 'csv', 'pdf'
   * @returns {Promise<Object>}
   */
  async exportarHistorial(idUsuario, formato = 'json') {
    // 1. Validar formato
    const formatosPermitidos = ['json', 'csv', 'pdf'];
    if (!formatosPermitidos.includes(formato)) {
      const error = new Error('Formato de exportación inválido');
      error.statusCode = 400;
      throw error;
    }

    // 2. Obtener empresa del usuario
    const empresa = await historialRepository.obtenerEmpresaPorUsuario(idUsuario);
    if (!empresa) {
      throw new Error('No existe una empresa asociada al usuario autenticado');
    }

    const idEmpresa = empresa.id_empresa;

    // 3. Exportar historial
    const historial = await historialRepository.exportarHistorial(idEmpresa);

    return {
      formato,
      data: historial
    };
  }
}

module.exports = new HistorialAlertasService();
