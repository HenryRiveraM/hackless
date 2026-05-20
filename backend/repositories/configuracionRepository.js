const { query, queryOne } = require('../config/database');

// ==================== USUARIO Y EMPRESA ====================

async function obtenerUsuarioPorId(idUsuario) {
  const sql = `SELECT id_usuario, nombre, email, estado FROM usuarios WHERE id_usuario = ?`;
  return queryOne(sql, [idUsuario]);
}

async function obtenerEmpresaPorUsuario(idUsuario) {
  const sql = `SELECT id_empresa, nombre_empresa FROM empresas WHERE id_usuario = ? LIMIT 1`;
  return queryOne(sql, [idUsuario]);
}

// ==================== PERFIL ====================

async function obtenerPerfil(idUsuario) {
  const sql = `
    SELECT 
      id_perfil as idPerfil,
      id_usuario as idUsuario,
      nombre_completo as nombreCompleto,
      cargo,
      idioma_interfaz as idiomaInterfaz,
      foto_perfil_url as fotoPerfilUrl,
      puntaje_perfil as puntajePerfil
    FROM perfiles_usuario
    WHERE id_usuario = ? AND estado = 1
  `;
  
  return queryOne(sql, [idUsuario]);
}

async function crearPerfilDefault(idUsuario, data) {
  const sql = `
    INSERT INTO perfiles_usuario (
      id_usuario,
      nombre_completo,
      cargo,
      idioma_interfaz,
      estado
    ) VALUES (?, ?, ?, 'es', 1)
  `;
  
  const result = await query(sql, [
    idUsuario,
    data.nombre_completo || 'Usuario',
    data.cargo || null
  ]);
  
  return obtenerPerfil(idUsuario);
}

async function actualizarPerfil(idUsuario, data) {
  const fields = [];
  const params = [];
  
  if (data.nombreCompleto !== undefined) {
    fields.push('nombre_completo = ?');
    params.push(data.nombreCompleto);
  }
  if (data.cargo !== undefined) {
    fields.push('cargo = ?');
    params.push(data.cargo);
  }
  if (data.idiomaInterfaz !== undefined) {
    fields.push('idioma_interfaz = ?');
    params.push(data.idiomaInterfaz);
  }
  if (data.fotoPerfilUrl !== undefined) {
    fields.push('foto_perfil_url = ?');
    params.push(data.fotoPerfilUrl);
  }
  
  if (fields.length === 0) {
    return obtenerPerfil(idUsuario);
  }
  
  fields.push('ultima_actualizacion = CURRENT_TIMESTAMP');
  params.push(idUsuario);
  
  const sql = `UPDATE perfiles_usuario SET ${fields.join(', ')} WHERE id_usuario = ?`;
  await query(sql, params);
  
  return obtenerPerfil(idUsuario);
}

// ==================== SEGURIDAD ====================

async function obtenerSeguridad(idUsuario) {
  const sql = `
    SELECT 
      id_seguridad as idSeguridad,
      id_usuario as idUsuario,
      two_factor_enabled as twoFactorEnabled,
      metodo_2fa as metodo2fa
    FROM seguridad_usuario
    WHERE id_usuario = ?
  `;
  
  return queryOne(sql, [idUsuario]);
}

async function crearSeguridadDefault(idUsuario) {
  const sql = `
    INSERT INTO seguridad_usuario (
      id_usuario,
      two_factor_enabled,
      metodo_2fa
    ) VALUES (?, 0, 'authenticator')
  `;
  
  await query(sql, [idUsuario]);
  return obtenerSeguridad(idUsuario);
}

async function actualizarSeguridad(idUsuario, data) {
  const fields = [];
  const params = [];
  
  if (data.twoFactorEnabled !== undefined) {
    fields.push('two_factor_enabled = ?');
    params.push(data.twoFactorEnabled ? 1 : 0);
  }
  if (data.metodo2fa !== undefined) {
    fields.push('metodo_2fa = ?');
    params.push(data.metodo2fa);
  }
  
  if (fields.length === 0) {
    return obtenerSeguridad(idUsuario);
  }
  
  fields.push('ultima_actualizacion = CURRENT_TIMESTAMP');
  params.push(idUsuario);
  
  const sql = `UPDATE seguridad_usuario SET ${fields.join(', ')} WHERE id_usuario = ?`;
  await query(sql, params);
  
  return obtenerSeguridad(idUsuario);
}

// ==================== SESIONES ====================

