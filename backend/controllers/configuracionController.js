const configuracionService = require('../services/configuracionService');

// ==================== PERFIL ====================

async function obtenerPerfil(req, res) {
  try {
    const idUsuario = req.user.id_usuario;
    
    const perfil = await configuracionService.obtenerPerfil(idUsuario);
    
    res.status(200).json({
      success: true,
      message: 'Perfil obtenido correctamente',
      data: perfil
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

async function actualizarPerfil(req, res) {
  try {
    const idUsuario = req.user.id_usuario;
    
    const perfil = await configuracionService.actualizarPerfil(idUsuario, req.body);
    
    res.status(200).json({
      success: true,
      message: 'Perfil actualizado correctamente',
      data: perfil
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

// ==================== SEGURIDAD ====================

async function obtenerSeguridad(req, res) {
  try {
    const idUsuario = req.user.id_usuario;
    
    const seguridad = await configuracionService.obtenerSeguridad(idUsuario);
    
    res.status(200).json({
      success: true,
      message: 'Configuración de seguridad obtenida correctamente',
      data: seguridad
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

async function actualizarSeguridad(req, res) {
  try {
    const idUsuario = req.user.id_usuario;
    
    const seguridad = await configuracionService.actualizarSeguridad(idUsuario, req.body);
    
    res.status(200).json({
      success: true,
      message: 'Configuración de seguridad actualizada correctamente',
      data: seguridad
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

// ==================== SESIONES ====================

async function listarSesiones(req, res) {
  try {
    const idUsuario = req.user.id_usuario;
    
    const sesiones = await configuracionService.listarSesiones(idUsuario);
    
    res.status(200).json({
      success: true,
      message: 'Sesiones obtenidas correctamente',
      data: sesiones
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

async function cerrarSesion(req, res) {
  try {
    const idUsuario = req.user.id_usuario;
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'El ID de la sesión es obligatorio'
      });
    }
    
    await configuracionService.cerrarSesion(idUsuario, parseInt(id));
    
    res.status(200).json({
      success: true,
      message: 'Sesión cerrada correctamente'
    });
  } catch (error) {
    if (error.message.includes('no pertenece')) {
      return res.status(403).json({
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

async function cerrarOtrasSesiones(req, res) {
  try {
    const idUsuario = req.user.id_usuario;
    const { idSesionActual } = req.body;
    
    await configuracionService.cerrarOtrasSesiones(idUsuario, idSesionActual || null);
    
    res.status(200).json({
      success: true,
      message: 'Otras sesiones cerradas correctamente'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

// ==================== SUSCRIPCIÓN ====================

async function obtenerSuscripcion(req, res) {
  try {
    const idUsuario = req.user.id_usuario;
    
    const suscripcion = await configuracionService.obtenerSuscripcion(idUsuario);
    
    res.status(200).json({
      success: true,
      message: 'Suscripción obtenida correctamente',
      data: suscripcion
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

async function actualizarSuscripcion(req, res) {
  try {
    const idUsuario = req.user.id_usuario;
    
    const suscripcion = await configuracionService.actualizarSuscripcion(idUsuario, req.body);
    
    res.status(200).json({
      success: true,
      message: 'Suscripción actualizada correctamente',
      data: suscripcion
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

module.exports = {
  obtenerPerfil,
  actualizarPerfil,
  obtenerSeguridad,
  actualizarSeguridad,
  listarSesiones,
  cerrarSesion,
  cerrarOtrasSesiones,
  obtenerSuscripcion,
  actualizarSuscripcion
};
