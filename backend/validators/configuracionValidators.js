/**
 * Validaciones para el módulo de Configuración
 */

const Result = require('../utils/result');
const {
  validateRequired,
  validateMinLength,
  validateMaxLength,
  validateEnum,
  validateBoolean
} = require('./commonValidators');

const IDIOMAS_PERMITIDOS = ['es', 'en'];
const METODOS_2FA = ['authenticator', 'email', 'sms'];
const ESTADOS_SUSCRIPCION = ['activa', 'cancelada', 'vencida', 'prueba'];

// Validar datos de perfil
function validatePerfilData(data) {
  if (!data.nombreCompleto) {
    return Result.failure('El nombre completo es obligatorio');
  }

  const minLengthResult = validateMinLength(
    data.nombreCompleto,
    2,
    'El nombre completo'
  );
  if (minLengthResult.isError()) return minLengthResult;

  const maxLengthResult = validateMaxLength(
    data.nombreCompleto,
    100,
    'El nombre completo'
  );
  if (maxLengthResult.isError()) return maxLengthResult;

  if (data.idiomaInterfaz) {
    const idiomaResult = validateEnum(
      data.idiomaInterfaz,
      IDIOMAS_PERMITIDOS,
      'Idioma'
    );
    if (idiomaResult.isError()) return idiomaResult;
  }

  if (data.cargo) {
    const cargoResult = validateMinLength(data.cargo, 2, 'El cargo');
    if (cargoResult.isError()) return cargoResult;
  }

  return Result.success();
}

// Validar datos de seguridad
function validateSeguridadData(data) {
  if (data.twoFactorEnabled !== undefined) {
    const boolResult = validateBoolean(
      data.twoFactorEnabled,
      'twoFactorEnabled'
    );
    if (boolResult.isError()) return boolResult;
  }

  if (data.metodo2fa) {
    const metodoResult = validateEnum(
      data.metodo2fa,
      METODOS_2FA,
      'Método 2FA'
    );
    if (metodoResult.isError()) return metodoResult;
  }

  return Result.success();
}

// Validar datos de suscripción
function validateSuscripcionData(data) {
  if (!data.nombrePlan) {
    return Result.failure('El nombre del plan es obligatorio');
  }

  const planResult = validateMinLength(data.nombrePlan, 2, 'El nombre del plan');
  if (planResult.isError()) return planResult;

  if (data.precioMensual !== undefined) {
    if (typeof data.precioMensual !== 'number' || data.precioMensual < 0) {
      return Result.failure('El precio mensual no puede ser negativo');
    }
  }

  if (data.estado) {
    const estadoResult = validateEnum(
      data.estado,
      ESTADOS_SUSCRIPCION,
      'Estado'
    );
    if (estadoResult.isError()) return estadoResult;
  }

  return Result.success();
}

module.exports = {
  validatePerfilData,
  validateSeguridadData,
  validateSuscripcionData,
  IDIOMAS_PERMITIDOS,
  METODOS_2FA,
  ESTADOS_SUSCRIPCION
};
