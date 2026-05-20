const db = require('../config/database');

/**
 * Obtener empresa asociada al usuario
 * @param {number} idUsuario
 * @returns {Promise<Object>}
 */
async function obtenerEmpresaPorUsuario(idUsuario) {
  try {
    const sql = `
      SELECT e.id_empresa, e.nombre_empresa
      FROM empresas e
      WHERE e.id_usuario = ? AND e.estado = 1
      LIMIT 1
    `;
    const result = await db.queryOne(sql, [idUsuario]);
    if (!result) return null;
    
    return {
      idEmpresa: result.id_empresa,
      nombreEmpresa: result.nombre_empresa
    };
  } catch (error) {
    throw new Error(`Error obteniendo empresa: ${error.message}`);
  }
}

/**
 * Listar FAQ activos
 * @returns {Promise<Array>}
 */
async function listarFaq() {
  try {
    const sql = `
      SELECT 
        id_faq,
        pregunta,
        respuesta,
        categoria,
        popular
      FROM faq
      WHERE estado = 1
      ORDER BY categoria ASC, id_faq ASC
    `;
    const rows = await db.query(sql);
    
    return rows.map(row => ({
      idFaq: row.id_faq,
      pregunta: row.pregunta,
      respuesta: row.respuesta,
      categoria: row.categoria,
      popular: row.popular === 1
    }));
  } catch (error) {
    throw new Error(`Error listando FAQ: ${error.message}`);
  }
}

/**
 * Listar FAQ populares
 * @returns {Promise<Array>}
 */
async function listarFaqPopulares() {
  try {
    const sql = `
      SELECT 
        id_faq,
        pregunta,
        respuesta,
        categoria
      FROM faq
      WHERE estado = 1 AND popular = 1
      ORDER BY id_faq ASC
    `;
    const rows = await db.query(sql);
    
    return rows.map(row => ({
      idFaq: row.id_faq,
      pregunta: row.pregunta,
      respuesta: row.respuesta,
      categoria: row.categoria
    }));
  } catch (error) {
    throw new Error(`Error listando FAQ populares: ${error.message}`);
  }
}

/**
 * Buscar FAQ por texto
 * @param {string} q - término de búsqueda
 * @returns {Promise<Array>}
 */
async function buscarFaq(q) {
  try {
    const sql = `
      SELECT 
        id_faq,
        pregunta,
        respuesta,
        categoria
      FROM faq
      WHERE estado = 1 AND (pregunta LIKE ? OR respuesta LIKE ? OR categoria LIKE ?)
      ORDER BY categoria ASC, id_faq ASC
    `;
    const searchTerm = `%${q}%`;
    const rows = await db.query(sql, [searchTerm, searchTerm, searchTerm]);
    
    return rows.map(row => ({
      idFaq: row.id_faq,
      pregunta: row.pregunta,
      respuesta: row.respuesta,
      categoria: row.categoria
    }));
  } catch (error) {
    throw new Error(`Error buscando FAQ: ${error.message}`);
  }
}

/**
 * Crear ticket de soporte
 * @param {number} idEmpresa
 * @param {Object} data
 * @returns {Promise<number>}
 */
async function crearTicket(idEmpresa, data) {
  try {
    const sql = `
      INSERT INTO tickets_soporte (
        id_empresa,
        asunto,
        mensaje,
        prioridad,
        estado,
        fecha_registro
      ) VALUES (?, ?, ?, ?, 'abierto', NOW())
    `;
    const result = await db.query(sql, [
      idEmpresa,
      data.asunto,
      data.mensaje,
      data.prioridad
    ]);
    return result.insertId || 1;
  } catch (error) {
    throw new Error(`Error creando ticket: ${error.message}`);
  }
}

/**
 * Listar tickets de empresa
 * @param {number} idEmpresa
 * @returns {Promise<Array>}
 */
async function listarTickets(idEmpresa) {
  try {
    const query = `
      SELECT 
        id_ticket,
        asunto,
        mensaje,
        prioridad,
        estado,
        fecha_registro
      FROM tickets_soporte
      WHERE id_empresa = ?
      ORDER BY fecha_registro DESC
    `;
    const rows = await db.query(query, [idEmpresa]);
    
    return rows.map(row => ({
      idTicket: row.id_ticket,
      asunto: row.asunto,
      mensaje: row.mensaje,
      prioridad: row.prioridad,
      estado: row.estado,
      fechaRegistro: row.fecha_registro
    }));
  } catch (error) {
    throw new Error(`Error listando tickets: ${error.message}`);
  }
}

/**
 * Obtener ticket por ID
 * @param {number} idEmpresa
 * @param {number} idTicket
 * @returns {Promise<Object>}
 */
