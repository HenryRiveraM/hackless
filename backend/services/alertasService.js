/**
 * Service para Alertas de Seguridad
 * Contiene la lógica de negocio
 */

const alertasRepository = require('../repositories/alertasRepository');
const {
  validateAlertaCreation,
  validateAlertaUpdate,
  validateEstadoAlertaUpdate,
  validatePaginacion
} = require('../validators/alertasValidators');

// Listar alertas
async function listarAlertas(idUsuario, filtros) {
  // Validar usuario
  if (!idUsuario) {
    throw new Error('Usuario no autenticado');
  }

  // Obtener empresa del usuario
  const empresa = await alertasRepository.obtenerEmpresaPorUsuario(idUsuario);
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
    categoria: filtros.categoria,
    severidad: filtros.severidad,
    estadoAlerta: filtros.estadoAlerta,
    busqueda: filtros.busqueda,
    page: parseInt(page),
    pageSize: parseInt(pageSize)
  };

  // Obtener alertas
  const items = await alertasRepository.listarAlertas(queryFiltros);

  // Formatear respuesta
  const alertas = items.map(alerta => ({
    idAlerta: alerta.id_alerta,
    titulo: alerta.titulo,
    descripcion: alerta.descripcion,
    categoria: alerta.categoria,
    severidad: alerta.severidad,
    estadoAlerta: alerta.estado_alerta,
    fechaAlerta: alerta.fecha_alerta
  }));

  // Obtener total
  const total = await alertasRepository.contarAlertas({
    idEmpresa: empresa.id_empresa,
    categoria: filtros.categoria,
    severidad: filtros.severidad,
    estadoAlerta: filtros.estadoAlerta,
    busqueda: filtros.busqueda
  });

  return {
    items: alertas,
    total,
    page: parseInt(page),
    pageSize: parseInt(pageSize)
  };
}

// Obtener alerta por ID
async function obtenerAlertaPorId(idUsuario, idAlerta) {
  // Validar usuario
  if (!idUsuario) {
    throw new Error('Usuario no autenticado');
  }

  // Obtener empresa del usuario
  const empresa = await alertasRepository.obtenerEmpresaPorUsuario(idUsuario);
  if (!empresa) {
    throw new Error('No existe una empresa asociada al usuario autenticado');
  }

  // Obtener alerta
  const alerta = await alertasRepository.obtenerAlertaPorId(idAlerta, empresa.id_empresa);
  if (!alerta) {
    throw new Error('La alerta no existe');
  }

  // Obtener detalle
  const detalle = await alertasRepository.obtenerDetallePorAlerta(idAlerta);

  // Formatear respuesta
  const respuesta = {
    idAlerta: alerta.id_alerta,
    titulo: alerta.titulo,
    descripcion: alerta.descripcion,
    categoria: alerta.categoria,
    severidad: alerta.severidad,
    estadoAlerta: alerta.estado_alerta,
    fechaAlerta: alerta.fecha_alerta
  };

  if (detalle) {
    respuesta.detalle = {
      codigoAlerta: detalle.codigo_alerta,
      descripcionTecnica: detalle.descripcion_tecnica,
      activosAfectados: detalle.activos_afectados,
      remediacion: detalle.remediacion,
      imagenUrl: detalle.imagen_url
    };
  }

  return respuesta;
}

// Crear alerta
async function crearAlerta(idUsuario, data) {
  // Validar usuario
  if (!idUsuario) {
    throw new Error('Usuario no autenticado');
  }

  // Validar datos
  const validationResult = validateAlertaCreation(data);
  if (validationResult.isError()) {
    throw new Error(validationResult.error);
  }

  // Obtener empresa del usuario
  const empresa = await alertasRepository.obtenerEmpresaPorUsuario(idUsuario);
  if (!empresa) {
    throw new Error('No existe una empresa asociada al usuario autenticado');
  }

  // Crear alerta
  const alertaCreada = await alertasRepository.crearAlerta(empresa.id_empresa, data);

  // Crear detalle si hay datos
  if (data.codigoAlerta || data.descripcionTecnica || data.activosAfectados || data.remediacion || data.imagenUrl) {
    await alertasRepository.crearDetalle(alertaCreada.id_alerta, {
      codigoAlerta: data.codigoAlerta,
      descripcionTecnica: data.descripcionTecnica,
      activosAfectados: data.activosAfectados,
      remediacion: data.remediacion,
      imagenUrl: data.imagenUrl
    });
  }

  return {
    idAlerta: alertaCreada.id_alerta
  };
}