async function listarSesiones(idUsuario) {
  const sql = `
    SELECT 
      id_sesion as idSesion,
      id_usuario as idUsuario,
      dispositivo,
      navegador,
      ip,
      ubicacion,
      es_actual as esActual,
      fecha_inicio as fechaInicio,
      ultima_actividad as ultimaActividad
    FROM sesiones_usuario
    WHERE id_usuario = ? AND estado = 1
    ORDER BY ultima_actividad DESC
  `;
  
  return query(sql, [idUsuario]);
}

async function obtenerSesion(idSesion) {
  const sql = `
    SELECT 
      id_sesion as idSesion,
      id_usuario as idUsuario,
      dispositivo,
      navegador,
      ip,
      ubicacion,
      es_actual as esActual,
      fecha_inicio as fechaInicio,
      ultima_actividad as ultimaActividad
    FROM sesiones_usuario
    WHERE id_sesion = ?
  `;
  
  return queryOne(sql, [idSesion]);
}

async function cerrarSesion(idSesion) {
  const sql = `UPDATE sesiones_usuario SET estado = 0 WHERE id_sesion = ?`;
  await query(sql, [idSesion]);
}

async function cerrarOtrasSesiones(idUsuario, idSesionActual = null) {
  let sql = `UPDATE sesiones_usuario SET estado = 0 WHERE id_usuario = ? AND es_actual = 0`;
  const params = [idUsuario];
  
  if (idSesionActual) {
    sql += ` AND id_sesion != ?`;
    params.push(idSesionActual);
  }
  
  await query(sql, params);
}

// ==================== SUSCRIPCIÓN ====================

async function obtenerSuscripcionActiva(idEmpresa) {
  const sql = `
    SELECT 
      id_suscripcion as idSuscripcion,
      id_empresa as idEmpresa,
      nombre_plan as nombrePlan,
      precio_mensual as precioMensual,
      fecha_inicio as fechaInicio,
      proxima_facturacion as proximaFacturacion,
      estado
    FROM suscripciones_empresa
    WHERE id_empresa = ?
    ORDER BY fecha_registro DESC
    LIMIT 1
  `;
  
  return queryOne(sql, [idEmpresa]);
}

async function crearSuscripcionDefault(idEmpresa) {
  const hoy = new Date().toISOString().split('T')[0];
  const proximaFacturacion = new Date();
  proximaFacturacion.setDate(proximaFacturacion.getDate() + 30);
  const proximaFacturacionStr = proximaFacturacion.toISOString().split('T')[0];
  
  const sql = `
    INSERT INTO suscripciones_empresa (
      id_empresa,
      nombre_plan,
      precio_mensual,
      fecha_inicio,
      proxima_facturacion,
      estado
    ) VALUES (?, 'Plan Pro', 49.00, ?, ?, 'activa')
  `;
  
  await query(sql, [idEmpresa, hoy, proximaFacturacionStr]);
  return obtenerSuscripcionActiva(idEmpresa);
}

async function actualizarSuscripcion(idEmpresa, data) {
  const fields = [];
  const params = [];
  
  if (data.nombrePlan !== undefined) {
    fields.push('nombre_plan = ?');
    params.push(data.nombrePlan);
  }
  if (data.precioMensual !== undefined) {
    fields.push('precio_mensual = ?');
    params.push(data.precioMensual);
  }
  if (data.proximaFacturacion !== undefined) {
    fields.push('proxima_facturacion = ?');
    params.push(data.proximaFacturacion);
  }
  if (data.estado !== undefined) {
    fields.push('estado = ?');
    params.push(data.estado);
  }
  
  if (fields.length === 0) {
    return obtenerSuscripcionActiva(idEmpresa);
  }
  
  fields.push('ultima_actualizacion = CURRENT_TIMESTAMP');
  params.push(idEmpresa);
  
  const sql = `UPDATE suscripciones_empresa SET ${fields.join(', ')} WHERE id_empresa = ?`;
  await query(sql, params);
  
  return obtenerSuscripcionActiva(idEmpresa);
}

module.exports = {
  obtenerUsuarioPorId,
  obtenerEmpresaPorUsuario,
  obtenerPerfil,
  crearPerfilDefault,
  actualizarPerfil,
  obtenerSeguridad,
  crearSeguridadDefault,
  actualizarSeguridad,
  listarSesiones,
  obtenerSesion,
  cerrarSesion,
  cerrarOtrasSesiones,
  obtenerSuscripcionActiva,
  crearSuscripcionDefault,
  actualizarSuscripcion
};
