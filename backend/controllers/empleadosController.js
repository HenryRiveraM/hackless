const empleadosService = require('../services/empleadosService');

async function listar(req, res) {
  try {
    const { idEmpresa, busqueda, departamento, estadoCapacitacion, page = 1, pageSize = 10 } = req.query;
    
    if (!idEmpresa) {
      return res.status(400).json({
        success: false,
        message: 'El parámetro idEmpresa es obligatorio'
      });
    }
    
    const resultado = await empleadosService.listarEmpleados({
      idEmpresa: parseInt(idEmpresa),
      busqueda,
      departamento,
      estadoCapacitacion,
      page,
      pageSize
    });
    
    res.status(200).json({
      success: true,
      message: 'Empleados obtenidos correctamente',
      data: resultado
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

async function obtenerPorId(req, res) {
  try {
    const { id } = req.params;
    
    const empleado = await empleadosService.obtenerEmpleadoPorId(parseInt(id));
    
    res.status(200).json({
      success: true,
      message: 'Empleado obtenido correctamente',
      data: empleado
    });
  } catch (error) {
    if (error.message === 'Empleado no encontrado') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

async function crear(req, res) {
  try {
    const data = req.body;
    
    const empleado = await empleadosService.crearEmpleado(data);
    
    res.status(201).json({
      success: true,
      message: 'Empleado registrado correctamente',
      data: empleado
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

async function actualizar(req, res) {
  try {
    const { id } = req.params;
    const data = req.body;
    
    const empleado = await empleadosService.actualizarEmpleado(parseInt(id), data);
    
    res.status(200).json({
      success: true,
      message: 'Empleado actualizado correctamente',
      data: empleado
    });
  } catch (error) {
    if (error.message === 'Empleado no encontrado') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

async function eliminar(req, res) {
  try {
    const { id } = req.params;
    
    await empleadosService.eliminarEmpleado(parseInt(id));
    
    res.status(200).json({
      success: true,
      message: 'Empleado eliminado correctamente'
    });
  } catch (error) {
    if (error.message === 'Empleado no encontrado') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

async function obtenerResumen(req, res) {
  try {
    const { idEmpresa } = req.query;
    
    if (!idEmpresa) {
      return res.status(400).json({
        success: false,
        message: 'El parámetro idEmpresa es obligatorio'
      });
    }
    
    const resumen = await empleadosService.obtenerResumen(parseInt(idEmpresa));
    
    res.status(200).json({
      success: true,
      message: 'Resumen obtenido correctamente',
      data: resumen
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

module.exports = {
  listar,
  obtenerPorId,
  crear,
  actualizar,
  eliminar,
  obtenerResumen
};
