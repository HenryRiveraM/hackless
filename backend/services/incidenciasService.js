/**
 * Service para Incidencias de Seguridad
 * Contiene la lógica de negocio
 */

const incidenciasRepository = require('../repositories/incidenciasRepository');
const geoUtils = require('../utils/geo.utils');
const {
  validateIncidenciaCreation,
  validateIncidenciaUpdate,
  validateEstadoUpdate,
  validateAccionCreation,
  validateTimelineEvento,
  validateActivo,
  validatePaginacion
} = require('../validators/incidenciasValidators');

// Listar incidencias
async function listarIncidencias(idUsuario, filtros) {
  // Validar usuario
  if (!idUsuario) {
    throw new Error('Usuario no autenticado');
  }

  // Obtener empresa del usuario
  const empresa = await incidenciasRepository.obtenerEmpresaPorUsuario(idUsuario);
  if (!empresa) {
    throw new Error('No existe una empresa asociada al usuario autenticado');
  }

  // Validar paginación
  const { page = 1, pageSize = 10 } = filtros;
  const paginacionResult = validatePaginacion(page, pageSize);
  if (paginacionResult.isError()) {
    throw new Error(paginacionResult.error);
  }

  // Preparar filtros
  const queryFiltros = {
    idEmpresa: empresa.id_empresa,
    severidad: filtros.severidad,
    estadoIncidencia: filtros.estadoIncidencia,
    busqueda: filtros.busqueda,
    page: paginacionResult.data.page,
    pageSize: paginacionResult.data.pageSize
  };

  // Obtener incidencias
  const items = await incidenciasRepository.listarIncidencias(queryFiltros);

  // Formatear respuesta
  const incidencias = items.map(incidencia => ({
    idIncidencia: incidencia.id_incidencia,
    codigoIncidencia: incidencia.codigo_incidencia,
    titulo: incidencia.titulo,
    severidad: incidencia.severidad,
    estadoIncidencia: incidencia.estado_incidencia,
    resumenEvento: incidencia.resumen_evento,
    ipOrigen: incidencia.ip_origen,
    fechaRegistro: incidencia.fecha_registro
  }));

  // Obtener total
  const total = await incidenciasRepository.contarIncidencias({
    idEmpresa: empresa.id_empresa,
    severidad: filtros.severidad,
    estadoIncidencia: filtros.estadoIncidencia,
    busqueda: filtros.busqueda
  });

  return {
    items: incidencias,
    total,
    page: paginacionResult.data.page,
    pageSize: paginacionResult.data.pageSize
  };
}

// Obtener incidencia por ID
async function obtenerIncidencia(idUsuario, idIncidencia) {
  // Validar usuario
  if (!idUsuario) {
    throw new Error('Usuario no autenticado');
  }

  // Obtener empresa del usuario
  const empresa = await incidenciasRepository.obtenerEmpresaPorUsuario(idUsuario);
  if (!empresa) {
    throw new Error('No existe una empresa asociada al usuario autenticado');
  }

  // Obtener incidencia
  const incidencia = await incidenciasRepository.obtenerIncidenciaPorId(
    idIncidencia,
    empresa.id_empresa
  );
  if (!incidencia) {
    throw new Error('La incidencia no existe');
  }

  // Obtener datos relacionados
  const [activos, timeline, acciones, geolocalizacion] = await Promise.all([
    incidenciasRepository.listarActivos(idIncidencia),
    incidenciasRepository.listarTimeline(idIncidencia),
    incidenciasRepository.listarAcciones(idIncidencia),
    incidenciasRepository.obtenerGeolocalizacion(idIncidencia)
  ]);

  // Formatear respuesta
  const respuesta = {
    idIncidencia: incidencia.id_incidencia,
    codigoIncidencia: incidencia.codigo_incidencia,
    titulo: incidencia.titulo,
    severidad: incidencia.severidad,
    estadoIncidencia: incidencia.estado_incidencia,
    resumenEvento: incidencia.resumen_evento,
    ipOrigen: incidencia.ip_origen,
    dispositivoNavegador: incidencia.dispositivo_navegador,
    marcaTiempo: incidencia.marca_tiempo,
    recomendacion: incidencia.recomendacion,
    fechaRegistro: incidencia.fecha_registro,
    ultimaActualizacion: incidencia.ultima_actualizacion
  };

  // Agregar geolocalización si existe
  if (geolocalizacion) {
    respuesta.geolocalizacion = {
      pais: geolocalizacion.pais,
      ciudad: geolocalizacion.ciudad,
      region: geolocalizacion.region,
      latitud: geolocalizacion.latitud,
      longitud: geolocalizacion.longitud,
      proveedor: geolocalizacion.proveedor
    };
  }

  // Formatear activos
  respuesta.activos = activos.map(a => ({
    idActivo: a.id_activo,
    nombreActivo: a.nombre_activo,
    descripcion: a.descripcion,
    tipoActivo: a.tipo_activo,
    fechaRegistro: a.fecha_registro
  }));

  // Formatear timeline
  respuesta.timeline = timeline.map(t => ({
    idTimeline: t.id_timeline,
    titulo: t.titulo,
    descripcion: t.descripcion,
    fechaEvento: t.fecha_evento,
    tipoEvento: t.tipo_evento,
    fechaRegistro: t.fecha_registro
  }));

  // Formatear acciones
  respuesta.acciones = acciones.map(acc => ({
    idAccion: acc.id_accion,
    accion: acc.accion,
    tipoAccion: acc.tipo_accion,
    ejecutada: acc.ejecutada === 1,
    fechaEjecucion: acc.fecha_ejecucion,
    fechaRegistro: acc.fecha_registro
  }));

  return respuesta;
}

