const reportesRepository = require('../repositories/reportesRepository');
const {
  validateReporteCreation,
  validateReporteUpdate
} = require('../validators/reportesValidators');

async function listarReportes({ idEmpresa, periodo, page = 1, pageSize = 10 }) {
  // Validar que empresa existe
  const empresaExiste = await reportesRepository.existeEmpresa(idEmpresa);
  if (!empresaExiste) {
    throw new Error('La empresa no existe');
  }
  
  // Obtener reportes
  const items = await reportesRepository.obtenerTodos({
    idEmpresa,
    periodo,
    page: parseInt(page),
    pageSize: parseInt(pageSize)
  });
  
  // Obtener total
  const total = await reportesRepository.contar({
    idEmpresa,
    periodo
  });
  
  // Formatear respuesta
  const reportes = items.map(reporte => ({
    idReporte: reporte.idReporte,
    idEmpresa: reporte.idEmpresa,
    periodo: reporte.periodo,
    puntajeGlobal: reporte.puntajeGlobal,
    resilienciaPhishing: reporte.resilienciaPhishing,
    capacitacionCompletada: reporte.capacitacionCompletada,
    vulnerabilidadesCriticas: reporte.vulnerabilidadesCriticas,
    resumenEjecutivo: reporte.resumenEjecutivo,
    fechaRegistro: reporte.fechaRegistro
  }));
  
  return {
    items: reportes,
    total,
    page: parseInt(page),
    pageSize: parseInt(pageSize)
  };
}

async function obtenerReportePorId(idReporte) {
  const reporte = await reportesRepository.obtenerPorId(idReporte);
  
  if (!reporte) {
    throw new Error('Reporte no encontrado');
  }
  
  return {
    idReporte: reporte.idReporte,
    idEmpresa: reporte.idEmpresa,
    periodo: reporte.periodo,
    puntajeGlobal: reporte.puntajeGlobal,
    resilienciaPhishing: reporte.resilienciaPhishing,
    capacitacionCompletada: reporte.capacitacionCompletada,
    vulnerabilidadesCriticas: reporte.vulnerabilidadesCriticas,
    resumenEjecutivo: reporte.resumenEjecutivo
  };
}

async function crearReporte(data) {
  // Validar datos
  const validationResult = validateReporteCreation(data);
  if (validationResult.isError()) {
    throw new Error(validationResult.error);
  }
  
  // Validar empresa existe
  const empresaExiste = await reportesRepository.existeEmpresa(data.idEmpresa);
  if (!empresaExiste) {
    throw new Error('La empresa no existe');
  }
  
  const reporte = await reportesRepository.crear(data);
  
  return {
    idReporte: reporte.idReporte,
    idEmpresa: reporte.idEmpresa,
    periodo: reporte.periodo,
    puntajeGlobal: reporte.puntajeGlobal,
    resilienciaPhishing: reporte.resilienciaPhishing,
    capacitacionCompletada: reporte.capacitacionCompletada,
    vulnerabilidadesCriticas: reporte.vulnerabilidadesCriticas,
    resumenEjecutivo: reporte.resumenEjecutivo
  };
}

async function actualizarReporte(idReporte, data) {
  // Validar datos
  const validationResult = validateReporteUpdate(data);
  if (validationResult.isError()) {
    throw new Error(validationResult.error);
  }
  
  // Verificar que reporte existe
  const reporte = await reportesRepository.obtenerPorId(idReporte);
  if (!reporte) {
    throw new Error('Reporte no encontrado');
  }
  
  const reporteActualizado = await reportesRepository.actualizar(idReporte, data);
  
  return {
    idReporte: reporteActualizado.idReporte,
    idEmpresa: reporteActualizado.idEmpresa,
    periodo: reporteActualizado.periodo,
    puntajeGlobal: reporteActualizado.puntajeGlobal,
    resilienciaPhishing: reporteActualizado.resilienciaPhishing,
    capacitacionCompletada: reporteActualizado.capacitacionCompletada,
    vulnerabilidadesCriticas: reporteActualizado.vulnerabilidadesCriticas,
    resumenEjecutivo: reporteActualizado.resumenEjecutivo
  };
}

async function eliminarReporte(idReporte) {
  // Verificar que reporte existe
  const reporte = await reportesRepository.obtenerPorId(idReporte);
  if (!reporte) {
    throw new Error('Reporte no encontrado');
  }
  
  await reportesRepository.eliminarLogico(idReporte);
}

module.exports = {
  listarReportes,
  obtenerReportePorId,
  crearReporte,
  actualizarReporte,
  eliminarReporte
};
