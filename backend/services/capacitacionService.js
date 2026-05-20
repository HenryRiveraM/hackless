const capacitacionRepository = require('../repositories/capacitacionRepository');

/**
 * Validar progreso
 * @param {number} progreso
 * @returns {boolean}
 */
function validarProgreso(progreso) {
  return typeof progreso === 'number' && progreso >= 0 && progreso <= 100;
}

/**
 * Validar puntaje
 * @param {number} puntaje
 * @returns {boolean}
 */
function validarPuntaje(puntaje) {
  return typeof puntaje === 'number' && puntaje >= 0 && puntaje <= 100;
}

/**
 * Obtener dashboard del empleado
 * @param {number} idUsuario
 * @returns {Promise<Object>}
 */
async function obtenerDashboard(idUsuario) {
  try {
    // Validar usuario
    const usuario = await capacitacionRepository.obtenerUsuarioPorId(idUsuario);
    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }

    // Obtener empresa
    const empresa = await capacitacionRepository.obtenerEmpresaPorUsuario(idUsuario);
    if (!empresa) {
      throw new Error('No existe una empresa asociada al usuario autenticado');
    }

    // Obtener empleado
    const empleado = await capacitacionRepository.obtenerEmpleadoPorUsuarioEmail(empresa.idEmpresa, usuario.email);
    if (!empleado) {
      throw new Error('No existe un empleado asociado al usuario autenticado');
    }

    // Obtener datos del dashboard
    const resumen = await capacitacionRepository.obtenerResumenProgreso(empleado.idEmpleado);
    const siguienteLeccion = await capacitacionRepository.obtenerSiguienteLeccion(empleado.idEmpleado);
    const calificaciones = await capacitacionRepository.obtenerCalificaciones(empleado.idEmpleado);
    const ultimaInsignia = await capacitacionRepository.obtenerUltimaInsignia(empleado.idEmpleado);
    const ranking = await capacitacionRepository.calcularRankingEmpresa(empresa.idEmpresa, empleado.idEmpleado);

    return {
      nombre: empleado.nombre,
      progresoGeneral: resumen?.progresoGeneral || 0,
      leccionesCompletadas: resumen?.leccionesCompletadas || 0,
      totalLecciones: resumen?.totalLecciones || 0,
      siguienteLeccion: siguienteLeccion || null,
      calificaciones: calificaciones,
      ultimaInsignia: ultimaInsignia || null,
      rankingEmpresa: ranking
    };
  } catch (error) {
    throw new Error(error.message);
  }
}

/**
 * Listar lecciones disponibles
 * @param {number} idUsuario
 * @returns {Promise<Array>}
 */
async function listarLecciones(idUsuario) {
  try {
    // Validar usuario
    const usuario = await capacitacionRepository.obtenerUsuarioPorId(idUsuario);
    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }

    // Obtener empresa
    const empresa = await capacitacionRepository.obtenerEmpresaPorUsuario(idUsuario);
    if (!empresa) {
      throw new Error('No existe una empresa asociada al usuario autenticado');
    }

    // Obtener empleado
    const empleado = await capacitacionRepository.obtenerEmpleadoPorUsuarioEmail(empresa.idEmpresa, usuario.email);
    if (!empleado) {
      throw new Error('No existe un empleado asociado al usuario autenticado');
    }

    // Listar lecciones
    return await capacitacionRepository.listarLecciones(empleado.idEmpleado);
  } catch (error) {
    throw new Error(error.message);
  }
}

/**
 * Listar lecciones completadas
 * @param {number} idUsuario
 * @returns {Promise<Array>}
 */
async function listarCompletadas(idUsuario) {
  try {
    // Validar usuario
    const usuario = await capacitacionRepository.obtenerUsuarioPorId(idUsuario);
    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }

    // Obtener empresa
    const empresa = await capacitacionRepository.obtenerEmpresaPorUsuario(idUsuario);
    if (!empresa) {
      throw new Error('No existe una empresa asociada al usuario autenticado');
    }

    // Obtener empleado
    const empleado = await capacitacionRepository.obtenerEmpleadoPorUsuarioEmail(empresa.idEmpresa, usuario.email);
    if (!empleado) {
      throw new Error('No existe un empleado asociado al usuario autenticado');
    }

    // Listar completadas
    return await capacitacionRepository.listarLeccionesCompletadas(empleado.idEmpleado);
  } catch (error) {
    throw new Error(error.message);
  }
}

/**
 * Iniciar lección
 * @param {number} idUsuario
 * @param {number} idLeccion
 * @returns {Promise<Object>}
 */
