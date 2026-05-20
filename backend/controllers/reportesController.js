const reportesService = require('../services/reportesService');

async function listar(req, res) {
  try {
    const { idEmpresa, periodo, page = 1, pageSize = 10 } = req.query;
    
    if (!idEmpresa) {
      return res.status(400).json({
        success: false,
        message: 'El parámetro idEmpresa es obligatorio'
      });
    }
    
    const resultado = await reportesService.listarReportes({
      idEmpresa: parseInt(idEmpresa),
      periodo,
      page,
      pageSize
    });
    
    res.status(200).json({
      success: true,
      message: 'Reportes obtenidos correctamente',
      data: resultado
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

async function obtenerPorId(req, res) {
  try {
    const { id } = req.params;
    
    const reporte = await reportesService.obtenerReportePorId(parseInt(id));
    
    res.status(200).json({
      success: true,
      message: 'Reporte obtenido correctamente',
      data: reporte
    });
  } catch (error) {
    if (error.message === 'Reporte no encontrado') {
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

async function crear(req, res) {
  try {
    const data = req.body;
    
    const reporte = await reportesService.crearReporte(data);
    
    res.status(201).json({
      success: true,
      message: 'Reporte registrado correctamente',
      data: reporte
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

async function actualizar(req, res) {
  try {
    const { id } = req.params;
    const data = req.body;
    
    const reporte = await reportesService.actualizarReporte(parseInt(id), data);
    
    res.status(200).json({
      success: true,
      message: 'Reporte actualizado correctamente',
      data: reporte
    });
  } catch (error) {
    if (error.message === 'Reporte no encontrado') {
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

async function eliminar(req, res) {
  try {
    const { id } = req.params;
    
    await reportesService.eliminarReporte(parseInt(id));
    
    res.status(200).json({
      success: true,
      message: 'Reporte eliminado correctamente'
    });
  } catch (error) {
    if (error.message === 'Reporte no encontrado') {
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
  listar,
  obtenerPorId,
  crear,
  actualizar,
  eliminar
};
