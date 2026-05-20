/**
 * Validaciones para el módulo de Reportes
 */

const Result = require('../utils/result');
const {
  validateRequired,
  validateMinLength,
  validateRange,
  validatePositive
} = require('./commonValidators');

// Validar creación de reporte
function validateReporteCreation(data) {
  // Validar idEmpresa
  if (!data.idEmpresa) {
    return Result.failure('El ID de empresa es requerido');
  }

  // Validar periodo
  const periodoResult = validateRequired(data.periodo, 'El periodo');
  if (periodoResult.isError()) return periodoResult;

  const periodoLengthResult = validateMinLength(data.periodo, 3, 'El periodo');
  if (periodoLengthResult.isError()) return periodoLengthResult;

  // Validar resumen ejecutivo
  const resumenResult = validateRequired(
    data.resumenEjecutivo,
    'El resumen ejecutivo'
  );
  if (resumenResult.isError()) return resumenResult;

  const resumenLengthResult = validateMinLength(
    data.resumenEjecutivo,
    10,
    'El resumen ejecutivo'
  );
  if (resumenLengthResult.isError()) return resumenLengthResult;

  // Validar que todos los puntajes estén presentes
  if (
    data.puntajeGlobal === undefined ||
    data.resilienciaPhishing === undefined ||
    data.capacitacionCompletada === undefined ||
    data.vulnerabilidadesCriticas === undefined
  ) {
    return Result.failure('Todos los puntajes y métricas son obligatorios');
  }

  // Validar puntajes
  const puntajeGlobalResult = validateRange(
    data.puntajeGlobal,
    0,
    100,
    'El puntaje global'
  );
  if (puntajeGlobalResult.isError()) return puntajeGlobalResult;

  const resilienciaResult = validateRange(
    data.resilienciaPhishing,
    0,
    100,
    'La resiliencia phishing'
  );
  if (resilienciaResult.isError()) return resilienciaResult;

  const capacitacionResult = validateRange(
    data.capacitacionCompletada,
    0,
    100,
    'La capacitación completada'
  );
  if (capacitacionResult.isError()) return capacitacionResult;

  const vulnerabilidadesResult = validatePositive(
    data.vulnerabilidadesCriticas,
    'Las vulnerabilidades críticas'
  );
  if (vulnerabilidadesResult.isError()) return vulnerabilidadesResult;

  return Result.success();
}

// Validar actualización de reporte
function validateReporteUpdate(data) {
  // Periodo si se proporciona
  if (data.periodo) {
    const periodoLengthResult = validateMinLength(data.periodo, 3, 'El periodo');
    if (periodoLengthResult.isError()) return periodoLengthResult;
  }

  // Resumen si se proporciona
  if (data.resumenEjecutivo) {
    const resumenLengthResult = validateMinLength(
      data.resumenEjecutivo,
      10,
      'El resumen ejecutivo'
    );
    if (resumenLengthResult.isError()) return resumenLengthResult;
  }

  // Puntaje global si se proporciona
  if (data.puntajeGlobal !== undefined) {
    const puntajeResult = validateRange(
      data.puntajeGlobal,
      0,
      100,
      'El puntaje global'
    );
    if (puntajeResult.isError()) return puntajeResult;
  }

  // Resiliencia si se proporciona
  if (data.resilienciaPhishing !== undefined) {
    const resilienciaResult = validateRange(
      data.resilienciaPhishing,
      0,
      100,
      'La resiliencia phishing'
    );
    if (resilienciaResult.isError()) return resilienciaResult;
  }

  // Capacitación si se proporciona
  if (data.capacitacionCompletada !== undefined) {
    const capacitacionResult = validateRange(
      data.capacitacionCompletada,
      0,
      100,
      'La capacitación completada'
    );
    if (capacitacionResult.isError()) return capacitacionResult;
  }

  // Vulnerabilidades si se proporciona
  if (data.vulnerabilidadesCriticas !== undefined) {
    const vulnerabilidadesResult = validatePositive(
      data.vulnerabilidadesCriticas,
      'Las vulnerabilidades críticas'
    );
    if (vulnerabilidadesResult.isError()) return vulnerabilidadesResult;
  }

  return Result.success();
}

module.exports = {
  validateReporteCreation,
  validateReporteUpdate
};