async function obtenerTicketPorId(idEmpresa, idTicket) {
  try {
    const query = `
      SELECT 
        id_ticket,
        asunto,
        mensaje,
        prioridad,
        estado,
        fecha_registro
      FROM tickets_soporte
      WHERE id_ticket = ? AND id_empresa = ?
      LIMIT 1
    `;
    const rows = await db.query(query, [idTicket, idEmpresa]);
    if (rows.length === 0) return null;
    
    const row = rows[0];
    return {
      idTicket: row.id_ticket,
      asunto: row.asunto,
      mensaje: row.mensaje,
      prioridad: row.prioridad,
      estado: row.estado,
      fechaRegistro: row.fecha_registro
    };
  } catch (error) {
    throw new Error(`Error obteniendo ticket: ${error.message}`);
  }
}

/**
 * Crear conversación de soporte
 * @param {number} idEmpresa
 * @param {string} asunto
 * @returns {Promise<number>}
 */
async function crearConversacion(idEmpresa, asunto) {
  try {
    const query = `
      INSERT INTO conversaciones_soporte (
        id_empresa,
        asunto,
        estado
      ) VALUES (?, ?, 'abierta')
    `;
    const result = await db.query(query, [idEmpresa, asunto]);
    return result.insertId;
  } catch (error) {
    throw new Error(`Error creando conversación: ${error.message}`);
  }
}

/**
 * Crear mensaje en conversación
 * @param {number} idConversacion
 * @param {string} remitente - 'usuario' o 'bot'
 * @param {string} mensaje
 * @returns {Promise<number>}
 */
async function crearMensaje(idConversacion, remitente, mensaje) {
  try {
    const query = `
      INSERT INTO mensajes_soporte (
        id_conversacion,
        remitente,
        mensaje
      ) VALUES (?, ?, ?)
    `;
    const result = await db.query(query, [idConversacion, remitente, mensaje]);
    return result.insertId;
  } catch (error) {
    throw new Error(`Error creando mensaje: ${error.message}`);
  }
}

/**
 * Listar conversaciones de empresa
 * @param {number} idEmpresa
 * @returns {Promise<Array>}
 */
async function listarConversaciones(idEmpresa) {
  try {
    const query = `
      SELECT 
        id_conversacion,
        asunto,
        estado,
        fecha_registro
      FROM conversaciones_soporte
      WHERE id_empresa = ?
      ORDER BY fecha_registro DESC
    `;
    const rows = await db.query(query, [idEmpresa]);
    
    return rows.map(row => ({
      idConversacion: row.id_conversacion,
      asunto: row.asunto,
      estado: row.estado,
      fechaInicio: row.fecha_registro
    }));
  } catch (error) {
    throw new Error(`Error listando conversaciones: ${error.message}`);
  }
}

/**
 * Obtener conversación por ID
 * @param {number} idEmpresa
 * @param {number} idConversacion
 * @returns {Promise<Object>}
 */
async function obtenerConversacionPorId(idEmpresa, idConversacion) {
  try {
    const query = `
      SELECT 
        id_conversacion,
        asunto,
        estado,
        fecha_registro
      FROM conversaciones_soporte
      WHERE id_conversacion = ? AND id_empresa = ?
      LIMIT 1
    `;
    const rows = await db.query(query, [idConversacion, idEmpresa]);
    if (rows.length === 0) return null;
    
    const row = rows[0];
    return {
      idConversacion: row.id_conversacion,
      asunto: row.asunto,
      estado: row.estado,
      fechaInicio: row.fecha_registro
    };
  } catch (error) {
    throw new Error(`Error obteniendo conversación: ${error.message}`);
  }
}

/**
 * Listar mensajes de conversación
 * @param {number} idConversacion
 * @returns {Promise<Array>}
 */
async function listarMensajes(idConversacion) {
  try {
    const query = `
      SELECT 
        id_mensaje,
        remitente,
        mensaje,
        fecha_registro
      FROM mensajes_soporte
      WHERE id_conversacion = ?
      ORDER BY fecha_registro ASC
    `;
    const rows = await db.query(query, [idConversacion]);
    
    return rows.map(row => ({
      idMensaje: row.id_mensaje,
      remitente: row.remitente,
      mensaje: row.mensaje,
      fechaEnvio: row.fecha_envio
    }));
  } catch (error) {
    throw new Error(`Error listando mensajes: ${error.message}`);
  }
}

/**
 * Cerrar conversación
 * @param {number} idEmpresa
 * @param {number} idConversacion
 * @returns {Promise<Object>}
 */
async function cerrarConversacion(idEmpresa, idConversacion) {
  try {
    const query = `
      UPDATE conversaciones_soporte
      SET estado = 'cerrada'
      WHERE id_conversacion = ? AND id_empresa = ?
    `;
    const result = await db.query(query, [idConversacion, idEmpresa]);
    
    return {
      affectedRows: result.affectedRows,
      success: result.affectedRows > 0
    };
  } catch (error) {
    throw new Error(`Error cerrando conversación: ${error.message}`);
  }
}

module.exports = {
  obtenerEmpresaPorUsuario,
  listarFaq,
  listarFaqPopulares,
  buscarFaq,
  crearTicket,
  listarTickets,
  obtenerTicketPorId,
  crearConversacion,
  crearMensaje,
  listarConversaciones,
  obtenerConversacionPorId,
  listarMensajes,
  cerrarConversacion
};
