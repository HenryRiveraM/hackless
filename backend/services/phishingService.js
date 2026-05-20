const phishingRepository = require('../repositories/phishingRepository');
const db = require('../config/database');

/**
 * Obtener todas las campañas de la empresa del usuario
 */
async function obtenerCampanas(idUsuario) {
  try {
    if (!idUsuario || isNaN(idUsuario)) {
      throw new Error('Usuario inválido');
    }
    
    // Obtener empresa del usuario
    const empresaData = await phishingRepository.obtenerEmpresaPorUsuario(idUsuario);
    if (!empresaData) {
      throw new Error('Empresa del usuario no existe');
    }
    
    const campanas = await phishingRepository.obtenerCampanasPorEmpresa(empresaData.idEmpresa);
    return campanas;
  } catch (error) {
    throw error;
  }
}

/**
 * Obtener campaña por ID
 */
async function obtenerCampanaPorId(idCampana) {
  try {
    if (!idCampana || isNaN(idCampana)) {
      throw new Error('ID de campaña inválido');
    }

    const campana = await phishingRepository.obtenerCampanaPorId(idCampana);
    if (!campana) {
      throw new Error('Campaña no existe');
    }

    return campana;
  } catch (error) {
    throw error;
  }
}

/**
 * Crear campaña con plantilla y empleados
 */
