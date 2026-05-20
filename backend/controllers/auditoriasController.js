const auditoriasService = require('../services/auditoriasService');

/**
 * Auditorías Controller
 * Manejadores de las rutas de auditorías
 */

/**
 * Listar auditorías
 * GET /api/auditorias
 */
async function listarAuditorias(req, res) {
  try {
    const idUsuario = req.user.id_usuario;

    const filtros = {
      tipo: req.query.tipo,
      estadoAuditoria: req.query.estadoAuditoria,
      busqueda: req.query.busqueda,
      page: req.query.page,
      pageSize: req.query.pageSize
    };

    const resultado = await auditoriasService.listarAuditorias(idUsuario, filtros);

    return res.status(200).json({
      success: true,
      message: 'Auditorías obtenidas correctamente',
      data: resultado
    });
  } catch (error) {
    const statusCode = error.message.includes('no existe') ? 400 :
                       error.message.includes('inválido') ? 400 : 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
}

/**
 * Obtener auditoría por ID
 * GET /api/auditorias/:id
 */
async function obtenerAuditoriaPorId(req, res) {
  try {
    const idUsuario = req.user.id_usuario;
    const idAuditoria = parseInt(req.params.id);

    if (isNaN(idAuditoria)) {
      return res.status(400).json({
        success: false,
        message: 'ID de auditoría inválido'
      });
    }

    const auditoria = await auditoriasService.obtenerAuditoriaPorId(idUsuario, idAuditoria);

    return res.status(200).json({
      success: true,
      message: 'Auditoría obtenida correctamente',
      data: auditoria
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
 * Verificar correo
 * POST /api/auditorias/email-check
 */
async function verificarCorreo(req, res) {
  try {
    const idUsuario = req.user.id_usuario;

    const auditoria = await auditoriasService.verificarCorreo(idUsuario, req.body);

    return res.status(201).json({
      success: true,
      message: 'Auditoría de correo creada correctamente',
      data: auditoria
    });
  } catch (error) {
    const statusCode = error.message.includes('obligatorio') ? 400 :
                       error.message.includes('formato') ? 400 :
                       error.message.includes('no existe') ? 400 : 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
}

/**
 * Escanear puertos
 * POST /api/auditorias/port-scan
 */
async function escanearPuertos(req, res) {
  try {
    const idUsuario = req.user.id_usuario;

    const auditoria = await auditoriasService.escanearPuertos(idUsuario, req.body);

    return res.status(201).json({
      success: true,
      message: 'Auditoría de puertos creada correctamente',
      data: auditoria
    });
  } catch (error) {
    const statusCode = error.message.includes('obligatorio') ? 400 :
                       error.message.includes('no existe') ? 400 : 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
}

/**
 * Eliminar auditoría
 * DELETE /api/auditorias/:id
 */
async function eliminarAuditoria(req, res) {
  try {
    const idUsuario = req.user.id_usuario;
    const idAuditoria = parseInt(req.params.id);

    if (isNaN(idAuditoria)) {
      return res.status(400).json({
        success: false,
        message: 'ID de auditoría inválido'
      });
    }

    const resultado = await auditoriasService.eliminarAuditoria(idUsuario, idAuditoria);

    return res.status(200).json({
      success: true,
      message: resultado.message,
      data: null
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
 * Generar resultados de auditoría
 * POST /api/auditorias/:id/generar-resultados
 */
async function generarResultados(req, res) {
  try {
    const idUsuario = req.user.id_usuario;
    const idAuditoria = parseInt(req.params.id);

    if (isNaN(idAuditoria)) {
      return res.status(400).json({
        success: false,
        message: 'ID de auditoría inválido'
      });
    }

    const resultado = await auditoriasService.generarResultadosAuditoria(idUsuario, idAuditoria);

    return res.status(200).json({
      success: true,
      message: 'Resultados generados correctamente',
      data: resultado
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
 * Obtener resultados de auditoría
 * GET /api/auditorias/:id/resultados
 */
async function obtenerResultados(req, res) {
  try {
    const idUsuario = req.user.id_usuario;
    const idAuditoria = parseInt(req.params.id);

    if (isNaN(idAuditoria)) {
      return res.status(400).json({
        success: false,
        message: 'ID de auditoría inválido'
      });
    }

    const resultado = await auditoriasService.obtenerResultadosAuditoria(idUsuario, idAuditoria);

    return res.status(200).json({
      success: true,
      message: 'Resultados obtenidos correctamente',
      data: resultado
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
 * Generar PDF de auditoría
 * GET /api/auditorias/:id/pdf
 */
async function generarPdf(req, res) {
  try {
    const idUsuario = req.user.id_usuario;
    const idAuditoria = parseInt(req.params.id);

    if (isNaN(idAuditoria)) {
      return res.status(400).json({
        success: false,
        message: 'ID de auditoría inválido'
      });
    }

    const pdfBuffer = await auditoriasService.generarPdfAuditoria(idUsuario, idAuditoria);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=auditoria_${idAuditoria}.pdf`);
    res.status(200).send(pdfBuffer);
  } catch (error) {
    const statusCode = error.message.includes('no existe') ? 404 : 400;
    return res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
}

/**
 * Ejecutar auditoría funcional
 * POST /api/auditorias/ejecutar
 */
async function ejecutarAuditoria(req, res) {
  try {
    const idUsuario = req.user.id_usuario;
    const { tipo, target } = req.body;

    const idAuditoria = await auditoriasService.ejecutarAuditoria(idUsuario, {
      tipo,
      target
    });

    return res.status(201).json({
      success: true,
      message: 'Auditoría iniciada correctamente',
      data: {
        idAuditoria: idAuditoria
      }
    });
  } catch (error) {
    const statusCode = error.message.includes('obligatorio') || error.message.includes('debe ser') ? 400 : 400;
    return res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
}

/**
 * Obtener estado de auditoría
 * GET /api/auditorias/:id/estado
 */
async function obtenerEstadoAuditoria(req, res) {
  try {
    const idUsuario = req.user.id_usuario;
    const idAuditoria = parseInt(req.params.id);

    if (isNaN(idAuditoria)) {
      return res.status(400).json({
        success: false,
        message: 'ID de auditoría inválido'
      });
    }

    const data = await auditoriasService.obtenerEstadoAuditoria(idUsuario, idAuditoria);

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
 * Obtener resultados de auditoría funcional
 * GET /api/auditorias/:id/resultados (NEW)
 */
async function obtenerResultadosFuncional(req, res) {
  try {
    const idUsuario = req.user.id_usuario;
    const idAuditoria = parseInt(req.params.id);

    if (isNaN(idAuditoria)) {
      return res.status(400).json({
        success: false,
        message: 'ID de auditoría inválido'
      });
    }

    const data = await auditoriasService.obtenerResultadosFuncional(idUsuario, idAuditoria);

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
  listarAuditorias,
  obtenerAuditoriaPorId,
  verificarCorreo,
  escanearPuertos,
  eliminarAuditoria,
  generarResultados,
  obtenerResultados,
  generarPdf,
  ejecutarAuditoria,
  obtenerEstadoAuditoria,
  obtenerResultadosFuncional
};
