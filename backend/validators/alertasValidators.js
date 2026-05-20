/**
 * Validaciones para el módulo de Alertas
 */

const Result = require('../utils/result');
const {
  validateRequired,
  validateMinLength,
  validateMaxLength,
  validateEnum
} = require('./commonValidators');

const CATEGORIAS = ['phishing', 'accesos', 'vulnerabilidades'];
const SEVERIDADES = ['critica', 'alta', 'media', 'baja'];
const ESTADOS_ALERTA = ['abierta', 'en_revision', 'resuelta'];

// Validar creación de alerta
function validateAlertaCreation(data) {
  // Validar título (obligatorio)
  const tituloResult = validateRequired(data.titulo, 'El título');
  if (tituloResult.isError()) return tituloResult;

  const tituloLengthResult = validateMinLength(data.titulo, 5, 'El título');
  if (tituloLengthResult.isError()) return tituloLengthResult;

  const tituloMaxResult = validateMaxLength(data.titulo, 200, 'El título');
  if (tituloMaxResult.isError()) return tituloMaxResult;

  // Validar descripción (obligatoria)
  const descResult = validateRequired(data.descripcion, 'La descripción');
  if (descResult.isError()) return descResult;

  const descLengthResult = validateMinLength(data.descripcion, 10, 'La descripción');
  if (descLengthResult.isError()) return descLengthResult;

  // Validar categoría (obligatoria)
  const categoriaResult = validateEnum(
    data.categoria,
    CATEGORIAS,
    'La categoría'
  );
  if (categoriaResult.isError()) return categoriaResult;

  // Validar severidad (obligatoria)
  const severidadResult = validateEnum(
    data.severidad,
    SEVERIDADES,
    'La severidad'
  );
  if (severidadResult.isError()) return severidadResult;

  // Validar estado alerta (opcional, default 'abierta')
  if (data.estadoAlerta) {
    const estadoResult = validateEnum(
      data.estadoAlerta,
      ESTADOS_ALERTA,
      'El estado de alerta'
    );
    if (estadoResult.isError()) return estadoResult;
  }

  return Result.success();
}

// Validar actualización de alerta
function validateAlertaUpdate(data) {
  // Validar título si se proporciona
  if (data.titulo) {
    const tituloLengthResult = validateMinLength(data.titulo, 5, 'El título');
    if (tituloLengthResult.isError()) return tituloLengthResult;

    const tituloMaxResult = validateMaxLength(data.titulo, 200, 'El título');
    if (tituloMaxResult.isError()) return tituloMaxResult;
  }

  // Validar descripción si se proporciona
  if (data.descripcion) {
    const descLengthResult = validateMinLength(data.descripcion, 10, 'La descripción');
    if (descLengthResult.isError()) return descLengthResult;
  }

  // Validar categoría si se proporciona
  if (data.categoria) {
    const categoriaResult = validateEnum(
      data.categoria,
      CATEGORIAS,
      'La categoría'
    );
    if (categoriaResult.isError()) return categoriaResult;
  }

  // Validar severidad si se proporciona
  if (data.severidad) {
    const severidadResult = validateEnum(
      data.severidad,
      SEVERIDADES,
      'La severidad'
    );
    if (severidadResult.isError()) return severidadResult;
  }

  // Validar estado alerta si se proporciona
  if (data.estadoAlerta) {
    const estadoResult = validateEnum(
      data.estadoAlerta,
      ESTADOS_ALERTA,
      'El estado de alerta'
    );
    if (estadoResult.isError()) return estadoResult;
  }

  return Result.success();
}

// Validar actualización de estado
function validateEstadoAlertaUpdate(data) {
  if (!data.estadoAlerta) {
    return Result.failure('El estado de alerta es obligatorio');
  }

  const estadoResult = validateEnum(
    data.estadoAlerta,
    ESTADOS_ALERTA,
    'El estado de alerta'
  );
  if (estadoResult.isError()) return estadoResult;

  return Result.success();
}

// Validar paginación
function validatePaginacion(page, pageSize) {
  const pageNum = parseInt(page) || 1;
  const pageSizeNum = parseInt(pageSize) || 10;

  if (pageNum < 1) {
    return Result.failure('El número de página debe ser mayor a 0');
  }

  if (pageSizeNum < 1 || pageSizeNum > 100) {
    return Result.failure('El tamaño de página debe estar entre 1 y 100');
  }

  return Result.success();
}

module.exports = {
  validateAlertaCreation,
  validateAlertaUpdate,
  validateEstadoAlertaUpdate,
  validatePaginacion,
  CATEGORIAS,
  SEVERIDADES,
  ESTADOS_ALERTA
};