// Crear incidencia
async function crearIncidencia(idUsuario, data) {
  // Validar usuario
  if (!idUsuario) {
    throw new Error('Usuario no autenticado');
  }

  // Validar datos
  const validationResult = validateIncidenciaCreation(data);
  if (validationResult.isError()) {
    throw new Error(validationResult.error);
  }

  // Obtener empresa del usuario
  const empresa = await incidenciasRepository.obtenerEmpresaPorUsuario(idUsuario);
  if (!empresa) {
    throw new Error('No existe una empresa asociada al usuario autenticado');
  }

  // Crear incidencia
  const incidenciaCreada = await incidenciasRepository.crearIncidencia(
    empresa.id_empresa,
    data
  );

  // Crear activos si existen
  if (data.activos && data.activos.length > 0) {
    for (const activo of data.activos) {
      const activoValidation = validateActivo(activo);
      if (activoValidation.isError()) {
        throw new Error(`Error en activo: ${activoValidation.error}`);
      }
    }
    await incidenciasRepository.crearActivos(incidenciaCreada.id_incidencia, data.activos);
  }

  // Crear timeline si existe
  if (data.timeline && data.timeline.length > 0) {
    for (const evento of data.timeline) {
      const eventoValidation = validateTimelineEvento(evento);
      if (eventoValidation.isError()) {
        throw new Error(`Error en evento: ${eventoValidation.error}`);
      }
    }
    await incidenciasRepository.crearTimeline(incidenciaCreada.id_incidencia, data.timeline);
  }

  // Intentar obtener geolocalización (SIN ROMPER FLUJO)
  // Si falla, la incidencia ya está creada
  if (data.ipOrigen) {
    try {
      const geoData = await geoUtils.obtenerGeolocalizacion(data.ipOrigen);

      if (geoData) {
        geoData.ipOrigen = data.ipOrigen;
        await incidenciasRepository.crearGeolocalizacion(
          incidenciaCreada.id_incidencia,
          geoData
        );
      }
    } catch (error) {
      // Log pero no romper flujo
      console.warn('[INCIDENCIAS] Error al obtener geolocalización:', error.message);
    }
  }

  return {
    idIncidencia: incidenciaCreada.id_incidencia
  };
}

// Actualizar incidencia
async function actualizarIncidencia(idUsuario, idIncidencia, data) {
  // Validar usuario
  if (!idUsuario) {
    throw new Error('Usuario no autenticado');
  }

  // Validar datos
  const validationResult = validateIncidenciaUpdate(data);
  if (validationResult.isError()) {
    throw new Error(validationResult.error);
  }

  // Obtener empresa del usuario
  const empresa = await incidenciasRepository.obtenerEmpresaPorUsuario(idUsuario);
  if (!empresa) {
    throw new Error('No existe una empresa asociada al usuario autenticado');
  }

  // Verificar que la incidencia existe y pertenece a la empresa
  const incidencia = await incidenciasRepository.obtenerIncidenciaPorId(
    idIncidencia,
    empresa.id_empresa
  );
  if (!incidencia) {
    throw new Error('La incidencia no existe');
  }

  // Actualizar incidencia
  await incidenciasRepository.actualizarIncidencia(idIncidencia, empresa.id_empresa, data);

  return { idIncidencia };
}

// Actualizar estado de incidencia
async function actualizarEstado(idUsuario, idIncidencia, data) {
  // Validar usuario
  if (!idUsuario) {
    throw new Error('Usuario no autenticado');
  }

  // Validar datos
  const validationResult = validateEstadoUpdate(data);
  if (validationResult.isError()) {
    throw new Error(validationResult.error);
  }

  // Obtener empresa del usuario
  const empresa = await incidenciasRepository.obtenerEmpresaPorUsuario(idUsuario);
  if (!empresa) {
    throw new Error('No existe una empresa asociada al usuario autenticado');
  }

  // Verificar que la incidencia existe y pertenece a la empresa
  const incidencia = await incidenciasRepository.obtenerIncidenciaPorId(
    idIncidencia,
    empresa.id_empresa
  );
  if (!incidencia) {
    throw new Error('La incidencia no existe');
  }

  // Actualizar estado
  const incidenciaActualizada = await incidenciasRepository.actualizarEstado(
    idIncidencia,
    empresa.id_empresa,
    data.estadoIncidencia
  );

  return {
    idIncidencia: incidenciaActualizada.id_incidencia,
    estadoIncidencia: incidenciaActualizada.estado_incidencia
  };
}

