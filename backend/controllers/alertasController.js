/**
 * Controller para Alertas de Seguridad
 * Maneja las peticiones HTTP
 */

const alertasService = require('../services/alertasService');

// Listar alertas
async function listarAlertas(req, res) {
  try {
    const idUsuario = req.user.id_usuario;
    const filtros = {
      categoria: req.query.categoria,
      severidad: req.query.severidad,
      estadoAlerta: req.query.estadoAlerta,
      busqueda: req.query.busqueda,
      page: req.query.page || 1,
      pageSize: req.query.pageSize || 10
    };

    const resultado = await alertasService.listarAlertas(idUsuario, filtros);

    res.status(200).json({
      success: true,
      message: 'Alertas obtenidas correctamente',
      data: resultado
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

// Obtener resumen de alertas
async function obtenerResumen(req, res) {
  try {
    const idUsuario = req.user.id_usuario;

    const resumen = await alertasService.obtenerResumen(idUsuario);

    res.status(200).json({
      success: true,
      message: 'Resumen de alertas obtenido correctamente',
      data: resumen
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

// Obtener alerta por ID
async function obtenerAlertaPorId(req, res) {
  try {
    const idUsuario = req.user.id_usuario;
    const { id } = req.params;

    const alerta = await alertasService.obtenerAlertaPorId(idUsuario, parseInt(id));

    res.status(200).json({
      success: true,
      message: 'Alerta obtenida correctamente',
      data: alerta
    });
  } catch (error) {
    if (error.message.includes('no existe')) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

// Crear alerta
async function crearAlerta(req, res) {
  try {
    const idUsuario = req.user.id_usuario;

    const resultado = await alertasService.crearAlerta(idUsuario, req.body);

    res.status(201).json({
      success: true,
      message: 'Alerta registrada correctamente',
      data: resultado
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

// Actualizar alerta
async function actualizarAlerta(req, res) {
  try {
    const idUsuario = req.user.id_usuario;
    const { id } = req.params;

    const resultado = await alertasService.actualizarAlerta(idUsuario, parseInt(id), req.body);

    res.status(200).json({
      success: true,
      message: 'Alerta actualizada correctamente',
      data: resultado
    });
  } catch (error) {
    if (error.message.includes('no existe')) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

// Actualizar estado de alerta
async function actualizarEstadoAlerta(req, res) {
  try {
    const idUsuario = req.user.id_usuario;
    const { id } = req.params;

    const resultado = await alertasService.actualizarEstadoAlerta(
      idUsuario,
      parseInt(id),
      req.body
    );

    res.status(200).json({
      success: true,
      message: 'Estado de alerta actualizado correctamente',
      data: resultado
    });
  } catch (error) {
    if (error.message.includes('no existe')) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

// Eliminar alerta
async function eliminarAlerta(req, res) {
  try {
    const idUsuario = req.user.id_usuario;
    const { id } = req.params;

    await alertasService.eliminarAlerta(idUsuario, parseInt(id));

    res.status(200).json({
      success: true,
      message: 'Alerta eliminada correctamente'
    });
  } catch (error) {
    if (error.message.includes('no existe')) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

module.exports = {
  listarAlertas,
  obtenerResumen,
  obtenerAlertaPorId,
  crearAlerta,
  actualizarAlerta,
  actualizarEstadoAlerta,
  eliminarAlerta
};
