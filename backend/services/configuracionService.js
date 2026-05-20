const configuracionRepository = require('../repositories/configuracionRepository');
const {
  validatePerfilData,
  validateSeguridadData,
  validateSuscripcionData,
  IDIOMAS_PERMITIDOS,
  METODOS_2FA,
  ESTADOS_SUSCRIPCION
} = require('../validators/configuracionValidators');

// ==================== PERFIL ====================

async function obtenerPerfil(idUsuario) {
  // Validar usuario existe
  const usuario = await configuracionRepository.obtenerUsuarioPorId(idUsuario);
  if (!usuario) {
    throw new Error('Usuario no encontrado');
  }
  
  // Obtener o crear perfil
  let perfil = await configuracionRepository.obtenerPerfil(idUsuario);
  
  if (!perfil) {
    perfil = await configuracionRepository.crearPerfilDefault(idUsuario, {
      nombre_completo: usuario.nombre,
      cargo: null
    });
  }
  
  return {
    idUsuario: perfil.idUsuario,
    nombreCompleto: perfil.nombreCompleto,
    email: usuario.email,
    cargo: perfil.cargo,
    idiomaInterfaz: perfil.idiomaInterfaz,
    fotoPerfilUrl: perfil.fotoPerfilUrl,
    puntajePerfil: perfil.puntajePerfil
  };
}

async function actualizarPerfil(idUsuario, data) {
  // Validar datos
  const validationResult = validatePerfilData(data);
  if (validationResult.isError()) {
    throw new Error(validationResult.error);
  }
  
  // Validar usuario existe
  const usuario = await configuracionRepository.obtenerUsuarioPorId(idUsuario);
  if (!usuario) {
    throw new Error('Usuario no encontrado');
  }
  
  // Obtener o crear perfil
  let perfil = await configuracionRepository.obtenerPerfil(idUsuario);
  if (!perfil) {
    perfil = await configuracionRepository.crearPerfilDefault(idUsuario, {
      nombre_completo: usuario.nombre,
      cargo: null
    });
  }
  
  // Actualizar perfil
  const perfilActualizado = await configuracionRepository.actualizarPerfil(idUsuario, {
    nombreCompleto: data.nombreCompleto,
    cargo: data.cargo || null,
    idiomaInterfaz: data.idiomaInterfaz,
    fotoPerfilUrl: data.fotoPerfilUrl || null
  });
  
  return {
    idUsuario: perfilActualizado.idUsuario,
    nombreCompleto: perfilActualizado.nombreCompleto,
    email: usuario.email,
    cargo: perfilActualizado.cargo,
    idiomaInterfaz: perfilActualizado.idiomaInterfaz,
    fotoPerfilUrl: perfilActualizado.fotoPerfilUrl,
    puntajePerfil: perfilActualizado.puntajePerfil
  };
}

// ==================== SEGURIDAD ====================

async function obtenerSeguridad(idUsuario) {
  // Validar usuario existe
  const usuario = await configuracionRepository.obtenerUsuarioPorId(idUsuario);
  if (!usuario) {
    throw new Error('Usuario no encontrado');
  }
  
  // Obtener o crear seguridad
  let seguridad = await configuracionRepository.obtenerSeguridad(idUsuario);
  
  if (!seguridad) {
    seguridad = await configuracionRepository.crearSeguridadDefault(idUsuario);
  }
  
  return {
    twoFactorEnabled: seguridad.twoFactorEnabled === 1,
    metodo2fa: seguridad.metodo2fa
  };
}

async function actualizarSeguridad(idUsuario, data) {
  // Validar datos
  const validationResult = validateSeguridadData(data);
  if (validationResult.isError()) {
    throw new Error(validationResult.error);
  }
  
  // Validar usuario existe
  const usuario = await configuracionRepository.obtenerUsuarioPorId(idUsuario);
  if (!usuario) {
    throw new Error('Usuario no encontrado');
  }
  
  // Obtener o crear seguridad
  let seguridad = await configuracionRepository.obtenerSeguridad(idUsuario);
  if (!seguridad) {
    seguridad = await configuracionRepository.crearSeguridadDefault(idUsuario);
  }
  
  // Actualizar seguridad
  const seguridadActualizada = await configuracionRepository.actualizarSeguridad(idUsuario, {
    twoFactorEnabled: data.twoFactorEnabled !== undefined ? data.twoFactorEnabled : seguridad.twoFactorEnabled,
    metodo2fa: data.metodo2fa || seguridad.metodo2fa
  });
  
  return {
    twoFactorEnabled: seguridadActualizada.twoFactorEnabled === 1,
    metodo2fa: seguridadActualizada.metodo2fa
  };
}

// ==================== SESIONES ====================