async function iniciarLeccion(idUsuario, idLeccion) {
  try {
    // Validar usuario
    const usuario = await capacitacionRepository.obtenerUsuarioPorId(idUsuario);
    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }

    // Obtener empresa
    const empresa = await capacitacionRepository.obtenerEmpresaPorUsuario(idUsuario);
    if (!empresa) {
      throw new Error('No existe una empresa asociada al usuario autenticado');
    }

    // Obtener empleado
    const empleado = await capacitacionRepository.obtenerEmpleadoPorUsuarioEmail(empresa.idEmpresa, usuario.email);
    if (!empleado) {
      throw new Error('No existe un empleado asociado al usuario autenticado');
    }

    // Validar idLeccion
    if (!idLeccion || isNaN(idLeccion)) {
      throw new Error('ID de lección inválido');
    }

    // Verificar que la lección existe
    const leccion = await capacitacionRepository.listarLecciones(empleado.idEmpleado);
    const leccionExiste = leccion.some(l => l.idLeccion === parseInt(idLeccion));
    if (!leccionExiste) {
      throw new Error('La lección no existe');
    }

    // Iniciar lección
    await capacitacionRepository.iniciarLeccion(empleado.idEmpleado, idLeccion);

    // Retornar el registro
    return await capacitacionRepository.obtenerEmpleadoLeccion(empleado.idEmpleado, idLeccion);
  } catch (error) {
    throw new Error(error.message);
  }
}

/**
 * Actualizar progreso de lección
 * @param {number} idUsuario
 * @param {number} idLeccion
 * @param {Object} data - { progreso, puntaje }
 * @returns {Promise<Object>}
 */
async function actualizarProgreso(idUsuario, idLeccion, data) {
  try {
    // Validar usuario
    const usuario = await capacitacionRepository.obtenerUsuarioPorId(idUsuario);
    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }

    // Obtener empresa
    const empresa = await capacitacionRepository.obtenerEmpresaPorUsuario(idUsuario);
    if (!empresa) {
      throw new Error('No existe una empresa asociada al usuario autenticado');
    }

    // Obtener empleado
    const empleado = await capacitacionRepository.obtenerEmpleadoPorUsuarioEmail(empresa.idEmpresa, usuario.email);
    if (!empleado) {
      throw new Error('No existe un empleado asociado al usuario autenticado');
    }

    // Validar idLeccion
    if (!idLeccion || isNaN(idLeccion)) {
      throw new Error('ID de lección inválido');
    }

    // Validar progreso
    if (!data.progreso || !validarProgreso(data.progreso)) {
      throw new Error('El progreso debe estar entre 0 y 100');
    }

    // Validar puntaje si viene
    if (data.puntaje !== undefined && data.puntaje !== null && !validarPuntaje(data.puntaje)) {
      throw new Error('El puntaje debe estar entre 0 y 100');
    }

    // Verificar que el empleado_lecciones existe, si no crear
    let empleadoLeccion = await capacitacionRepository.obtenerEmpleadoLeccion(empleado.idEmpleado, idLeccion);
    
    if (!empleadoLeccion) {
      // Crear registro si no existe
      await capacitacionRepository.iniciarLeccion(empleado.idEmpleado, idLeccion);
      empleadoLeccion = await capacitacionRepository.obtenerEmpleadoLeccion(empleado.idEmpleado, idLeccion);
    }

    // Actualizar progreso
    const resultado = await capacitacionRepository.actualizarProgreso(empleado.idEmpleado, idLeccion, data);

    if (!resultado.success) {
      throw new Error('No se pudo actualizar el progreso');
    }

    // Retornar el registro actualizado
    return await capacitacionRepository.obtenerEmpleadoLeccion(empleado.idEmpleado, idLeccion);
  } catch (error) {
    throw new Error(error.message);
  }
}

/**
 * Obtener contenido de lección
 * @param {number} idUsuario
 * @param {number} idLeccion
 * @returns {Promise<Object>}
 */
