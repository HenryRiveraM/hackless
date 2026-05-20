/**
 * Validadores para Incidencias de Seguridad
 */

const Result = require('../utils/result');

// Constantes de validación
const SEVERIDADES = ['critico', 'alto', 'medio', 'bajo'];
const ESTADOS_INCIDENCIA = ['abierta', 'en_revision', 'resuelta'];
const TIPOS_ACCION = ['password', 'sesiones', 'bloqueo_ip', 'soporte'];
const TIPOS_EVENTO = ['deteccion', 'investigacion', 'respuesta', 'cierre'];

/**
 * Validar creación de incidencia
 */
function validateIncidenciaCreation(data) {
  // Validar codigoIncidencia
  if (!data.codigoIncidencia || typeof data.codigoIncidencia !== 'string') {
    return Result.failure('El código de incidencia es obligatorio');
  }

  if (data.codigoIncidencia.length < 5 || data.codigoIncidencia.length > 50) {
    return Result.failure('El código de incidencia debe tener entre 5 y 50 caracteres');
  }

  // Validar titulo
  if (!data.titulo || typeof data.titulo !== 'string') {
    return Result.failure('El título es obligatorio');
  }

  if (data.titulo.length < 5 || data.titulo.length > 200) {
    return Result.failure('El título debe tener entre 5 y 200 caracteres');
  }

  // Validar severidad
  if (!data.severidad || !SEVERIDADES.includes(data.severidad)) {
    return Result.failure('La severidad de incidencia es inválida');
  }

  // Validar estado incidencia (opcional, default 'abierta')
  if (data.estadoIncidencia && !ESTADOS_INCIDENCIA.includes(data.estadoIncidencia)) {
    return Result.failure('El estado de incidencia es inválido');
  }

  // Validar resumen evento
  if (!data.resumenEvento || typeof data.resumenEvento !== 'string') {
    return Result.failure('El resumen del evento es obligatorio');
  }

  if (data.resumenEvento.length < 10 || data.resumenEvento.length > 2000) {
    return Result.failure('El resumen del evento debe tener entre 10 y 2000 caracteres');
  }

  // Validar IP origen (opcional)
  if (data.ipOrigen && typeof data.ipOrigen !== 'string') {
    return Result.failure('La IP origen debe ser un texto válido');
  }

  // Validar dispositivo navegador (opcional)
  if (data.dispositivoNavegador && typeof data.dispositivoNavegador !== 'string') {
    return Result.failure('El dispositivo navegador debe ser un texto válido');
  }

  // Validar marca tiempo (opcional)
  if (data.marcaTiempo && isNaN(Date.parse(data.marcaTiempo))) {
    return Result.failure('La marca de tiempo no es una fecha válida');
  }

  // Validar recomendación (opcional)
  if (data.recomendacion && typeof data.recomendacion !== 'string') {
    return Result.failure('La recomendación debe ser un texto válido');
  }

  // Validar activos (opcional, debe ser array)
  if (data.activos && !Array.isArray(data.activos)) {
    return Result.failure('Los activos deben ser un array');
  }

  if (data.activos && data.activos.length > 100) {
    return Result.failure('Máximo 100 activos por incidencia');
  }

  // Validar timeline (opcional, debe ser array)
  if (data.timeline && !Array.isArray(data.timeline)) {
    return Result.failure('El timeline debe ser un array');
  }

  if (data.timeline && data.timeline.length > 100) {
    return Result.failure('Máximo 100 eventos en timeline');
  }

  return Result.success(data);
}

/**
 * Validar actualización de incidencia
 */