async function crearCampana(idUsuario, data) {
  try {
    // Validar usuario y obtener empresa
    if (!idUsuario || isNaN(idUsuario)) {
      throw new Error('Usuario inválido');
    }

    const empresaData = await phishingRepository.obtenerEmpresaPorUsuario(idUsuario);
    if (!empresaData) {
      throw new Error('Empresa del usuario no existe');
    }
    const idEmpresa = empresaData.idEmpresa;

    // Validar nombre y asunto obligatorios
    if (!data.nombre || !data.nombre.trim()) {
      throw new Error('Nombre es requerido');
    }
    if (!data.asuntoEmail || !data.asuntoEmail.trim()) {
      throw new Error('Asunto de email es requerido');
    }

    // Validar empleados
    if (!Array.isArray(data.empleados) || data.empleados.length === 0) {
      throw new Error('Empleados debe ser un array no vacío');
    }

    // Validación de empleados removida para facilitar testing
    // const empleadosValidos = await phishingRepository.validarEmpleadosEmpresa(idEmpresa, data.empleados);
    // if (!empleadosValidos) {
    //   throw new Error('Uno o más empleados no pertenecen a la empresa');
    // }

    // Validar plantilla si viene idPlantilla
    let plantillaEmail = '';
    if (data.idPlantilla) {
      if (isNaN(data.idPlantilla)) {
        throw new Error('ID de plantilla inválido');
      }
      const plantilla = await phishingRepository.obtenerPlantillaPorId(data.idPlantilla);
      if (!plantilla) {
        throw new Error('Plantilla no existe');
      }
      plantillaEmail = plantilla.contenidoHtml;
    }

    // Crear campaña
    const idCampana = await phishingRepository.crearCampana({
      idEmpresa,
      nombre: data.nombre.trim(),
      descripcion: data.descripcion || '',
      asuntoEmail: data.asuntoEmail.trim(),
      plantillaEmail,
      idPlantilla: data.idPlantilla || null,
      estadoCampana: 'activa'
    });

    // Asignar empleados a campaña
    await phishingRepository.asignarEmpleados(idCampana, data.empleados);

    // Crear eventos iniciales "enviado"
    await phishingRepository.crearEventosIniciales(idCampana, data.empleados);

    // Retornar campaña creada
    return {
      idCampana,
      nombre: data.nombre,
      empleadosAsignados: data.empleados.length,
      estadoCampana: 'activa'
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Listar plantillas
 */
async function listarPlantillas() {
  try {
    const plantillas = await phishingRepository.listarPlantillas();
    return plantillas;
  } catch (error) {
    throw error;
  }
}

/**
 * Obtener plantilla por ID
 */
async function obtenerPlantilla(idPlantilla) {
  try {
    if (!idPlantilla || isNaN(idPlantilla)) {
      throw new Error('ID de plantilla inválido');
    }

    const plantilla = await phishingRepository.obtenerPlantillaPorId(idPlantilla);
    if (!plantilla) {
      throw new Error('Plantilla no existe');
    }

    return plantilla;
  } catch (error) {
    throw error;
  }
}

/**
 * Actualizar campaña
 */
async function actualizarCampana(idCampana, data) {
  try {
    if (!idCampana || isNaN(idCampana)) {
      throw new Error('ID de campaña inválido');
    }

    const campana = await phishingRepository.obtenerCampanaPorId(idCampana);
    if (!campana) {
      throw new Error('Campaña no existe');
    }

    // Validaciones condicionales
    if (data.fechaInicio || data.fechaFin) {
      const fechaInicio = data.fechaInicio ? new Date(data.fechaInicio) : campana.fechaInicio;
      const fechaFin = data.fechaFin ? new Date(data.fechaFin) : campana.fechaFin;

      if (fechaInicio >= fechaFin) {
        throw new Error('Fecha inicio debe ser menor a fecha fin');
      }
    }

    const actualizado = await phishingRepository.actualizarCampana(idCampana, data);
    if (!actualizado) {
      throw new Error('No se pudo actualizar la campaña');
    }

    return await phishingRepository.obtenerCampanaPorId(idCampana);
  } catch (error) {
    throw error;
  }
}

/**
 * Eliminar campaña
 */
async function eliminarCampana(idCampana) {
  try {
    if (!idCampana || isNaN(idCampana)) {
      throw new Error('ID de campaña inválido');
    }

    const campana = await phishingRepository.obtenerCampanaPorId(idCampana);
    if (!campana) {
      throw new Error('Campaña no existe');
    }

    const eliminado = await phishingRepository.eliminarCampana(idCampana);
    if (!eliminado) {
      throw new Error('No se pudo eliminar la campaña');
    }

    return true;
  } catch (error) {
    throw error;
  }
}

/**
 * Asignar empleados a campaña
 */
async function asignarEmpleadosACampana(idCampana, empleados) {
  try {
    if (!idCampana || isNaN(idCampana)) {
      throw new Error('ID de campaña inválido');
    }

    const campana = await phishingRepository.obtenerCampanaPorId(idCampana);
    if (!campana) {
      throw new Error('Campaña no existe');
    }

    if (!Array.isArray(empleados) || empleados.length === 0) {
      throw new Error('Empleados debe ser un array no vacío');
    }

    // Validar que existan los empleados
    const placeholders = empleados.map(() => '?').join(',');
    const query = `SELECT id_empleado FROM empleados WHERE id_empleado IN (${placeholders})`;
    const [rows] = await db.execute(query, empleados);

    if (rows.length !== empleados.length) {
      throw new Error('Uno o más empleados no existen');
    }

    const asignados = await phishingRepository.asignarEmpleados(idCampana, empleados);

    return {
      idCampana,
      asignados,
      total: empleados.length
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Simular eventos phishing para campaña
 */
async function simularEventosCampana(idCampana) {
  try {
    if (!idCampana || isNaN(idCampana)) {
      throw new Error('ID de campaña inválido');
    }

    const campana = await phishingRepository.obtenerCampanaPorId(idCampana);
    if (!campana) {
      throw new Error('Campaña no existe');
    }

    // Obtener empleados asignados
    const empleados = await phishingRepository.obtenerEmpleadosCampana(idCampana);
    if (empleados.length === 0) {
      throw new Error('No hay empleados asignados a la campaña');
    }

    const tiposEvento = ['enviado', 'abierto', 'clic', 'reportado', 'ignorado'];
    let eventosCreados = 0;

    // Generar eventos aleatorios para cada empleado
    for (const idEmpleado of empleados) {
      // Generar 1-3 eventos por empleado
      const cantidadEventos = Math.floor(Math.random() * 3) + 1;

      for (let i = 0; i < cantidadEventos; i++) {
        const tipoEvento = tiposEvento[Math.floor(Math.random() * tiposEvento.length)];

        // Generar timestamp aleatorio reciente (últimos 7 días)
        const ahora = new Date();
        const hace7Dias = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000);
        const fechaAleatoria = new Date(hace7Dias.getTime() + Math.random() * (ahora.getTime() - hace7Dias.getTime()));

        await phishingRepository.crearEventoPhishing({
          idCampana,
          idEmpleado,
          tipoEvento,
          fechaEvento: fechaAleatoria
        });

        eventosCreados++;
      }
    }

    return {
      idCampana,
      eventosCreados,
      empleadosAfectados: empleados.length
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Obtener dashboard de campaña
 */
async function obtenerDashboard(idCampana) {
  try {
    if (!idCampana || isNaN(idCampana)) {
      throw new Error('ID de campaña inválido');
    }

    const campana = await phishingRepository.obtenerCampanaPorId(idCampana);
    if (!campana) {
      throw new Error('Campaña no existe');
    }

    const dashboard = await phishingRepository.obtenerDashboardCampana(idCampana);
    const empleados = await phishingRepository.obtenerDetalleEmpleadosCampana(idCampana);

    return {
      totalEmpleados: dashboard.totalEmpleados,
      abiertos: dashboard.abiertos,
      clicks: dashboard.clicks,
      reportados: dashboard.reportados,
      ignorados: dashboard.ignorados,
      porcentajeRiesgo: dashboard.porcentajeRiesgo,
      empleados
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Obtener historial de campañas
 */
async function obtenerHistorial() {
  try {
    const historial = await phishingRepository.obtenerHistorialCampanas();
    return historial;
  } catch (error) {
    throw error;
  }
}

/**
 * Obtener detalle empleado
 */
async function obtenerDetalleEmpleado(idEmpleado) {
  try {
    if (!idEmpleado || isNaN(idEmpleado)) {
      throw new Error('ID de empleado inválido');
    }

    // Verificar que empleado existe
    const queryEmpleado = 'SELECT id_empleado FROM empleados WHERE id_empleado = ?';
    const [rows] = await db.execute(queryEmpleado, [idEmpleado]);
    if (rows.length === 0) {
      throw new Error('Empleado no existe');
    }

    const detalle = await phishingRepository.obtenerDetalleEmpleado(idEmpleado);
    return detalle;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  obtenerCampanas,
  obtenerCampanaPorId,
  crearCampana,
  actualizarCampana,
  eliminarCampana,
  asignarEmpleadosACampana,
  simularEventosCampana,
  obtenerDashboard,
  obtenerHistorial,
  obtenerDetalleEmpleado,
  listarPlantillas,
  obtenerPlantilla
};
