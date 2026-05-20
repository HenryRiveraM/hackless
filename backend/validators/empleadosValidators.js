/**
 * Validaciones para el módulo de Empleados
 */

const Result = require('../utils/result');
const {
  validateRequired,
  validateEmail,
  validateMinLength,
  validateRange,
  validateEnum
} = require('./commonValidators');

const ESTADOS_CAPACITACION = ['pendiente', 'en_progreso', 'completado', 'vencido'];

// Validar creación de empleado
function validateEmpleadoCreation(data) {
  // Validar campos obligatorios
  if (!data.idEmpresa) {
    return Result.failure('El ID de empresa es requerido');
  }

  const nombreResult = validateRequired(data.nombre, 'El nombre');
  if (nombreResult.isError()) return nombreResult;

  const nombreLengthResult = validateMinLength(data.nombre, 2, 'El nombre');
  if (nombreLengthResult.isError()) return nombreLengthResult;

  const emailResult = validateEmail(data.email);
  if (emailResult.isError()) return emailResult;

  const departamentoResult = validateRequired(
    data.departamento,
    'El departamento'
  );
  if (departamentoResult.isError()) return departamentoResult;

  const departamentoLengthResult = validateMinLength(
    data.departamento,
    2,
    'El departamento'
  );
  if (departamentoLengthResult.isError()) return departamentoLengthResult;

  // Validar puntaje si se proporciona
  if (data.puntajeSeguridad !== undefined) {
    const puntajeResult = validateRange(
      data.puntajeSeguridad,
      0,
      100,
      'El puntaje de seguridad'
    );
    if (puntajeResult.isError()) return puntajeResult;
  }

  // Validar estado de capacitación si se proporciona
  if (data.estadoCapacitacion) {
    const estadoResult = validateEnum(
      data.estadoCapacitacion,
      ESTADOS_CAPACITACION,
      'Estado de capacitación'
    );
    if (estadoResult.isError()) return estadoResult;
  }

  return Result.success();
}

// Validar actualización de empleado
function validateEmpleadoUpdate(data) {
  // Email si se proporciona
  if (data.email) {
    const emailResult = validateEmail(data.email);
    if (emailResult.isError()) return emailResult;
  }

  // Nombre si se proporciona
  if (data.nombre) {
    const nombreResult = validateMinLength(data.nombre, 2, 'El nombre');
    if (nombreResult.isError()) return nombreResult;
  }

  // Departamento si se proporciona
  if (data.departamento) {
    const departamentoResult = validateMinLength(
      data.departamento,
      2,
      'El departamento'
    );
    if (departamentoResult.isError()) return departamentoResult;
  }

  // Puntaje si se proporciona
  if (data.puntajeSeguridad !== undefined) {
    const puntajeResult = validateRange(
      data.puntajeSeguridad,
      0,
      100,
      'El puntaje de seguridad'
    );
    if (puntajeResult.isError()) return puntajeResult;
  }

  // Estado de capacitación si se proporciona
  if (data.estadoCapacitacion) {
    const estadoResult = validateEnum(
      data.estadoCapacitacion,
      ESTADOS_CAPACITACION,
      'Estado de capacitación'
    );
    if (estadoResult.isError()) return estadoResult;
  }

  return Result.success();
}

module.exports = {
  validateEmpleadoCreation,
  validateEmpleadoUpdate,
  ESTADOS_CAPACITACION
};