async function obtenerContenidoLeccion(idUsuario, idLeccion) {
  try {
    // Validar usuario
    const usuario = await capacitacionRepository.obtenerUsuarioPorId(idUsuario);
    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }

    // Obtener empresa
    const empresa = await capacitacionRepository.obtenerEmpresaPorUsuario(idUsuario);
    if (!empresa) {
      throw new Error('No existe una empresa asociada al usuario autenticado');
    }

    // Obtener empleado
    const empleado = await capacitacionRepository.obtenerEmpleadoPorUsuarioEmail(empresa.idEmpresa, usuario.email);
    if (!empleado) {
      throw new Error('No existe un empleado asociado al usuario autenticado');
    }

    // Validar idLeccion
    if (!idLeccion || isNaN(idLeccion)) {
      throw new Error('ID de lección inválido');
    }

    // Obtener lección
    const leccion = await capacitacionRepository.obtenerLeccionPorId(idLeccion);
    if (!leccion) {
      throw new Error('La lección no existe');
    }

    // Obtener contenido
    const contenido = await capacitacionRepository.obtenerContenidoLeccion(idLeccion);
    if (!contenido || contenido.length === 0) {
      throw new Error('Contenido no encontrado para esta lección');
    }

    // Obtener progreso del empleado
    const empleadoLeccion = await capacitacionRepository.obtenerEmpleadoLeccion(empleado.idEmpleado, idLeccion);

    return {
      idLeccion: leccion.idLeccion,
      titulo: leccion.titulo,
      descripcion: leccion.descripcion,
      imagenUrl: leccion.imagenUrl || null,
      duracionMinutos: leccion.duracionMinutos,
      dificultad: leccion.dificultad,
      progreso: empleadoLeccion?.progreso || 0,
      completado: empleadoLeccion?.completado || false,
      puntaje: empleadoLeccion?.puntaje || 0,
      contenido: contenido
    };
  } catch (error) {
    throw new Error(error.message);
  }
}

/**
 * Obtener quiz de lección
 * @param {number} idUsuario
 * @param {number} idLeccion
 * @returns {Promise<Object>}
 */
async function obtenerQuizLeccion(idUsuario, idLeccion) {
  try {
    // Validar usuario
    const usuario = await capacitacionRepository.obtenerUsuarioPorId(idUsuario);
    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }

    // Obtener empresa
    const empresa = await capacitacionRepository.obtenerEmpresaPorUsuario(idUsuario);
    if (!empresa) {
      throw new Error('No existe una empresa asociada al usuario autenticado');
    }

    // Obtener empleado
    const empleado = await capacitacionRepository.obtenerEmpleadoPorUsuarioEmail(empresa.idEmpresa, usuario.email);
    if (!empleado) {
      throw new Error('No existe un empleado asociado al usuario autenticado');
    }

    // Validar idLeccion
    if (!idLeccion || isNaN(idLeccion)) {
      throw new Error('ID de lección inválido');
    }

    // Obtener quiz
    const quiz = await capacitacionRepository.obtenerQuizPorLeccion(idLeccion);
    if (!quiz) {
      throw new Error('El quiz no existe');
    }

    // Obtener preguntas sin respuesta correcta
    const preguntas = await capacitacionRepository.obtenerPreguntasQuiz(quiz.idQuiz, false);
    if (!preguntas || preguntas.length === 0) {
      throw new Error('No hay preguntas disponibles para este quiz');
    }

    return {
      idQuiz: quiz.idQuiz,
      idLeccion: quiz.idLeccion,
      titulo: quiz.titulo,
      puntajeAprobacion: quiz.puntajeAprobacion,
      totalPreguntas: quiz.totalPreguntas,
      preguntas: preguntas
    };
  } catch (error) {
    throw new Error(error.message);
  }
}

/**
 * Responder quiz
 * @param {number} idUsuario
 * @param {number} idQuiz
 * @param {Array} respuestas
 * @returns {Promise<Object>}
 */
