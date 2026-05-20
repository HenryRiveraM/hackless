const dashboardRepository = require('../repositories/dashboardRepository');

/**
 * Dashboard Service
 * Lógica de negocio para el dashboard
 */

/**
 * Obtener resumen del dashboard
 * @param {number} idUsuario
 * @returns {Promise<Object>} Datos del dashboard
 */
async function obtenerResumenDashboard(idUsuario) {
  try {
    // Obtener empresa del usuario
    const empresa = await dashboardRepository.obtenerEmpresaPorUsuario(idUsuario);
    if (!empresa) {
      throw new Error('No existe una empresa asociada al usuario autenticado');
    }

    const idEmpresa = empresa.id_empresa;

    // Obtener todos los datos en paralelo
    const [
      puntajeSeguridad,
      totalEmpleados,
      empleadosCapacitados,
      capacitacionesPendientes,
      ultimaAuditoria,
      puertosAbiertosDetectados,
      datosPhishing,
      progresoCapacitacion,
      recomendacionesActivas
    ] = await Promise.all([
      dashboardRepository.obtenerPuntajeSeguridad(idEmpresa),
      dashboardRepository.contarTotalEmpleados(idEmpresa),
      dashboardRepository.contarEmpleadosCapacitados(idEmpresa),
      dashboardRepository.contarCapacitacionesPendientes(idEmpresa),
      dashboardRepository.obtenerUltimaAuditoria(idEmpresa),
      dashboardRepository.contarPuertosAbiertosDetectados(idEmpresa),
      dashboardRepository.obtenerDatosPhishing(idEmpresa),
      dashboardRepository.obtenerProgresoCapacitacion(idEmpresa),
      dashboardRepository.listarRecomendaciones(idEmpresa, {
        estadoRecomendacion: 'pendiente'
      })
    ]);

    // Calcular nivel de riesgo
    const nivelRiesgo = calcularNivelRiesgo(puntajeSeguridad);

    return {
      puntajeSeguridad,
      nivelRiesgo,
      empleadosCapacitados,
      totalEmpleados,
      capacitacionesPendientes,
      ultimaAuditoria,
      puertosAbiertosDetectados,
      phishing: datosPhishing,
      progresoCapacitacion,
      recomendaciones: recomendacionesActivas
    };
  } catch (error) {
    throw new Error(`Error obteniendo resumen del dashboard: ${error.message}`);
  }
}

/**
 * Calcular nivel de riesgo según puntaje
 * @param {number} puntaje
 * @returns {string} Nivel de riesgo
 */
function calcularNivelRiesgo(puntaje) {
  if (puntaje >= 75) {
    return 'bajo';
  } else if (puntaje >= 50) {
    return 'medio';
  } else {
    return 'alto';
  }
}

/**
 * Listar recomendaciones con filtros
 * @param {number} idUsuario
 * @param {Object} filtros
 * @returns {Promise<Array>} Lista de recomendaciones
 */
async function listarRecomendaciones(idUsuario, filtros = {}) {
  try {
    // Obtener empresa del usuario
    const empresa = await dashboardRepository.obtenerEmpresaPorUsuario(idUsuario);
    if (!empresa) {
      throw new Error('No existe una empresa asociada al usuario autenticado');
    }

    // Validar filtros
    if (filtros.prioridad && !['urgente', 'atencion', 'baja'].includes(filtros.prioridad)) {
      throw new Error('Prioridad inválida');
    }

    if (filtros.estadoRecomendacion && 
        !['pendiente', 'completada', 'descartada'].includes(filtros.estadoRecomendacion)) {
      throw new Error('Estado de recomendación inválido');
    }

    return await dashboardRepository.listarRecomendaciones(empresa.id_empresa, filtros);
  } catch (error) {
    throw new Error(error.message);
  }
}

/**
 * Crear recomendación
 * @param {number} idUsuario
 * @param {Object} data
 * @returns {Promise<Object>} Recomendación creada
 */
