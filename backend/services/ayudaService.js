const ayudaRepository = require('../repositories/ayudaRepository');
const soporteAiService = require('./soporteAiService');

/**
 * Listar FAQ
 * @returns {Promise<Array>}
 */
async function listarFaq() {
  try {
    return await ayudaRepository.listarFaq();
  } catch (error) {
    throw new Error(error.message);
  }
}

/**
 * Listar FAQ populares
 * @returns {Promise<Array>}
 */
async function listarFaqPopulares() {
  try {
    return await ayudaRepository.listarFaqPopulares();
  } catch (error) {
    throw new Error(error.message);
  }
}

/**
 * Buscar FAQ
 * @param {string} q - término de búsqueda
 * @returns {Promise<Array>}
 */
async function buscarFaq(q) {
  try {
    if (!q || q.trim().length === 0) {
      throw new Error('El término de búsqueda es obligatorio');
    }

    return await ayudaRepository.buscarFaq(q.trim());
  } catch (error) {
    throw new Error(error.message);
  }
}

/**
 * Crear ticket
 * @param {number} idUsuario
 * @param {Object} data
 * @returns {Promise<Object>}
 */
async function crearTicket(idUsuario, data) {
  try {
    // Obtener empresa
    const empresa = await ayudaRepository.obtenerEmpresaPorUsuario(idUsuario);
    if (!empresa) {
      throw new Error('No existe una empresa asociada al usuario autenticado');
    }

    // Validar asunto
    if (!data.asunto || !data.asunto.trim()) {
      throw new Error('El asunto es obligatorio');
    }

    // Validar mensaje
    if (!data.mensaje || !data.mensaje.trim()) {
      throw new Error('El mensaje es obligatorio');
    }

    // Validar prioridad
    const prioridadesValidas = ['baja', 'media', 'alta'];
    if (!data.prioridad || !prioridadesValidas.includes(data.prioridad)) {
      throw new Error('La prioridad debe ser: baja, media o alta');
    }

    // Crear ticket
    const idTicket = await ayudaRepository.crearTicket(empresa.idEmpresa, {
      asunto: data.asunto.trim(),
      mensaje: data.mensaje.trim(),
      prioridad: data.prioridad
    });

    // Obtener ticket creado
    return await ayudaRepository.obtenerTicketPorId(empresa.idEmpresa, idTicket);
  } catch (error) {
    throw new Error(error.message);
  }
}

/**
 * Listar tickets
 * @param {number} idUsuario
 * @returns {Promise<Array>}
 */
async function listarTickets(idUsuario) {
  try {
    // Obtener empresa
    const empresa = await ayudaRepository.obtenerEmpresaPorUsuario(idUsuario);
    if (!empresa) {
      throw new Error('No existe una empresa asociada al usuario autenticado');
    }

    return await ayudaRepository.listarTickets(empresa.idEmpresa);
  } catch (error) {
    throw new Error(error.message);
  }
}

/**
 * Obtener ticket
 * @param {number} idUsuario
 * @param {number} idTicket
 * @returns {Promise<Object>}
 */
async function obtenerTicket(idUsuario, idTicket) {
  try {
    // Obtener empresa
    const empresa = await ayudaRepository.obtenerEmpresaPorUsuario(idUsuario);
    if (!empresa) {
      throw new Error('No existe una empresa asociada al usuario autenticado');
    }

    const ticket = await ayudaRepository.obtenerTicketPorId(empresa.idEmpresa, idTicket);
    if (!ticket) {
      throw new Error('El ticket no existe');
    }

    return ticket;
  } catch (error) {
    throw new Error(error.message);
  }
}

/**
 * Crear chat de soporte
 * @param {number} idUsuario
 * @param {Object} data
 * @returns {Promise<Object>}
 */
async function crearChat(idUsuario, data) {
  try {
    // Obtener empresa
    const empresa = await ayudaRepository.obtenerEmpresaPorUsuario(idUsuario);
    if (!empresa) {
      throw new Error('No existe una empresa asociada al usuario autenticado');
    }

    // Validar asunto
    if (!data.asunto || !data.asunto.trim()) {
      throw new Error('El asunto es obligatorio');
    }

    // Validar mensaje
    if (!data.mensaje || !data.mensaje.trim()) {
      throw new Error('El mensaje es obligatorio');
    }

    // Crear conversación
    const idConversacion = await ayudaRepository.crearConversacion(
      empresa.idEmpresa,
      data.asunto.trim()
    );

    // Guardar mensaje del usuario
    await ayudaRepository.crearMensaje(idConversacion, 'usuario', data.mensaje.trim());

    // Generar respuesta del bot
    const respuestaBot = await soporteAiService.generarRespuesta(data.asunto.trim(), data.mensaje.trim());

    // Guardar mensaje del bot
    await ayudaRepository.crearMensaje(idConversacion, 'bot', respuestaBot);

    // Obtener conversación con mensajes
    const conversacion = await ayudaRepository.obtenerConversacionPorId(empresa.idEmpresa, idConversacion);
    const mensajes = await ayudaRepository.listarMensajes(idConversacion);

    return {
      ...conversacion,
      mensajes
    };
  } catch (error) {
    throw new Error(error.message);
  }
}

