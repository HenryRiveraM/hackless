const historialService = require('../services/historialAlertasService');
const { generarCSV, generarPDF } = require('../utils/export.utils');

class HistorialAlertasController {
  /**
   * Listar historial de alertas resueltas
   * GET /api/historial-alertas
   */
  async listarHistorial(req, res) {
    try {
      const idUsuario = req.user.id_usuario;

      const filtros = {
        categoria: req.query.categoria,
        severidad: req.query.severidad,
        busqueda: req.query.busqueda,
        page: req.query.page,
        pageSize: req.query.pageSize
      };

      const resultado = await historialService.listarHistorial(idUsuario, filtros);

      res.status(200).json({
        success: true,
        message: 'Historial obtenido correctamente',
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
   * Obtener resumen de alertas resueltas
   * GET /api/historial-alertas/resumen
   */
  async obtenerResumen(req, res) {
    try {
      const idUsuario = req.user.id_usuario;

      const resultado = await historialService.obtenerResumen(idUsuario);

      res.status(200).json({
        success: true,
        message: 'Resumen obtenido correctamente',
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
   * Resolver una incidencia
   * PATCH /api/historial-alertas/:id/resolver
   */
  async resolverIncidencia(req, res) {
    try {
      const idUsuario = req.user.id_usuario;
      const idIncidencia = parseInt(req.params.id);

      const resultado = await historialService.resolverIncidencia(idUsuario, idIncidencia, req.body);

      res.status(200).json({
        success: true,
        message: 'Incidencia resuelta correctamente',
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
   * Exportar historial de alertas resueltas
   * GET /api/historial-alertas/exportar?formato=json|csv|pdf
   */
  async exportarHistorial(req, res) {
    try {
      const idUsuario = req.user.id_usuario;
      const formato = (req.query.formato || 'json').toLowerCase();

      const resultado = await historialService.exportarHistorial(idUsuario, formato);

      // JSON - Retornar normal
      if (formato === 'json') {
        return res.status(200).json({
          success: true,
          message: 'Historial exportado correctamente',
          data: resultado.data
        });
      }

      // CSV - Generar y descargar
      if (formato === 'csv') {
        try {
          const csv = generarCSV(resultado.data);
          res.setHeader('Content-Type', 'text/csv; charset=utf-8');
          res.setHeader('Content-Disposition', 'attachment; filename=historial_alertas.csv');
          return res.status(200).send(csv);
        } catch (error) {
          return res.status(400).json({
            success: false,
            message: 'Error al generar CSV: ' + error.message
          });
        }
      }

      // PDF - Generar y descargar
      if (formato === 'pdf') {
        try {
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Disposition', 'attachment; filename=historial_alertas.pdf');
          return generarPDF(resultado.data, res);
        } catch (error) {
          return res.status(400).json({
            success: false,
            message: 'Error al generar PDF: ' + error.message
          });
        }
      }

      // Formato inválido
      return res.status(400).json({
        success: false,
        message: 'Formato de exportación inválido'
      });
    } catch (error) {
      const statusCode = error.statusCode || 400;
      return res.status(statusCode).json({
        success: false,
        message: error.message || 'Error al exportar historial'
      });
    }
  }
}

module.exports = new HistorialAlertasController();
