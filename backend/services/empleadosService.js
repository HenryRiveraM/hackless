const empleadosRepository = require('../repositories/empleadosRepository');
const {
  validateEmpleadoCreation,
  validateEmpleadoUpdate,
  ESTADOS_CAPACITACION
} = require('../validators/empleadosValidators');

function validarEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

async function listarEmpleados({ idEmpresa, busqueda, departamento, estadoCapacitacion, page = 1, pageSize = 10 }) {
  // Validar que idEmpresa existe
  const empresaExiste = await empleadosRepository.existeEmpresa(idEmpresa);
  if (!empresaExiste) {
    throw new Error('La empresa no existe');
  }
  
  // Obtener empleados
  const items = await empleadosRepository.obtenerPorEmpresa({
    idEmpresa,
    busqueda,
    departamento,
    estadoCapacitacion,
    page: parseInt(page),
    pageSize: parseInt(pageSize)
  });
  
  // Obtener total
  const total = await empleadosRepository.contarPorEmpresa({
    idEmpresa,
    busqueda,
    departamento,
    estadoCapacitacion
  });
  
  // Formatear respuesta
  const empleados = items.map(emp => ({
    idEmpleado: emp.idEmpleado,
    idEmpresa: emp.idEmpresa,
    nombre: emp.nombre,
    email: emp.email,
    departamento: emp.departamento,
    puntajeSeguridad: emp.puntajeSeguridad,
    estadoCapacitacion: emp.estadoCapacitacion,
    estado: emp.estado === 1,
    fechaRegistro: emp.fechaRegistro
  }));
  
  return {
    items: empleados,
    total,
    page: parseInt(page),
    pageSize: parseInt(pageSize)
  };
}

async function obtenerEmpleadoPorId(idEmpleado) {
  const empleado = await empleadosRepository.obtenerPorId(idEmpleado);
  
  if (!empleado) {
    throw new Error('Empleado no encontrado');
  }
  
  return {
    idEmpleado: empleado.idEmpleado,
    idEmpresa: empleado.idEmpresa,
    nombre: empleado.nombre,
    email: empleado.email,
    departamento: empleado.departamento,
    puntajeSeguridad: empleado.puntajeSeguridad,
    estadoCapacitacion: empleado.estadoCapacitacion,
    estado: empleado.estado === 1,
    fechaRegistro: empleado.fechaRegistro
  };
}

async function crearEmpleado(data) {
  // Validar datos
  const validationResult = validateEmpleadoCreation(data);
  if (validationResult.isError()) {
    throw new Error(validationResult.error);
  }
  
  // Validar empresa existe
  const empresaExiste = await empleadosRepository.existeEmpresa(data.idEmpresa);
  if (!empresaExiste) {
    throw new Error('La empresa no existe');
  }
  
  // Validar email único por empresa
  const emailExiste = await empleadosRepository.existeEmailEnEmpresa({
    idEmpresa: data.idEmpresa,
    email: data.email
  });
  if (emailExiste) {
    throw new Error('El email ya está registrado en esta empresa');
  }
  
  const empleado = await empleadosRepository.crear(data);
  
  return {
    idEmpleado: empleado.idEmpleado,
    idEmpresa: empleado.idEmpresa,
    nombre: empleado.nombre,
    email: empleado.email,
    departamento: empleado.departamento,
    puntajeSeguridad: empleado.puntajeSeguridad,
    estadoCapacitacion: empleado.estadoCapacitacion
  };
}

async function actualizarEmpleado(idEmpleado, data) {
  // Validar datos
  const validationResult = validateEmpleadoUpdate(data);
  if (validationResult.isError()) {
    throw new Error(validationResult.error);
  }
  
  // Verificar que empleado existe
  const empleado = await empleadosRepository.obtenerPorId(idEmpleado);
  if (!empleado) {
    throw new Error('Empleado no encontrado');
  }
  
  // Validar email único (si se proporciona)
  if (data.email) {
    const emailExiste = await empleadosRepository.existeEmailEnEmpresa({
      idEmpresa: empleado.idEmpresa,
      email: data.email,
      idEmpleadoExcluir: idEmpleado
    });
    if (emailExiste) {
      throw new Error('El email ya está registrado en esta empresa');
    }
  }
  
  const empleadoActualizado = await empleadosRepository.actualizar(idEmpleado, data);
  
  return {
    idEmpleado: empleadoActualizado.idEmpleado,
    idEmpresa: empleadoActualizado.idEmpresa,
    nombre: empleadoActualizado.nombre,
    email: empleadoActualizado.email,
    departamento: empleadoActualizado.departamento,
    puntajeSeguridad: empleadoActualizado.puntajeSeguridad,
    estadoCapacitacion: empleadoActualizado.estadoCapacitacion
  };
}

async function eliminarEmpleado(idEmpleado) {
  // Verificar que empleado existe
  const empleado = await empleadosRepository.obtenerPorId(idEmpleado);
  if (!empleado) {
    throw new Error('Empleado no encontrado');
  }
  
  await empleadosRepository.eliminarLogico(idEmpleado);
}

async function obtenerResumen(idEmpresa) {
  // Validar que empresa existe
  const empresaExiste = await empleadosRepository.existeEmpresa(idEmpresa);
  if (!empresaExiste) {
    throw new Error('La empresa no existe');
  }
  
  const datos = await empleadosRepository.obtenerResumen(idEmpresa);
  
  const totalEmpleados = datos.totalEmpleados || 0;
  const puntajePromedio = datos.puntajePromedio || 0;
  const completados = datos.completados || 0;
  
  let capacitacionCompletadaPorcentaje = 0;
  if (totalEmpleados > 0) {
    capacitacionCompletadaPorcentaje = Math.round((completados / totalEmpleados) * 100);
  }
  
  return {
    totalEmpleados,
    puntajePromedio: parseFloat(puntajePromedio),
    capacitacionCompletadaPorcentaje
  };
}

module.exports = {
  listarEmpleados,
  obtenerEmpleadoPorId,
  crearEmpleado,
  actualizarEmpleado,
  eliminarEmpleado,
  obtenerResumen
};