function validateIncidenciaUpdate(data) {
  // Si viene titulo, validar
  if (data.titulo !== undefined) {
    if (typeof data.titulo !== 'string') {
      return Result.failure('El título debe ser un texto válido');
    }
    if (data.titulo.length < 5 || data.titulo.length > 200) {
      return Result.failure('El título debe tener entre 5 y 200 caracteres');
    }
  }

  // Si viene severidad, validar
  if (data.severidad !== undefined) {
    if (!SEVERIDADES.includes(data.severidad)) {
      return Result.failure('La severidad de incidencia es inválida');
    }
  }

  // Si viene estado, validar
  if (data.estadoIncidencia !== undefined) {
    if (!ESTADOS_INCIDENCIA.includes(data.estadoIncidencia)) {
      return Result.failure('El estado de incidencia es inválido');
    }
  }

  // Si viene resumen evento, validar
  if (data.resumenEvento !== undefined) {
    if (typeof data.resumenEvento !== 'string') {
      return Result.failure('El resumen del evento debe ser un texto válido');
    }
    if (data.resumenEvento.length < 10 || data.resumenEvento.length > 2000) {
      return Result.failure('El resumen del evento debe tener entre 10 y 2000 caracteres');
    }
  }

  // Si viene recomendación, validar
  if (data.recomendacion !== undefined) {
    if (typeof data.recomendacion !== 'string') {
      return Result.failure('La recomendación debe ser un texto válido');
    }
  }

  return Result.success(data);
}

/**
 * Validar cambio de estado
 */
function validateEstadoUpdate(data) {
  if (!data.estadoIncidencia || !ESTADOS_INCIDENCIA.includes(data.estadoIncidencia)) {
    return Result.failure('El estado de incidencia es inválido');
  }

  return Result.success(data);
}

/**
 * Validar creación de acción
 */
function validateAccionCreation(data) {
  if (!data.accion || typeof data.accion !== 'string') {
    return Result.failure('La acción es obligatoria');
  }

  if (data.accion.length < 5 || data.accion.length > 150) {
    return Result.failure('La acción debe tener entre 5 y 150 caracteres');
  }

  if (!data.tipoAccion || !TIPOS_ACCION.includes(data.tipoAccion)) {
    return Result.failure('El tipo de acción es inválido');
  }

  return Result.success(data);
}

/**
 * Validar evento timeline
 */
function validateTimelineEvento(data) {
  if (!data.titulo || typeof data.titulo !== 'string') {
    return Result.failure('El título del evento es obligatorio');
  }

  if (data.titulo.length < 3 || data.titulo.length > 150) {
    return Result.failure('El título del evento debe tener entre 3 y 150 caracteres');
  }

  if (!data.fechaEvento || isNaN(Date.parse(data.fechaEvento))) {
    return Result.failure('La fecha del evento no es válida');
  }

  if (data.tipoEvento && !TIPOS_EVENTO.includes(data.tipoEvento)) {
    return Result.failure('El tipo de evento es inválido');
  }

  if (data.descripcion && typeof data.descripcion !== 'string') {
    return Result.failure('La descripción del evento debe ser un texto válido');
  }

  return Result.success(data);
}

/**
 * Validar activo
 */
function validateActivo(data) {
  if (!data.nombreActivo || typeof data.nombreActivo !== 'string') {
    return Result.failure('El nombre del activo es obligatorio');
  }

  if (data.nombreActivo.length < 3 || data.nombreActivo.length > 150) {
    return Result.failure('El nombre del activo debe tener entre 3 y 150 caracteres');
  }

  if (data.tipoActivo && typeof data.tipoActivo !== 'string') {
    return Result.failure('El tipo de activo debe ser un texto válido');
  }

  if (data.descripcion && typeof data.descripcion !== 'string') {
    return Result.failure('La descripción del activo debe ser un texto válido');
  }

  return Result.success(data);
}

/**
 * Validar paginación
 */
function validatePaginacion(page, pageSize) {
  const p = parseInt(page) || 1;
  const ps = parseInt(pageSize) || 10;

  if (p < 1) {
    return Result.failure('La página debe ser mayor a 0');
  }

  if (ps < 1 || ps > 100) {
    return Result.failure('El tamaño de página debe estar entre 1 y 100');
  }

  return Result.success({ page: p, pageSize: ps });
}

module.exports = {
  validateIncidenciaCreation,
  validateIncidenciaUpdate,
  validateEstadoUpdate,
  validateAccionCreation,
  validateTimelineEvento,
  validateActivo,
  validatePaginacion,
  // Constantes
  SEVERIDADES,
  ESTADOS_INCIDENCIA,
  TIPOS_ACCION,
  TIPOS_EVENTO
};
