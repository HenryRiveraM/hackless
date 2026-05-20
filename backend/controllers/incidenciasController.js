/**
 * Controller para Incidencias de Seguridad
 * Maneja las peticiones HTTP
 */

const incidenciasService = require('../services/incidenciasService');

// Listar incidencias
async function listarIncidencias(req, res) {
  try {
    const idUsuario = req.user.id_usuario;
    const filtros = {
      severidad: req.query.severidad,
      estadoIncidencia: req.query.estadoIncidencia,
      busqueda: req.query.busqueda,
      page: req.query.page || 1,
      pageSize: req.query.pageSize || 10
    };

    const resultado = await incidenciasService.listarIncidencias(idUsuario, filtros);

    res.status(200).json({
      success: true,
      message: 'Incidencias obtenidas correctamente',
      data: resultado
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

// Obtener resumen de incidencias
async function obtenerResumen(req, res) {
  try {
    const idUsuario = req.user.id_usuario;

    const resumen = await incidenciasService.obtenerResumen(idUsuario);

    res.status(200).json({
      success: true,
      message: 'Resumen de incidencias obtenido correctamente',
      data: resumen
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

// Obtener incidencia por ID
async function obtenerIncidencia(req, res) {
  try {
    const idUsuario = req.user.id_usuario;
    const { id } = req.params;

    const incidencia = await incidenciasService.obtenerIncidencia(idUsuario, parseInt(id));

    res.status(200).json({
      success: true,
      message: 'Incidencia obtenida correctamente',
      data: incidencia
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

// Crear incidencia
async function crearIncidencia(req, res) {
  try {
    const idUsuario = req.user.id_usuario;

    const resultado = await incidenciasService.crearIncidencia(idUsuario, req.body);

    res.status(201).json({
      success: true,
      message: 'Incidencia registrada correctamente',
      data: resultado
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

// Actualizar incidencia
async function actualizarIncidencia(req, res) {
  try {
    const idUsuario = req.user.id_usuario;
    const { id } = req.params;

    const resultado = await incidenciasService.actualizarIncidencia(
      idUsuario,
      parseInt(id),
      req.body
    );

    res.status(200).json({
      success: true,
      message: 'Incidencia actualizada correctamente',
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

// Actualizar estado de incidencia
async function actualizarEstado(req, res) {
  try {
    const idUsuario = req.user.id_usuario;
    const { id } = req.params;

    const resultado = await incidenciasService.actualizarEstado(
      idUsuario,
      parseInt(id),
      req.body
    );

    res.status(200).json({
      success: true,
      message: 'Estado de incidencia actualizado correctamente',
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

// Eliminar incidencia
async function eliminarIncidencia(req, res) {
  try {
    const idUsuario = req.user.id_usuario;
    const { id } = req.params;

    await incidenciasService.eliminarIncidencia(idUsuario, parseInt(id));

    res.status(200).json({
      success: true,
      message: 'Incidencia eliminada correctamente'
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

// Agregar evento a timeline
async function agregarTimeline(req, res) {
  try {
    const idUsuario = req.user.id_usuario;
    const { id } = req.params;

    const resultado = await incidenciasService.agregarTimeline(
      idUsuario,
      parseInt(id),
      req.body
    );

    res.status(201).json({
      success: true,
      message: 'Evento agregado al timeline correctamente',
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

// Obtener timeline de incidencia
async function obtenerTimeline(req, res) {
  try {
    const idUsuario = req.user.id_usuario;
    const { id } = req.params;

    // Validar que la incidencia existe y pertenece al usuario
    const incidencia = await incidenciasService.obtenerIncidencia(idUsuario, parseInt(id));
    if (!incidencia) {
      return res.status(404).json({
        success: false,
        message: 'La incidencia no existe'
      });
    }

    // Obtener solo el timeline
    const timeline = incidencia.timeline || [];

    res.status(200).json({
      success: true,
      message: 'Timeline obtenido correctamente',
      data: timeline
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

// Agregar acción
async function agregarAccion(req, res) {
  try {
    const idUsuario = req.user.id_usuario;
    const { id } = req.params;

    const resultado = await incidenciasService.agregarAccion(
      idUsuario,
      parseInt(id),
      req.body
    );

    res.status(201).json({
      success: true,
      message: 'Acción agregada correctamente',
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

// Obtener acciones de incidencia
async function obtenerAcciones(req, res) {
  try {
    const idUsuario = req.user.id_usuario;
    const { id } = req.params;

    // Validar que la incidencia existe y pertenece al usuario
    const incidencia = await incidenciasService.obtenerIncidencia(idUsuario, parseInt(id));
    if (!incidencia) {
      return res.status(404).json({
        success: false,
        message: 'La incidencia no existe'
      });
    }

    // Obtener solo las acciones
    const acciones = incidencia.acciones || [];

    res.status(200).json({
      success: true,
      message: 'Acciones obtenidas correctamente',
      data: acciones
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

// Agregar activo
async function agregarActivo(req, res) {
  try {
    const idUsuario = req.user.id_usuario;
    const { id } = req.params;

    const resultado = await incidenciasService.agregarActivo(
      idUsuario,
      parseInt(id),
      req.body
    );

    res.status(201).json({
      success: true,
      message: 'Activo agregado correctamente',
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

// Obtener activos de incidencia
async function obtenerActivos(req, res) {
  try {
    const idUsuario = req.user.id_usuario;
    const { id } = req.params;

    // Validar que la incidencia existe y pertenece al usuario
    const incidencia = await incidenciasService.obtenerIncidencia(idUsuario, parseInt(id));
    if (!incidencia) {
      return res.status(404).json({
        success: false,
        message: 'La incidencia no existe'
      });
    }

    // Obtener solo los activos
    const activos = incidencia.activos || [];

    res.status(200).json({
      success: true,
      message: 'Activos obtenidos correctamente',
      data: activos
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

// Obtener geolocalización
async function obtenerGeolocalizacion(req, res) {
  try {
    const idUsuario = req.user.id_usuario;
    const { id } = req.params;

    // Validar que la incidencia existe y pertenece al usuario
    const incidencia = await incidenciasService.obtenerIncidencia(idUsuario, parseInt(id));
    if (!incidencia) {
      return res.status(404).json({
        success: false,
        message: 'La incidencia no existe'
      });
    }

    // Obtener solo la geolocalización
    const geolocalizacion = incidencia.geolocalizacion || null;

    if (!geolocalizacion) {
      return res.status(200).json({
        success: true,
        message: 'No hay geolocalización registrada para esta incidencia',
        data: null
      });
    }

    res.status(200).json({
      success: true,
      message: 'Geolocalización obtenida correctamente',
      data: geolocalizacion
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
  listarIncidencias,
  obtenerResumen,
  obtenerIncidencia,
  crearIncidencia,
  actualizarIncidencia,
  actualizarEstado,
  eliminarIncidencia,
  agregarTimeline,
  obtenerTimeline,
  agregarAccion,
  obtenerAcciones,
  agregarActivo,
  obtenerActivos,
  obtenerGeolocalizacion
};