// Actualizar alerta
async function actualizarAlerta(idUsuario, idAlerta, data) {
  // Validar usuario
  if (!idUsuario) {
    throw new Error('Usuario no autenticado');
  }

  // Validar datos
  const validationResult = validateAlertaUpdate(data);
  if (validationResult.isError()) {
    throw new Error(validationResult.error);
  }

  // Obtener empresa del usuario
  const empresa = await alertasRepository.obtenerEmpresaPorUsuario(idUsuario);
  if (!empresa) {
    throw new Error('No existe una empresa asociada al usuario autenticado');
  }

  // Verificar que la alerta existe y pertenece a la empresa
  const alerta = await alertasRepository.obtenerAlertaPorId(idAlerta, empresa.id_empresa);
  if (!alerta) {
    throw new Error('La alerta no existe');
  }

  // Actualizar alerta
  await alertasRepository.actualizarAlerta(idAlerta, empresa.id_empresa, data);

  // Actualizar o crear detalle si hay datos
  if (
    data.codigoAlerta !== undefined ||
    data.descripcionTecnica !== undefined ||
    data.activosAfectados !== undefined ||
    data.remediacion !== undefined ||
    data.imagenUrl !== undefined
  ) {
    await alertasRepository.crearDetalleSiNoExiste(idAlerta, {
      codigoAlerta: data.codigoAlerta,
      descripcionTecnica: data.descripcionTecnica,
      activosAfectados: data.activosAfectados,
      remediacion: data.remediacion,
      imagenUrl: data.imagenUrl
    });

    // Actualizar detalle si ya existe
    const detalleExistente = await alertasRepository.obtenerDetallePorAlerta(idAlerta);
    if (detalleExistente) {
      await alertasRepository.actualizarDetalle(idAlerta, {
        codigoAlerta: data.codigoAlerta,
        descripcionTecnica: data.descripcionTecnica,
        activosAfectados: data.activosAfectados,
        remediacion: data.remediacion,
        imagenUrl: data.imagenUrl
      });
    }
  }

  return { idAlerta };
}

// Actualizar estado de alerta
async function actualizarEstadoAlerta(idUsuario, idAlerta, data) {
  // Validar usuario
  if (!idUsuario) {
    throw new Error('Usuario no autenticado');
  }

  // Validar datos
  const validationResult = validateEstadoAlertaUpdate(data);
  if (validationResult.isError()) {
    throw new Error(validationResult.error);
  }

  // Obtener empresa del usuario
  const empresa = await alertasRepository.obtenerEmpresaPorUsuario(idUsuario);
  if (!empresa) {
    throw new Error('No existe una empresa asociada al usuario autenticado');
  }

  // Verificar que la alerta existe y pertenece a la empresa
  const alerta = await alertasRepository.obtenerAlertaPorId(idAlerta, empresa.id_empresa);
  if (!alerta) {
    throw new Error('La alerta no existe');
  }

  // Actualizar estado
  const alertaActualizada = await alertasRepository.actualizarEstadoAlerta(
    idAlerta,
    empresa.id_empresa,
    data.estadoAlerta
  );

  return {
    idAlerta: alertaActualizada.id_alerta,
    estadoAlerta: alertaActualizada.estado_alerta
  };
}

// Eliminar alerta (soft delete)
async function eliminarAlerta(idUsuario, idAlerta) {
  // Validar usuario
  if (!idUsuario) {
    throw new Error('Usuario no autenticado');
  }

  // Obtener empresa del usuario
  const empresa = await alertasRepository.obtenerEmpresaPorUsuario(idUsuario);
  if (!empresa) {
    throw new Error('No existe una empresa asociada al usuario autenticado');
  }

  // Verificar que la alerta existe y pertenece a la empresa
  const alerta = await alertasRepository.obtenerAlertaPorId(idAlerta, empresa.id_empresa);
  if (!alerta) {
    throw new Error('La alerta no existe');
  }

  // Eliminar (soft delete)
  await alertasRepository.eliminarLogico(idAlerta, empresa.id_empresa);
}

// Obtener resumen
async function obtenerResumen(idUsuario) {
  // Validar usuario
  if (!idUsuario) {
    throw new Error('Usuario no autenticado');
  }

  // Obtener empresa del usuario
  const empresa = await alertasRepository.obtenerEmpresaPorUsuario(idUsuario);
  if (!empresa) {
    throw new Error('No existe una empresa asociada al usuario autenticado');
  }

  // Obtener resumen
  return await alertasRepository.obtenerResumen(empresa.id_empresa);
}

module.exports = {
  listarAlertas,
  obtenerAlertaPorId,
  crearAlerta,
  actualizarAlerta,
  actualizarEstadoAlerta,
  eliminarAlerta,
  obtenerResumen
};