/**
 * Listar chats
 * @param {number} idUsuario
 * @returns {Promise<Array>}
 */
async function listarChats(idUsuario) {
  try {
    // Obtener empresa
    const empresa = await ayudaRepository.obtenerEmpresaPorUsuario(idUsuario);
    if (!empresa) {
      throw new Error('No existe una empresa asociada al usuario autenticado');
    }

    return await ayudaRepository.listarConversaciones(empresa.idEmpresa);
  } catch (error) {
    throw new Error(error.message);
  }
}

/**
 * Obtener chat
 * @param {number} idUsuario
 * @param {number} idConversacion
 * @returns {Promise<Object>}
 */
async function obtenerChat(idUsuario, idConversacion) {
  try {
    // Obtener empresa
    const empresa = await ayudaRepository.obtenerEmpresaPorUsuario(idUsuario);
    if (!empresa) {
      throw new Error('No existe una empresa asociada al usuario autenticado');
    }

    const conversacion = await ayudaRepository.obtenerConversacionPorId(empresa.idEmpresa, idConversacion);
    if (!conversacion) {
      throw new Error('La conversación no existe');
    }

    const mensajes = await ayudaRepository.listarMensajes(idConversacion);

    return {
      ...conversacion,
      mensajes
    };
  } catch (error) {
    throw new Error(error.message);
  }
}

/**
 * Enviar mensaje en chat
 * @param {number} idUsuario
 * @param {number} idConversacion
 * @param {Object} data
 * @returns {Promise<Array>}
 */
async function enviarMensajeChat(idUsuario, idConversacion, data) {
  try {
    // Obtener empresa
    const empresa = await ayudaRepository.obtenerEmpresaPorUsuario(idUsuario);
    if (!empresa) {
      throw new Error('No existe una empresa asociada al usuario autenticado');
    }

    // Validar conversación
    const conversacion = await ayudaRepository.obtenerConversacionPorId(empresa.idEmpresa, idConversacion);
    if (!conversacion) {
      throw new Error('La conversación no existe');
    }

    // Validar que no esté cerrada
    if (conversacion.estado === 'cerrada') {
      throw new Error('La conversación está cerrada');
    }

    // Validar mensaje
    if (!data.mensaje || !data.mensaje.trim()) {
      throw new Error('El mensaje es obligatorio');
    }

    // Guardar mensaje del usuario
    await ayudaRepository.crearMensaje(idConversacion, 'usuario', data.mensaje.trim());

    // Generar respuesta del bot
    const respuestaBot = await soporteAiService.generarRespuesta(conversacion.asunto, data.mensaje.trim());

    // Guardar mensaje del bot
    await ayudaRepository.crearMensaje(idConversacion, 'bot', respuestaBot);

    // Retornar mensajes actualizados
    return await ayudaRepository.listarMensajes(idConversacion);
  } catch (error) {
    throw new Error(error.message);
  }
}

/**
 * Cerrar chat
 * @param {number} idUsuario
 * @param {number} idConversacion
 * @returns {Promise<Object>}
 */
async function cerrarChat(idUsuario, idConversacion) {
  try {
    // Obtener empresa
    const empresa = await ayudaRepository.obtenerEmpresaPorUsuario(idUsuario);
    if (!empresa) {
      throw new Error('No existe una empresa asociada al usuario autenticado');
    }

    // Validar conversación
    const conversacion = await ayudaRepository.obtenerConversacionPorId(empresa.idEmpresa, idConversacion);
    if (!conversacion) {
      throw new Error('La conversación no existe');
    }

    // Cerrar conversación
    const resultado = await ayudaRepository.cerrarConversacion(empresa.idEmpresa, idConversacion);

    if (!resultado.success) {
      throw new Error('No se pudo cerrar la conversación');
    }

    // Obtener conversación actualizada
    return await ayudaRepository.obtenerConversacionPorId(empresa.idEmpresa, idConversacion);
  } catch (error) {
    throw new Error(error.message);
  }
}

/**
 * Obtener estado del sistema
 * @returns {Promise<Object>}
 */
async function obtenerEstadoSistema() {
  try {
    // Por ahora, retornar estado mock
    return {
      estado: 'operativo',
      mensaje: 'Todos los sistemas operativos',
      ultimaActualizacion: 'Hace 5 minutos'
    };
  } catch (error) {
    throw new Error(error.message);
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