async function listarSesiones(idUsuario) {
  // Validar usuario existe
  const usuario = await configuracionRepository.obtenerUsuarioPorId(idUsuario);
  if (!usuario) {
    throw new Error('Usuario no encontrado');
  }
  
  const sesiones = await configuracionRepository.listarSesiones(idUsuario);
  
  return sesiones.map(sesion => ({
    idSesion: sesion.idSesion,
    dispositivo: sesion.dispositivo,
    navegador: sesion.navegador,
    ip: sesion.ip,
    ubicacion: sesion.ubicacion,
    esActual: sesion.esActual === 1,
    fechaInicio: sesion.fechaInicio,
    ultimaActividad: sesion.ultimaActividad
  }));
}

async function cerrarSesion(idUsuario, idSesion) {
  // Validar usuario existe
  const usuario = await configuracionRepository.obtenerUsuarioPorId(idUsuario);
  if (!usuario) {
    throw new Error('Usuario no encontrado');
  }
  
  // Validar sesión pertenece al usuario
  const sesion = await configuracionRepository.obtenerSesion(idSesion);
  if (!sesion) {
    throw new Error('Sesión no encontrada');
  }
  
  if (sesion.idUsuario !== idUsuario) {
    throw new Error('La sesión no pertenece al usuario autenticado');
  }
  
  await configuracionRepository.cerrarSesion(idSesion);
}

async function cerrarOtrasSesiones(idUsuario, idSesionActual = null) {
  // Validar usuario existe
  const usuario = await configuracionRepository.obtenerUsuarioPorId(idUsuario);
  if (!usuario) {
    throw new Error('Usuario no encontrado');
  }
  
  await configuracionRepository.cerrarOtrasSesiones(idUsuario, idSesionActual);
}

// ==================== SUSCRIPCIÓN ====================

async function obtenerSuscripcion(idUsuario) {
  // Validar usuario existe
  const usuario = await configuracionRepository.obtenerUsuarioPorId(idUsuario);
  if (!usuario) {
    throw new Error('Usuario no encontrado');
  }
  
  // Obtener empresa del usuario
  const empresa = await configuracionRepository.obtenerEmpresaPorUsuario(idUsuario);
  if (!empresa) {
    throw new Error('La empresa no existe para este usuario');
  }
  
  // Obtener o crear suscripción
  let suscripcion = await configuracionRepository.obtenerSuscripcionActiva(empresa.id_empresa);
  
  if (!suscripcion) {
    suscripcion = await configuracionRepository.crearSuscripcionDefault(empresa.id_empresa);
  }
  
  return {
    idSuscripcion: suscripcion.idSuscripcion,
    idEmpresa: suscripcion.idEmpresa,
    nombrePlan: suscripcion.nombrePlan,
    precioMensual: parseFloat(suscripcion.precioMensual),
    fechaInicio: suscripcion.fechaInicio,
    proximaFacturacion: suscripcion.proximaFacturacion,
    estado: suscripcion.estado
  };
}

async function actualizarSuscripcion(idUsuario, data) {
  // Validar datos
  const validationResult = validateSuscripcionData(data);
  if (validationResult.isError()) {
    throw new Error(validationResult.error);
  }
  
  // Validar usuario existe
  const usuario = await configuracionRepository.obtenerUsuarioPorId(idUsuario);
  if (!usuario) {
    throw new Error('Usuario no encontrado');
  }
  
  // Obtener empresa del usuario
  const empresa = await configuracionRepository.obtenerEmpresaPorUsuario(idUsuario);
  if (!empresa) {
    throw new Error('La empresa no existe para este usuario');
  }
  
  // Obtener o crear suscripción
  let suscripcion = await configuracionRepository.obtenerSuscripcionActiva(empresa.id_empresa);
  if (!suscripcion) {
    suscripcion = await configuracionRepository.crearSuscripcionDefault(empresa.id_empresa);
  }
  
  // Actualizar suscripción
  const suscripcionActualizada = await configuracionRepository.actualizarSuscripcion(
    empresa.id_empresa,
    {
      nombrePlan: data.nombrePlan,
      precioMensual: data.precioMensual,
      proximaFacturacion: data.proximaFacturacion,
      estado: data.estado
    }
  );
  
  return {
    idSuscripcion: suscripcionActualizada.idSuscripcion,
    idEmpresa: suscripcionActualizada.idEmpresa,
    nombrePlan: suscripcionActualizada.nombrePlan,
    precioMensual: parseFloat(suscripcionActualizada.precioMensual),
    fechaInicio: suscripcionActualizada.fechaInicio,
    proximaFacturacion: suscripcionActualizada.proximaFacturacion,
    estado: suscripcionActualizada.estado
  };
}

module.exports = {
  obtenerPerfil,
  actualizarPerfil,
  obtenerSeguridad,
  actualizarSeguridad,
  listarSesiones,
  cerrarSesion,
  cerrarOtrasSesiones,
  obtenerSuscripcion,
  actualizarSuscripcion
};
