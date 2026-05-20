const dashboardService = require('../services/dashboardService');

/**
 * Dashboard Controller
 * Manejadores de las rutas del dashboard
 */

/**
 * Obtener resumen del dashboard
 * GET /api/dashboard/resumen
 */
async function obtenerResumen(req, res) {
  try {
    const idUsuario = req.user.id_usuario;
    const resumen = await dashboardService.obtenerResumenDashboard(idUsuario);

    return res.status(200).json({
      success: true,
      message: 'Dashboard obtenido correctamente',
      data: resumen
    });
  } catch (error) {
    return res.status(error.message.includes('no existe') ? 400 : 500).json({
      success: false,
      message: error.message
    });
  }
}

/**
 * Listar recomendaciones
 * GET /api/dashboard/recomendaciones
 * Filtros opcionales: ?prioridad=urgente&estadoRecomendacion=pendiente
 */
async function listarRecomendaciones(req, res) {
  try {
    const idUsuario = req.user.id_usuario;
    const filtros = {
      prioridad: req.query.prioridad,
      estadoRecomendacion: req.query.estadoRecomendacion
    };

    // Remover filtros undefined
    Object.keys(filtros).forEach(key => {
      if (filtros[key] === undefined) delete filtros[key];
    });

    const recomendaciones = await dashboardService.listarRecomendaciones(idUsuario, filtros);

    return res.status(200).json({
      success: true,
      message: 'Recomendaciones obtenidas correctamente',
      data: recomendaciones
    });
  } catch (error) {
    const statusCode = error.message.includes('no existe') ? 400 : 
                       error.message.includes('inválida') ? 400 : 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
}

/**
 * Crear recomendación
 * POST /api/dashboard/recomendaciones
 */
async function crearRecomendacion(req, res) {
  try {
    const idUsuario = req.user.id_usuario;
    const data = {
      titulo: req.body.titulo,
      descripcion: req.body.descripcion,
      prioridad: req.body.prioridad,
      accionTexto: req.body.accionTexto,
      accionUrl: req.body.accionUrl
    };

    const recomendacion = await dashboardService.crearRecomendacion(idUsuario, data);

    return res.status(201).json({
      success: true,
      message: 'Recomendación creada correctamente',
      data: recomendacion
    });
  } catch (error) {
    const statusCode = error.message.includes('obligatorio') ? 400 : 
                       error.message.includes('inválida') ? 400 :
                       error.message.includes('no existe') ? 400 : 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
}

/**
 * Actualizar estado de recomendación
 * PATCH /api/dashboard/recomendaciones/:id/estado
 */
async function actualizarEstadoRecomendacion(req, res) {
  try {
    const idUsuario = req.user.id_usuario;
    const idRecomendacion = parseInt(req.params.id);
    const data = {
      estadoRecomendacion: req.body.estadoRecomendacion
    };

    if (isNaN(idRecomendacion)) {
      return res.status(400).json({
        success: false,
        message: 'ID de recomendación inválido'
      });
    }

    const recomendacion = await dashboardService.actualizarEstadoRecomendacion(
      idUsuario,
      idRecomendacion,
      data
    );

    return res.status(200).json({
      success: true,
      message: 'Recomendación actualizada correctamente',
      data: recomendacion
    });
  } catch (error) {
    const statusCode = error.message.includes('inválido') ? 400 : 
                       error.message.includes('no existe') ? 404 : 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
}

/**
 * Eliminar recomendación
 * DELETE /api/dashboard/recomendaciones/:id
 */
async function eliminarRecomendacion(req, res) {
  try {
    const idUsuario = req.user.id_usuario;
    const idRecomendacion = parseInt(req.params.id);

    if (isNaN(idRecomendacion)) {
      return res.status(400).json({
        success: false,
        message: 'ID de recomendación inválido'
      });
    }

    const resultado = await dashboardService.eliminarRecomendacion(idUsuario, idRecomendacion);

    return res.status(200).json({
      success: true,
      message: resultado.message,
      data: null
    });
  } catch (error) {
    const statusCode = error.message.includes('inválido') ? 400 : 
                       error.message.includes('no existe') ? 404 : 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
}

module.exports = {
  obtenerResumen,
  listarRecomendaciones,
  crearRecomendacion,
  actualizarEstadoRecomendacion,
  eliminarRecomendacion
};