// Eliminar incidencia (soft delete)
async function eliminarIncidencia(idUsuario, idIncidencia) {
  // Validar usuario
  if (!idUsuario) {
    throw new Error('Usuario no autenticado');
  }

  // Obtener empresa del usuario
  const empresa = await incidenciasRepository.obtenerEmpresaPorUsuario(idUsuario);
  if (!empresa) {
    throw new Error('No existe una empresa asociada al usuario autenticado');
  }

  // Verificar que la incidencia existe y pertenece a la empresa
  const incidencia = await incidenciasRepository.obtenerIncidenciaPorId(
    idIncidencia,
    empresa.id_empresa
  );
  if (!incidencia) {
    throw new Error('La incidencia no existe');
  }

  // Eliminar (soft delete)
  await incidenciasRepository.eliminarLogico(idIncidencia, empresa.id_empresa);
}

// Agregar timeline
async function agregarTimeline(idUsuario, idIncidencia, data) {
  // Validar usuario
  if (!idUsuario) {
    throw new Error('Usuario no autenticado');
  }

  // Validar datos
  const validationResult = validateTimelineEvento(data);
  if (validationResult.isError()) {
    throw new Error(validationResult.error);
  }

  // Obtener empresa del usuario
  const empresa = await incidenciasRepository.obtenerEmpresaPorUsuario(idUsuario);
  if (!empresa) {
    throw new Error('No existe una empresa asociada al usuario autenticado');
  }

  // Verificar que la incidencia existe y pertenece a la empresa
  const incidencia = await incidenciasRepository.obtenerIncidenciaPorId(
    idIncidencia,
    empresa.id_empresa
  );
  if (!incidencia) {
    throw new Error('La incidencia no existe');
  }

  // Agregar timeline
  const result = await incidenciasRepository.crearTimeline(idIncidencia, [data]);

  return {
    idTimeline: result[0].id_timeline
  };
}

// Agregar acción
async function agregarAccion(idUsuario, idIncidencia, data) {
  // Validar usuario
  if (!idUsuario) {
    throw new Error('Usuario no autenticado');
  }

  // Validar datos
  const validationResult = validateAccionCreation(data);
  if (validationResult.isError()) {
    throw new Error(validationResult.error);
  }

  // Obtener empresa del usuario
  const empresa = await incidenciasRepository.obtenerEmpresaPorUsuario(idUsuario);
  if (!empresa) {
    throw new Error('No existe una empresa asociada al usuario autenticado');
  }

  // Verificar que la incidencia existe y pertenece a la empresa
  const incidencia = await incidenciasRepository.obtenerIncidenciaPorId(
    idIncidencia,
    empresa.id_empresa
  );
  if (!incidencia) {
    throw new Error('La incidencia no existe');
  }

  // Crear acción
  const accionCreada = await incidenciasRepository.crearAccion(idIncidencia, data);

  // Agregar automáticamente a timeline
  await incidenciasRepository.agregarTimelineAccion(
    idIncidencia,
    data.accion,
    data.tipoAccion
  );

  return {
    idAccion: accionCreada.id_accion
  };
}

// Agregar activo
async function agregarActivo(idUsuario, idIncidencia, data) {
  // Validar usuario
  if (!idUsuario) {
    throw new Error('Usuario no autenticado');
  }

  // Validar datos
  const validationResult = validateActivo(data);
  if (validationResult.isError()) {
    throw new Error(validationResult.error);
  }

  // Obtener empresa del usuario
  const empresa = await incidenciasRepository.obtenerEmpresaPorUsuario(idUsuario);
  if (!empresa) {
    throw new Error('No existe una empresa asociada al usuario autenticado');
  }

  // Verificar que la incidencia existe y pertenece a la empresa
  const incidencia = await incidenciasRepository.obtenerIncidenciaPorId(
    idIncidencia,
    empresa.id_empresa
  );
  if (!incidencia) {
    throw new Error('La incidencia no existe');
  }

  // Crear activo
  const result = await incidenciasRepository.crearActivos(idIncidencia, [data]);

  return {
    idActivo: result[0].id_activo
  };
}

// Obtener resumen
async function obtenerResumen(idUsuario) {
  // Validar usuario
  if (!idUsuario) {
    throw new Error('Usuario no autenticado');
  }

  // Obtener empresa del usuario
  const empresa = await incidenciasRepository.obtenerEmpresaPorUsuario(idUsuario);
  if (!empresa) {
    throw new Error('No existe una empresa asociada al usuario autenticado');
  }

  // Obtener resumen
  return await incidenciasRepository.obtenerResumen(empresa.id_empresa);
}

module.exports = {
  listarIncidencias,
  obtenerIncidencia,
  crearIncidencia,
  actualizarIncidencia,
  actualizarEstado,
  eliminarIncidencia,
  agregarTimeline,
  agregarAccion,
  agregarActivo,
  obtenerResumen
};
