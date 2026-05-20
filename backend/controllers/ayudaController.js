const ayudaService = require('../services/ayudaService');

/**
 * Listar FAQ
 * GET /api/ayuda/faq
 */
async function listarFaq(req, res) {
  try {
    const data = await ayudaService.listarFaq();

    return res.status(200).json({
      success: true,
      data: data
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

/**
 * Listar FAQ populares
 * GET /api/ayuda/faq/populares
 */
async function listarFaqPopulares(req, res) {
  try {
    const data = await ayudaService.listarFaqPopulares();

    return res.status(200).json({
      success: true,
      data: data
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

/**
 * Buscar FAQ
 * GET /api/ayuda/buscar?q=...
 */
async function buscarFaq(req, res) {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'El parámetro de búsqueda (q) es obligatorio'
      });
    }

    const data = await ayudaService.buscarFaq(q);

    return res.status(200).json({
      success: true,
      data: data
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

/**
 * Crear ticket
 * POST /api/ayuda/tickets
 */
async function crearTicket(req, res) {
  try {
    const idUsuario = req.user.id_usuario;
    const { asunto, mensaje, prioridad } = req.body;

    const data = await ayudaService.crearTicket(idUsuario, {
      asunto,
      mensaje,
      prioridad
    });

    return res.status(201).json({
      success: true,
      data: data
    });
  } catch (error) {
    const statusCode = error.message.includes('obligatorio') ? 400 : 400;
    return res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
}

/**
 * Listar tickets
 * GET /api/ayuda/tickets
 */
async function listarTickets(req, res) {
  try {
    const idUsuario = req.user.id_usuario;

    const data = await ayudaService.listarTickets(idUsuario);

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
 * Obtener ticket
 * GET /api/ayuda/tickets/:id
 */
async function obtenerTicket(req, res) {
  try {
    const idUsuario = req.user.id_usuario;
    const idTicket = parseInt(req.params.id);

    if (isNaN(idTicket)) {
      return res.status(400).json({
        success: false,
        message: 'ID de ticket inválido'
      });
    }

    const data = await ayudaService.obtenerTicket(idUsuario, idTicket);

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
 * Crear chat de soporte
 * POST /api/ayuda/chat
 */
async function crearChat(req, res) {
  try {
    const idUsuario = req.user.id_usuario;
    const { asunto, mensaje } = req.body;

    const data = await ayudaService.crearChat(idUsuario, {
      asunto,
      mensaje
    });

    return res.status(201).json({
      success: true,
      data: data
    });
  } catch (error) {
    const statusCode = error.message.includes('obligatorio') ? 400 : 400;
    return res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
}

/**
 * Listar chats
 * GET /api/ayuda/chat
 */
async function listarChats(req, res) {
  try {
    const idUsuario = req.user.id_usuario;

    const data = await ayudaService.listarChats(idUsuario);

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
 * Obtener chat
 * GET /api/ayuda/chat/:id
 */
async function obtenerChat(req, res) {
  try {
    const idUsuario = req.user.id_usuario;
    const idConversacion = parseInt(req.params.id);

    if (isNaN(idConversacion)) {
      return res.status(400).json({
        success: false,
        message: 'ID de conversación inválido'
      });
    }

    const data = await ayudaService.obtenerChat(idUsuario, idConversacion);

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
 * Enviar mensaje en chat
 * POST /api/ayuda/chat/:id/mensajes
 */
async function enviarMensajeChat(req, res) {
  try {
    const idUsuario = req.user.id_usuario;
    const idConversacion = parseInt(req.params.id);
    const { mensaje } = req.body;

    if (isNaN(idConversacion)) {
      return res.status(400).json({
        success: false,
        message: 'ID de conversación inválido'
      });
    }

    const data = await ayudaService.enviarMensajeChat(idUsuario, idConversacion, {
      mensaje
    });

    return res.status(200).json({
      success: true,
      data: data
    });
  } catch (error) {
    const statusCode = error.message.includes('no existe') || error.message.includes('cerrada') ? 400 : 400;
    return res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
}

/**
 * Cerrar chat
 * PATCH /api/ayuda/chat/:id/cerrar
 */
async function cerrarChat(req, res) {
  try {
    const idUsuario = req.user.id_usuario;
    const idConversacion = parseInt(req.params.id);

    if (isNaN(idConversacion)) {
      return res.status(400).json({
        success: false,
        message: 'ID de conversación inválido'
      });
    }

    const data = await ayudaService.cerrarChat(idUsuario, idConversacion);

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
 * Obtener estado del sistema
 * GET /api/ayuda/estado-sistema
 */
async function obtenerEstadoSistema(req, res) {
  try {
    const data = await ayudaService.obtenerEstadoSistema();

    return res.status(200).json({
      success: true,
      data: data
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

module.exports = {
  listarFaq,
  listarFaqPopulares,
  buscarFaq,
  crearTicket,
  listarTickets,
  obtenerTicket,
  crearChat,
  listarChats,
  obtenerChat,
  enviarMensajeChat,
  cerrarChat,
  obtenerEstadoSistema
};
