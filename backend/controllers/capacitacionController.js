const capacitacionService = require('../services/capacitacionService');

/**
 * Obtener dashboard
 * GET /api/capacitacion/dashboard
 */
async function obtenerDashboard(req, res) {
  try {
    const idUsuario = req.user.id_usuario;

    const data = await capacitacionService.obtenerDashboard(idUsuario);

    return res.status(200).json({
      success: true,
      data: data
    });
  } catch (error) {
    const statusCode = error.message.includes('no encontrado') ? 404 : 400;
    return res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
}

/**
 * Listar lecciones
 * GET /api/capacitacion/lecciones
 */
async function listarLecciones(req, res) {
  try {
    const idUsuario = req.user.id_usuario;

    const data = await capacitacionService.listarLecciones(idUsuario);

    return res.status(200).json({
      success: true,
      data: data
    });
  } catch (error) {
    const statusCode = error.message.includes('no encontrado') ? 404 : 400;
    return res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
}

/**
 * Listar lecciones completadas
 * GET /api/capacitacion/lecciones/completadas
 */
async function listarCompletadas(req, res) {
  try {
    const idUsuario = req.user.id_usuario;

    const data = await capacitacionService.listarCompletadas(idUsuario);

    return res.status(200).json({
      success: true,
      data: data
    });
  } catch (error) {
    const statusCode = error.message.includes('no encontrado') ? 404 : 400;
    return res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
}

/**
 * Iniciar lección
 * POST /api/capacitacion/lecciones/:id/iniciar
 */
async function iniciarLeccion(req, res) {
  try {
    const idUsuario = req.user.id_usuario;
    const idLeccion = parseInt(req.params.id);

    if (isNaN(idLeccion)) {
      return res.status(400).json({
        success: false,
        message: 'ID de lección inválido'
      });
    }

    const data = await capacitacionService.iniciarLeccion(idUsuario, idLeccion);

    return res.status(200).json({
      success: true,
      data: data
    });
  } catch (error) {
    const statusCode = error.message.includes('no existe') ? 404 : 400;
    return res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
}

/**
 * Actualizar progreso
 * PATCH /api/capacitacion/lecciones/:id/progreso
 */
async function actualizarProgreso(req, res) {
  try {
    const idUsuario = req.user.id_usuario;
    const idLeccion = parseInt(req.params.id);
    const { progreso, puntaje } = req.body;

    if (isNaN(idLeccion)) {
      return res.status(400).json({
        success: false,
        message: 'ID de lección inválido'
      });
    }

    const data = await capacitacionService.actualizarProgreso(idUsuario, idLeccion, {
      progreso,
      puntaje
    });

    return res.status(200).json({
      success: true,
      data: data
    });
  } catch (error) {
    const statusCode = error.message.includes('no existe') ? 404 : 400;
    return res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
}

/**
 * Obtener contenido de lección
 * GET /api/capacitacion/lecciones/:id/contenido
 */
async function obtenerContenidoLeccion(req, res) {
  try {
    const idUsuario = req.user.id_usuario;
    const idLeccion = parseInt(req.params.id);

    if (isNaN(idLeccion)) {
      return res.status(400).json({
        success: false,
        message: 'ID de lección inválido'
      });
    }

    const data = await capacitacionService.obtenerContenidoLeccion(idUsuario, idLeccion);

    return res.status(200).json({
      success: true,
      message: 'Contenido de lección obtenido correctamente',
      data: data
    });
  } catch (error) {
    const statusCode = error.message.includes('no existe') ? 404 : 400;
    return res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
}

/**
 * Obtener quiz de lección
 * GET /api/capacitacion/lecciones/:id/quiz
 */
async function obtenerQuizLeccion(req, res) {
  try {
    const idUsuario = req.user.id_usuario;
    const idLeccion = parseInt(req.params.id);

    if (isNaN(idLeccion)) {
      return res.status(400).json({
        success: false,
        message: 'ID de lección inválido'
      });
    }

    const data = await capacitacionService.obtenerQuizLeccion(idUsuario, idLeccion);

    return res.status(200).json({
      success: true,
      data: data
    });
  } catch (error) {
    const statusCode = error.message.includes('no existe') ? 404 : 400;
    return res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
}

/**
 * Responder quiz
 * POST /api/capacitacion/quizzes/:id/responder
 */
async function responderQuiz(req, res) {
  try {
    const idUsuario = req.user.id_usuario;
    const idQuiz = parseInt(req.params.id);
    const { respuestas } = req.body;

    if (isNaN(idQuiz)) {
      return res.status(400).json({
        success: false,
        message: 'ID de quiz inválido'
      });
    }

    const data = await capacitacionService.responderQuiz(idUsuario, idQuiz, respuestas);

    return res.status(200).json({
      success: true,
      data: data
    });
  } catch (error) {
    const statusCode = error.message.includes('no existe') ? 404 : 400;
    return res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
}

/**
 * Obtener resultado de quiz
 * GET /api/capacitacion/quizzes/:id/resultado
 */
async function obtenerResultadoQuiz(req, res) {
  try {
    const idUsuario = req.user.id_usuario;
    const idQuiz = parseInt(req.params.id);

    if (isNaN(idQuiz)) {
      return res.status(400).json({
        success: false,
        message: 'ID de quiz inválido'
      });
    }

    const data = await capacitacionService.obtenerResultadoQuiz(idUsuario, idQuiz);

    return res.status(200).json({
      success: true,
      data: data
    });
  } catch (error) {
    const statusCode = error.message.includes('no existe') ? 404 : 400;
    return res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
}

module.exports = {
  obtenerDashboard,
  listarLecciones,
  listarCompletadas,
  iniciarLeccion,
  actualizarProgreso,
  obtenerContenidoLeccion,
  obtenerQuizLeccion,
  responderQuiz,
  obtenerResultadoQuiz
};