async function crearRecomendacion(idUsuario, data) {
  try {
    // Validar datos
    if (!data.titulo || !data.titulo.trim()) {
      throw new Error('El título es obligatorio');
    }

    if (data.prioridad && !['urgente', 'atencion', 'baja'].includes(data.prioridad)) {
      throw new Error('Prioridad inválida');
    }

    // Obtener empresa del usuario
    const empresa = await dashboardRepository.obtenerEmpresaPorUsuario(idUsuario);
    if (!empresa) {
      throw new Error('No existe una empresa asociada al usuario autenticado');
    }

    // Crear recomendación
    const idRecomendacion = await dashboardRepository.crearRecomendacion(empresa.id_empresa, {
      titulo: data.titulo.trim(),
      descripcion: data.descripcion?.trim() || null,
      prioridad: data.prioridad || 'atencion',
      accionTexto: data.accionTexto?.trim() || null,
      accionUrl: data.accionUrl?.trim() || null
    });

    // Retornar recomendación creada
    return await dashboardRepository.obtenerRecomendacionPorId(idRecomendacion, empresa.id_empresa);
  } catch (error) {
    throw new Error(error.message);
  }
}

/**
 * Actualizar estado de recomendación
 * @param {number} idUsuario
 * @param {number} idRecomendacion
 * @param {Object} data
 * @returns {Promise<Object>} Recomendación actualizada
 */
async function actualizarEstadoRecomendacion(idUsuario, idRecomendacion, data) {
  try {
    // Validar estado
    if (!data.estadoRecomendacion || 
        !['pendiente', 'completada', 'descartada'].includes(data.estadoRecomendacion)) {
      throw new Error('Estado de recomendación inválido');
    }

    // Obtener empresa del usuario
    const empresa = await dashboardRepository.obtenerEmpresaPorUsuario(idUsuario);
    if (!empresa) {
      throw new Error('No existe una empresa asociada al usuario autenticado');
    }

    // Verificar que la recomendación existe
    const recomendacion = await dashboardRepository.obtenerRecomendacionPorId(
      idRecomendacion,
      empresa.id_empresa
    );
    if (!recomendacion) {
      throw new Error('La recomendación no existe');
    }

    // Actualizar estado
    await dashboardRepository.actualizarEstadoRecomendacion(
      idRecomendacion,
      empresa.id_empresa,
      data.estadoRecomendacion
    );

    // Retornar recomendación actualizada
    return await dashboardRepository.obtenerRecomendacionPorId(
      idRecomendacion,
      empresa.id_empresa
    );
  } catch (error) {
    throw new Error(error.message);
  }
}

/**
 * Eliminar recomendación
 * @param {number} idUsuario
 * @param {number} idRecomendacion
 * @returns {Promise<Object>} Resultado
 */
async function eliminarRecomendacion(idUsuario, idRecomendacion) {
  try {
    // Obtener empresa del usuario
    const empresa = await dashboardRepository.obtenerEmpresaPorUsuario(idUsuario);
    if (!empresa) {
      throw new Error('No existe una empresa asociada al usuario autenticado');
    }

    // Verificar que la recomendación existe
    const recomendacion = await dashboardRepository.obtenerRecomendacionPorId(
      idRecomendacion,
      empresa.id_empresa
    );
    if (!recomendacion) {
      throw new Error('La recomendación no existe');
    }

    // Eliminar recomendación
    const resultado = await dashboardRepository.eliminarRecomendacion(
      idRecomendacion,
      empresa.id_empresa
    );

    if (!resultado.success) {
      throw new Error('No se pudo eliminar la recomendación');
    }

    return {
      success: true,
      message: 'Recomendación eliminada correctamente'
    };
  } catch (error) {
    throw new Error(error.message);
  }
}

module.exports = {
  obtenerResumenDashboard,
  listarRecomendaciones,
  crearRecomendacion,
  actualizarEstadoRecomendacion,
  eliminarRecomendacion
};
