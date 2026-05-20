/**
 * Validaciones comunes reutilizables
 */

const Result = require('../utils/result');

// Validar email
function validateEmail(email) {
  if (!email || !email.trim()) {
    return Result.failure('El email es requerido');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return Result.failure('El email no es válido');
  }

  return Result.success();
}

// Validar que un campo no esté vacío
function validateRequired(value, fieldName) {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return Result.failure(`${fieldName} es requerido`);
  }
  return Result.success();
}

// Validar longitud mínima
function validateMinLength(value, minLength, fieldName) {
  if (!value) return Result.success(); // Permitir null/undefined si es opcional

  const length = typeof value === 'string' ? value.trim().length : value.length;
  if (length < minLength) {
    return Result.failure(
      `${fieldName} debe tener al menos ${minLength} caracteres`
    );
  }
  return Result.success();
}

// Validar longitud máxima
function validateMaxLength(value, maxLength, fieldName) {
  if (!value) return Result.success();

  const length = typeof value === 'string' ? value.trim().length : value.length;
  if (length > maxLength) {
    return Result.failure(
      `${fieldName} no puede exceder ${maxLength} caracteres`
    );
  }
  return Result.success();
}

// Validar rango numérico
function validateRange(value, min, max, fieldName) {
  if (value === undefined || value === null) return Result.success();

  const num = Number(value);
  if (isNaN(num)) {
    return Result.failure(`${fieldName} debe ser un número`);
  }

  if (num < min || num > max) {
    return Result.failure(
      `${fieldName} debe estar entre ${min} y ${max}`
    );
  }
  return Result.success();
}

// Validar que pertenece a lista de opciones permitidas
function validateEnum(value, allowedValues, fieldName) {
  if (!value) return Result.success();

  if (!allowedValues.includes(value)) {
    return Result.failure(
      `${fieldName} no permitido. Opciones: ${allowedValues.join(', ')}`
    );
  }
  return Result.success();
}

// Validar booleano
function validateBoolean(value, fieldName) {
  if (value === undefined || value === null) return Result.success();

  if (typeof value !== 'boolean') {
    return Result.failure(`${fieldName} debe ser un booleano`);
  }
  return Result.success();
}

// Validar que sea positivo
function validatePositive(value, fieldName) {
  if (value === undefined || value === null) return Result.success();

  const num = Number(value);
  if (isNaN(num)) {
    return Result.failure(`${fieldName} debe ser un número`);
  }

  if (num < 0) {
    return Result.failure(`${fieldName} no puede ser negativo`);
  }
  return Result.success();
}

module.exports = {
  validateEmail,
  validateRequired,
  validateMinLength,
  validateMaxLength,
  validateRange,
  validateEnum,
  validateBoolean,
  validatePositive
};
