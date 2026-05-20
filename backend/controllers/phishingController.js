const phishingService = require('../services/phishingService');

/**
 * GET /api/phishing/campanas
 * Obtener todas las campañas
 */
async function obtenerCampanas(req, res) {
  try {
    const campanas = await phishingService.obtenerCampanas();
    res.status(200).json({
      success: true,
      data: campanas
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

/**
 * GET /api/phishing/campanas/:id
 * Obtener campaña por ID
 */
async function obtenerCampana(req, res) {
  try {
    const { id } = req.params;
    const campana = await phishingService.obtenerCampanaPorId(id);

    res.status(200).json({
      success: true,
      data: campana
    });
  } catch (error) {
    const statusCode = error.message.includes('no existe') ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
}

/**
 * POST /api/phishing/campanas
 * Crear campaña
 */
async function crearCampana(req, res) {
  try {
    const idUsuario = req.user.id_usuario;
    const { nombre, descripcion, asuntoEmail, idPlantilla, empleados } = req.body;

    const resultado = await phishingService.crearCampana(idUsuario, {
      nombre,
      descripcion,
      asuntoEmail,
      idPlantilla,
      empleados
    });

    res.status(201).json({
      success: true,
      message: 'Campaña phishing creada correctamente',
      data: resultado
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

/**
 * PUT /api/phishing/campanas/:id
 * Actualizar campaña
 */
async function actualizarCampana(req, res) {
  try {
    const { id } = req.params;
    const { nombre, descripcion, asuntoEmail, estadoCampana, fechaInicio, fechaFin } = req.body;

    const campana = await phishingService.actualizarCampana(id, {
      nombre,
      descripcion,
      asuntoEmail,
      estadoCampana,
      fechaInicio,
      fechaFin
    });

    res.status(200).json({
      success: true,
      message: 'Campaña actualizada',
      data: campana
    });
  } catch (error) {
    const statusCode = error.message.includes('no existe') ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
}

/**
 * DELETE /api/phishing/campanas/:id
 * Eliminar campaña
 */
async function eliminarCampana(req, res) {
  try {
    const { id } = req.params;
    await phishingService.eliminarCampana(id);

    res.status(200).json({
      success: true,
      message: 'Campaña eliminada'
    });
  } catch (error) {
    const statusCode = error.message.includes('no existe') ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
}

/**
 * POST /api/phishing/campanas/:id/empleados
 * Asignar empleados a campaña
 */
async function asignarEmpleados(req, res) {
  try {
    const { id } = req.params;
    const { empleados } = req.body;

    const resultado = await phishingService.asignarEmpleadosACampana(id, empleados);

    res.status(200).json({
      success: true,
      message: `${resultado.asignados} empleado(s) asignado(s)`,
      data: resultado
    });
  } catch (error) {
    const statusCode = error.message.includes('no existe') ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
}

/**
 * POST /api/phishing/campanas/:id/simular
 * Simular eventos phishing
 */
async function simularEventos(req, res) {
  try {
    const { id } = req.params;

    const resultado = await phishingService.simularEventosCampana(id);

    res.status(200).json({
      success: true,
      message: 'Eventos simulados',
      data: resultado
    });
  } catch (error) {
    const statusCode = error.message.includes('no existe') ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
}

/**
 * GET /api/phishing/dashboard/:idCampana
 * Obtener dashboard de campaña
 */
async function obtenerDashboard(req, res) {
  try {
    const { idCampana } = req.params;

    const dashboard = await phishingService.obtenerDashboard(idCampana);

    res.status(200).json({
      success: true,
      data: dashboard
    });
  } catch (error) {
    const statusCode = error.message.includes('no existe') ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
}

/**
 * GET /api/phishing/historial
 * Obtener historial de campañas
 */
async function obtenerHistorial(req, res) {
  try {
    const historial = await phishingService.obtenerHistorial();

    res.status(200).json({
      success: true,
      data: historial
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

/**
 * GET /api/phishing/empleado/:id
 * Obtener detalle empleado
 */
async function obtenerDetalleEmpleado(req, res) {
  try {
    const { id } = req.params;

    const detalle = await phishingService.obtenerDetalleEmpleado(id);

    res.status(200).json({
      success: true,
      data: detalle
    });
  } catch (error) {
    const statusCode = error.message.includes('no existe') ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
}

/**
 * GET /api/phishing/plantillas
 * Listar plantillas
 */
async function listarPlantillas(req, res) {
  try {
    const plantillas = await phishingService.listarPlantillas();

    res.status(200).json({
      success: true,
      data: plantillas
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

/**
 * GET /api/phishing/plantillas/:id
 * Obtener plantilla por ID
 */
async function obtenerPlantilla(req, res) {
  try {
    const { id } = req.params;

    const plantilla = await phishingService.obtenerPlantilla(id);

    res.status(200).json({
      success: true,
      data: plantilla
    });
  } catch (error) {
    const statusCode = error.message.includes('no existe') ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
}

module.exports = {
  obtenerCampanas,
  obtenerCampana,
  crearCampana,
  actualizarCampana,
  eliminarCampana,
  asignarEmpleados,
  simularEventos,
  obtenerDashboard,
  obtenerHistorial,
  obtenerDetalleEmpleado,
  listarPlantillas,
  obtenerPlantilla
};