async function responderQuiz(idUsuario, idQuiz, respuestas) {
  try {
    // Validar usuario
    const usuario = await capacitacionRepository.obtenerUsuarioPorId(idUsuario);
    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }

    // Obtener empresa
    const empresa = await capacitacionRepository.obtenerEmpresaPorUsuario(idUsuario);
    if (!empresa) {
      throw new Error('No existe una empresa asociada al usuario autenticado');
    }

    // Obtener empleado
    const empleado = await capacitacionRepository.obtenerEmpleadoPorUsuarioEmail(empresa.idEmpresa, usuario.email);
    if (!empleado) {
      throw new Error('No existe un empleado asociado al usuario autenticado');
    }

    // Validar quiz
    if (!idQuiz || isNaN(idQuiz)) {
      throw new Error('ID de quiz inválido');
    }

    const quiz = await capacitacionRepository.obtenerQuizPorId(idQuiz);
    if (!quiz) {
      throw new Error('El quiz no existe');
    }

    // Validar respuestas
    if (!Array.isArray(respuestas) || respuestas.length === 0) {
      throw new Error('Debe enviar respuestas válidas');
    }

    // Validar formato de respuestas
    for (const resp of respuestas) {
      if (!resp.idPregunta || !resp.respuesta) {
        throw new Error('Cada respuesta debe tener idPregunta y respuesta');
      }
      if (!['A', 'B', 'C', 'D'].includes(resp.respuesta)) {
        throw new Error('La respuesta debe ser A, B, C o D');
      }
    }

    // Obtener preguntas con respuesta correcta
    const preguntas = await capacitacionRepository.obtenerPreguntasQuiz(idQuiz, true);
    if (!preguntas || preguntas.length === 0) {
      throw new Error('No hay preguntas para este quiz');
    }

    // Calcular puntaje
    let respuestasCorrectas = 0;
    const detalle = [];

    for (const resp of respuestas) {
      const pregunta = preguntas.find(p => p.idPregunta === resp.idPregunta);
      if (!pregunta) {
        continue; // Saltar si la pregunta no existe
      }

      const esCorrecta = pregunta.respuestaCorrecta === resp.respuesta;
      if (esCorrecta) {
        respuestasCorrectas++;
      }

      detalle.push({
        idPregunta: resp.idPregunta,
        respuestaUsuario: resp.respuesta,
        correcta: esCorrecta,
        respuestaCorrecta: pregunta.respuestaCorrecta,
        explicacion: pregunta.explicacion
      });
    }

    // Calcular puntaje sobre 100
    const puntaje = preguntas.length > 0 
      ? Math.round((respuestasCorrectas / preguntas.length) * 100)
      : 0;

    // Determinar si aprobó
    const aprobado = puntaje >= quiz.puntajeAprobacion;

    // Guardar resultado
    const resultadoGuardado = await capacitacionRepository.guardarResultadoQuiz(empleado.idEmpleado, idQuiz, {
      puntaje,
      aprobado,
      detalle
    });

    // Guardar cada respuesta individual
    for (const detalleItem of detalle) {
      await capacitacionRepository.guardarRespuestaQuiz(resultadoGuardado.idResultado, {
        idPregunta: detalleItem.idPregunta,
        respuestaUsuario: detalleItem.respuestaUsuario,
        correcta: detalleItem.correcta
      });
    }

    // Si aprobó, marcar lección como completada
    if (aprobado) {
      await capacitacionRepository.marcarLeccionCompletada(empleado.idEmpleado, quiz.idLeccion, puntaje);
      
      // Crear insignia opcional
      await capacitacionRepository.crearInsigniaSiNoExiste(
        empleado.idEmpleado,
        `Lección Completada: ${quiz.titulo}`,
        `Completaste la lección con ${puntaje}%`
      );
    }

    return {
      idQuiz,
      puntaje,
      aprobado,
      puntajeAprobacion: quiz.puntajeAprobacion,
      detalle
    };
  } catch (error) {
    throw new Error(error.message);
  }
}

/**
 * Obtener resultado de quiz
 * @param {number} idUsuario
 * @param {number} idQuiz
 * @returns {Promise<Object>}
 */
async function obtenerResultadoQuiz(idUsuario, idQuiz) {
  try {
    // Validar usuario
    const usuario = await capacitacionRepository.obtenerUsuarioPorId(idUsuario);
    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }

    // Obtener empresa
    const empresa = await capacitacionRepository.obtenerEmpresaPorUsuario(idUsuario);
    if (!empresa) {
      throw new Error('No existe una empresa asociada al usuario autenticado');
    }

    // Obtener empleado
    const empleado = await capacitacionRepository.obtenerEmpleadoPorUsuarioEmail(empresa.idEmpresa, usuario.email);
    if (!empleado) {
      throw new Error('No existe un empleado asociado al usuario autenticado');
    }

    // Validar quiz
    if (!idQuiz || isNaN(idQuiz)) {
      throw new Error('ID de quiz inválido');
    }

    // Obtener último resultado
    const resultado = await capacitacionRepository.obtenerUltimoResultadoQuiz(empleado.idEmpleado, idQuiz);
    if (!resultado) {
      throw new Error('No existe un resultado para este quiz');
    }

    // Obtener respuestas individuales
    const respuestas = await capacitacionRepository.obtenerRespuestasResultado(resultado.idResultado);

    return {
      idResultado: resultado.idResultado,
      idQuiz: resultado.idQuiz,
      puntaje: resultado.puntaje,
      aprobado: resultado.aprobado,
      fechaRespuesta: resultado.fechaRespuesta,
      respuestas: respuestas
    };
  } catch (error) {
    throw new Error(error.message);
  }
}

module.exports = {
  obtenerDashboard,
  listarLecciones,
  listarCompletadas,
  iniciarLeccion,
  actualizarProgreso,
  obtenerContenidoLeccion,
  obtenerQuizLeccion,
  responderQuiz,
  obtenerResultadoQuiz
};
