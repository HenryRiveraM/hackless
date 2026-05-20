const db = require('../config/database');

/**
 * Obtener empresa asociada al usuario
 * @param {number} idUsuario
 * @returns {Promise<Object>}
 */
async function obtenerEmpresaPorUsuario(idUsuario) {
  try {
    const query = `
      SELECT e.id_empresa, e.nombre_empresa
      FROM empresas e
      INNER JOIN usuarios u ON u.id_empresa = e.id_empresa
      WHERE u.id_usuario = ? AND e.estado = 1
      LIMIT 1
    `;
    const [rows] = await db.execute(query, [idUsuario]);
    if (rows.length === 0) return null;
    
    const row = rows[0];
    return {
      idEmpresa: row.id_empresa,
      nombreEmpresa: row.nombre_empresa
    };
  } catch (error) {
    throw new Error(`Error obteniendo empresa: ${error.message}`);
  }
}

/**
 * Obtener usuario por ID
 * @param {number} idUsuario
 * @returns {Promise<Object>}
 */
async function obtenerUsuarioPorId(idUsuario) {
  try {
    const query = `
      SELECT id_usuario, email, id_empresa
      FROM usuarios
      WHERE id_usuario = ?
      LIMIT 1
    `;
    const [rows] = await db.execute(query, [idUsuario]);
    if (rows.length === 0) return null;
    
    const row = rows[0];
    return {
      idUsuario: row.id_usuario,
      email: row.email,
      idEmpresa: row.id_empresa
    };
  } catch (error) {
    throw new Error(`Error obteniendo usuario: ${error.message}`);
  }
}

/**
 * Obtener empleado por email y empresa
 * @param {number} idEmpresa
 * @param {string} email
 * @returns {Promise<Object>}
 */
async function obtenerEmpleadoPorUsuarioEmail(idEmpresa, email) {
  try {
    const query = `
      SELECT id_empleado, nombre, email, id_empresa
      FROM empleados
      WHERE id_empresa = ? AND email = ? AND estado = 1
      LIMIT 1
    `;
    const [rows] = await db.execute(query, [idEmpresa, email]);
    if (rows.length === 0) return null;
    
    const row = rows[0];
    return {
      idEmpleado: row.id_empleado,
      nombre: row.nombre,
      email: row.email,
      idEmpresa: row.id_empresa
    };
  } catch (error) {
    throw new Error(`Error obteniendo empleado: ${error.message}`);
  }
}

/**
 * Obtener resumen de progreso del empleado
 * @param {number} idEmpleado
 * @returns {Promise<Object>}
 */
async function obtenerResumenProgreso(idEmpleado) {
  try {
    const query = `
      SELECT 
        COUNT(*) as totalLecciones,
        SUM(CASE WHEN completado = 1 THEN 1 ELSE 0 END) as leccionesCompletadas,
        ROUND(AVG(CASE WHEN completado = 1 THEN 100 ELSE progreso END)) as progresoGeneral
      FROM empleado_lecciones
      WHERE id_empleado = ?
    `;
    const [rows] = await db.execute(query, [idEmpleado]);
    
    if (rows.length === 0) return null;
    
    const row = rows[0];
    return {
      totalLecciones: row.totalLecciones || 0,
      leccionesCompletadas: row.leccionesCompletadas || 0,
      progresoGeneral: row.progresoGeneral || 0
    };
  } catch (error) {
    throw new Error(`Error obteniendo resumen: ${error.message}`);
  }
}

/**
 * Obtener siguiente lección no completada
 * @param {number} idEmpleado
 * @returns {Promise<Object>}
 */
async function obtenerSiguienteLeccion(idEmpleado) {
  try {
    const query = `
      SELECT 
        l.id_leccion,
        l.titulo,
        l.descripcion,
        l.duracion_minutos,
        l.imagen_url,
        COALESCE(el.progreso, 0) as progreso,
        COALESCE(el.completado, 0) as completado
      FROM lecciones l
      LEFT JOIN empleado_lecciones el ON l.id_leccion = el.id_leccion AND el.id_empleado = ?
      WHERE l.estado = 1
      ORDER BY CASE 
        WHEN COALESCE(el.completado, 0) = 0 THEN 0
        ELSE 1
      END ASC,
      l.id_leccion ASC
      LIMIT 1
    `;
    const [rows] = await db.execute(query, [idEmpleado]);
    if (rows.length === 0) return null;
    
    const row = rows[0];
    return {
      idLeccion: row.id_leccion,
      titulo: row.titulo,
      descripcion: row.descripcion,
      duracionMinutos: row.duracion_minutos,
      imagenUrl: row.imagen_url
    };
  } catch (error) {
    throw new Error(`Error obteniendo siguiente lección: ${error.message}`);
  }
}

/**
 * Listar todas las lecciones con progreso del empleado
 * @param {number} idEmpleado
 * @returns {Promise<Array>}
 */
async function listarLecciones(idEmpleado) {
  try {
    const query = `
      SELECT 
        l.id_leccion,
        l.titulo,
        l.descripcion,
        l.modulo,
        l.duracion_minutos,
        COALESCE(el.progreso, 0) as progreso,
        COALESCE(el.completado, 0) as completado,
        COALESCE(el.puntaje, 0) as puntaje
      FROM lecciones l
      LEFT JOIN empleado_lecciones el ON l.id_leccion = el.id_leccion AND el.id_empleado = ?
      WHERE l.estado = 1
      ORDER BY l.id_leccion ASC
    `;
    const [rows] = await db.execute(query, [idEmpleado]);
    
    return rows.map(row => ({
      idLeccion: row.id_leccion,
      titulo: row.titulo,
      descripcion: row.descripcion,
      modulo: row.modulo,
      duracionMinutos: row.duracion_minutos,
      progreso: row.progreso,
      completado: row.completado === 1,
      puntaje: row.puntaje
    }));
  } catch (error) {
    throw new Error(`Error listando lecciones: ${error.message}`);
  }
}

/**
 * Listar lecciones completadas del empleado
 * @param {number} idEmpleado
 * @returns {Promise<Array>}
 */
async function listarLeccionesCompletadas(idEmpleado) {
  try {
    const query = `
      SELECT 
        l.id_leccion,
        l.titulo,
        l.descripcion,
        l.modulo,
        l.duracion_minutos,
        el.progreso,
        el.completado,
        el.puntaje,
        el.fecha_completado
      FROM lecciones l
      INNER JOIN empleado_lecciones el ON l.id_leccion = el.id_leccion AND el.id_empleado = ?
      WHERE l.estado = 1 AND el.completado = 1
      ORDER BY el.fecha_completado DESC
    `;
    const [rows] = await db.execute(query, [idEmpleado]);
    
    return rows.map(row => ({
      idLeccion: row.id_leccion,
      titulo: row.titulo,
      descripcion: row.descripcion,
      modulo: row.modulo,
      duracionMinutos: row.duracion_minutos,
      progreso: row.progreso,
      completado: row.completado === 1,
      puntaje: row.puntaje,
      fechaCompletado: row.fecha_completado
    }));
  } catch (error) {
    throw new Error(`Error listando lecciones completadas: ${error.message}`);
  }
}

/**
 * Obtener calificaciones por categoría
 * @param {number} idEmpleado
 * @returns {Promise<Array>}
 */
async function obtenerCalificaciones(idEmpleado) {
  try {
    const query = `
      SELECT 
        categoria,
        puntaje
      FROM empleado_calificaciones
      WHERE id_empleado = ? AND estado = 1
      ORDER BY puntaje DESC
    `;
    const [rows] = await db.execute(query, [idEmpleado]);
    
    return rows.map(row => ({
      categoria: row.categoria,
      puntaje: row.puntaje
    }));
  } catch (error) {
    throw new Error(`Error obteniendo calificaciones: ${error.message}`);
  }
}

/**
 * Obtener última insignia obtenida
 * @param {number} idEmpleado
 * @returns {Promise<Object>}
 */
async function obtenerUltimaInsignia(idEmpleado) {
  try {
    const query = `
      SELECT 
        nombre,
        fecha_obtenida
      FROM empleado_insignias
      WHERE id_empleado = ? AND estado = 1
      ORDER BY fecha_obtenida DESC
      LIMIT 1
    `;
    const [rows] = await db.execute(query, [idEmpleado]);
    if (rows.length === 0) return null;
    
    const row = rows[0];
    return {
      nombre: row.nombre,
      fechaObtenida: row.fecha_obtenida
    };
  } catch (error) {
    throw new Error(`Error obteniendo última insignia: ${error.message}`);
  }
}

/**
 * Obtener registro de empleado-lección
 * @param {number} idEmpleado
 * @param {number} idLeccion
 * @returns {Promise<Object>}
 */
async function obtenerEmpleadoLeccion(idEmpleado, idLeccion) {
  try {
    const query = `
      SELECT 
        id_empleado_leccion,
        id_empleado,
        id_leccion,
        progreso,
        completado,
        puntaje,
        fecha_inicio,
        fecha_completado
      FROM empleado_lecciones
      WHERE id_empleado = ? AND id_leccion = ?
      LIMIT 1
    `;
    const [rows] = await db.execute(query, [idEmpleado, idLeccion]);
    if (rows.length === 0) return null;
    
    const row = rows[0];
    return {
      idEmpleadoLeccion: row.id_empleado_leccion,
      idEmpleado: row.id_empleado,
      idLeccion: row.id_leccion,
      progreso: row.progreso,
      completado: row.completado === 1,
      puntaje: row.puntaje,
      fechaInicio: row.fecha_inicio,
      fechaCompletado: row.fecha_completado
    };
  } catch (error) {
    throw new Error(`Error obteniendo empleado-lección: ${error.message}`);
  }
}

/**
 * Iniciar lección para empleado
 * @param {number} idEmpleado
 * @param {number} idLeccion
 * @returns {Promise<number>}
 */
async function iniciarLeccion(idEmpleado, idLeccion) {
  try {
    const query = `
      INSERT INTO empleado_lecciones (
        id_empleado,
        id_leccion,
        progreso,
        completado,
        puntaje,
        fecha_inicio
      ) VALUES (?, ?, 0, 0, 0, NOW())
      ON DUPLICATE KEY UPDATE
        fecha_inicio = IF(fecha_inicio IS NULL, NOW(), fecha_inicio)
    `;
    const [result] = await db.execute(query, [idEmpleado, idLeccion]);
    
    // Obtener el ID del registro (puede ser insert o update)
    const leccion = await obtenerEmpleadoLeccion(idEmpleado, idLeccion);
    return leccion.idEmpleadoLeccion;
  } catch (error) {
    throw new Error(`Error iniciando lección: ${error.message}`);
  }
}

/**
 * Actualizar progreso de lección
 * @param {number} idEmpleado
 * @param {number} idLeccion
 * @param {Object} data - { progreso, puntaje }
 * @returns {Promise<Object>}
 */
async function actualizarProgreso(idEmpleado, idLeccion, data) {
  try {
    let query = `
      UPDATE empleado_lecciones
      SET progreso = ?
    `;
    const params = [data.progreso];

    if (data.puntaje !== undefined && data.puntaje !== null) {
      query += `, puntaje = ?`;
      params.push(data.puntaje);
    }

    if (data.progreso >= 100) {
      query += `, completado = 1, fecha_completado = NOW()`;
    }

    query += ` WHERE id_empleado = ? AND id_leccion = ?`;
    params.push(idEmpleado, idLeccion);

    const [result] = await db.execute(query, params);

    return {
      affectedRows: result.affectedRows,
      success: result.affectedRows > 0
    };
  } catch (error) {
    throw new Error(`Error actualizando progreso: ${error.message}`);
  }
}

/**
 * Calcular ranking de empresa
 * @param {number} idEmpresa
 * @param {number} idEmpleado
 * @returns {Promise<string>}
 */
async function calcularRankingEmpresa(idEmpresa, idEmpleado) {
  try {
    // Calcular promedio de progreso de todos los empleados
    const query = `
      SELECT 
        COUNT(DISTINCT e.id_empleado) as totalEmpleados,
        SUM(CASE WHEN COALESCE(el.progresoGeneral, 0) > ? THEN 1 ELSE 0 END) as empleadosMayorProgreso
      FROM empleados e
      LEFT JOIN (
        SELECT 
          id_empleado,
          ROUND(AVG(CASE WHEN completado = 1 THEN 100 ELSE progreso END)) as progresoGeneral
        FROM empleado_lecciones
        GROUP BY id_empleado
      ) el ON e.id_empleado = el.id_empleado
      WHERE e.id_empresa = ? AND e.estado = 1
    `;
    
    // Obtener progreso del empleado actual
    const progresoActual = await db.execute(
      `SELECT ROUND(AVG(CASE WHEN completado = 1 THEN 100 ELSE progreso END)) as progresoGeneral
       FROM empleado_lecciones WHERE id_empleado = ?`,
      [idEmpleado]
    );
    
    const progresoEmpleado = progresoActual[0][0]?.progresoGeneral || 0;
    
    const [rows] = await db.execute(query, [progresoEmpleado, idEmpresa]);
    
    if (rows.length === 0 || rows[0].totalEmpleados === 0) {
      return 'N/A';
    }
    
    const totalEmpleados = rows[0].totalEmpleados;
    const mayoresProgreso = rows[0].empleadosMayorProgreso || 0;
    const percentil = Math.round((mayoresProgreso / totalEmpleados) * 100);
    
    return `Top ${percentil}%`;
  } catch (error) {
    throw new Error(`Error calculando ranking: ${error.message}`);
  }
}

/**
 * Obtener lección por ID
 * @param {number} idLeccion
 * @returns {Promise<Object>}
 */
async function obtenerLeccionPorId(idLeccion) {
  try {
    const query = `
      SELECT 
        id_leccion,
        titulo,
        descripcion,
        modulo,
        duracion_minutos,
        dificultad,
        imagen_url
      FROM lecciones
      WHERE id_leccion = ? AND estado = 1
      LIMIT 1
    `;
    const [rows] = await db.execute(query, [idLeccion]);
    if (rows.length === 0) return null;
    
    const row = rows[0];
    return {
      idLeccion: row.id_leccion,
      titulo: row.titulo,
      descripcion: row.descripcion,
      modulo: row.modulo,
      duracionMinutos: row.duracion_minutos,
      dificultad: row.dificultad,
      imagenUrl: row.imagen_url || null
    };
  } catch (error) {
    throw new Error(`Error obteniendo lección: ${error.message}`);
  }
}

/**
 * Obtener contenido de lección
 * @param {number} idLeccion
 * @returns {Promise<Array>}
 */
async function obtenerContenidoLeccion(idLeccion) {
  try {
    const query = `
      SELECT 
        id_contenido,
        titulo,
        contenido,
        orden_contenido
      FROM leccion_contenido
      WHERE id_leccion = ? AND estado = 1
      ORDER BY orden_contenido ASC
    `;
    const [rows] = await db.execute(query, [idLeccion]);
    
    return rows.map(row => ({
      idContenido: row.id_contenido,
      titulo: row.titulo,
      contenido: row.contenido,
      ordenContenido: row.orden_contenido
    }));
  } catch (error) {
    throw new Error(`Error obteniendo contenido: ${error.message}`);
  }
}

/**
 * Inicializar tabla de respuestas de quizzes si no existe
 * @returns {Promise<void>}
 */
async function inicializarTablaRespuestas() {
  try {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS empleado_quiz_respuestas (
        id_respuesta INT AUTO_INCREMENT PRIMARY KEY,
        id_resultado INT NOT NULL,
        id_pregunta INT NOT NULL,
        respuesta_usuario ENUM('A','B','C','D') NOT NULL,
        correcta TINYINT DEFAULT 0,
        FOREIGN KEY (id_resultado)
          REFERENCES empleado_quiz_resultados(id_resultado)
          ON DELETE CASCADE,
        FOREIGN KEY (id_pregunta)
          REFERENCES quiz_preguntas(id_pregunta)
          ON DELETE CASCADE
      )
    `;
    await db.execute(createTableQuery);
  } catch (error) {
    throw new Error(`Error inicializando tabla: ${error.message}`);
  }
}

/**
 * Obtener quiz por lección con total de preguntas
 * @param {number} idLeccion
 * @returns {Promise<Object>}
 */
async function obtenerQuizPorLeccion(idLeccion) {
  try {
    const query = `
      SELECT 
        q.id_quiz,
        q.id_leccion,
        q.titulo,
        q.puntaje_aprobacion,
        COUNT(qp.id_pregunta) as totalPreguntas
      FROM leccion_quizzes q
      LEFT JOIN quiz_preguntas qp ON q.id_quiz = qp.id_quiz AND qp.estado = 1
      WHERE q.id_leccion = ? AND q.estado = 1
      GROUP BY q.id_quiz
      LIMIT 1
    `;
    const [rows] = await db.execute(query, [idLeccion]);
    if (rows.length === 0) return null;
    
    const row = rows[0];
    return {
      idQuiz: row.id_quiz,
      idLeccion: row.id_leccion,
      titulo: row.titulo,
      puntajeAprobacion: row.puntaje_aprobacion,
      totalPreguntas: row.totalPreguntas || 0
    };
  } catch (error) {
    throw new Error(`Error obteniendo quiz: ${error.message}`);
  }
}

/**
 * Obtener quiz por ID
 * @param {number} idQuiz
 * @returns {Promise<Object>}
 */
async function obtenerQuizPorId(idQuiz) {
  try {
    const query = `
      SELECT 
        id_quiz,
        id_leccion,
        titulo,
        puntaje_aprobacion,
        estado
      FROM leccion_quizzes
      WHERE id_quiz = ? AND estado = 1
      LIMIT 1
    `;
    const [rows] = await db.execute(query, [idQuiz]);
    if (rows.length === 0) return null;
    
    const row = rows[0];
    return {
      idQuiz: row.id_quiz,
      idLeccion: row.id_leccion,
      titulo: row.titulo,
      puntajeAprobacion: row.puntaje_aprobacion
    };
  } catch (error) {
    throw new Error(`Error obteniendo quiz: ${error.message}`);
  }
}

/**
 * Obtener preguntas de quiz
 * @param {number} idQuiz
 * @param {boolean} incluirRespuesta
 * @returns {Promise<Array>}
 */
async function obtenerPreguntasQuiz(idQuiz, incluirRespuesta = false) {
  try {
    const campos = `
      id_pregunta,
      id_quiz,
      pregunta,
      opcion_a,
      opcion_b,
      opcion_c,
      opcion_d
      ${incluirRespuesta ? ', respuesta_correcta' : ''},
      explicacion
    `;
    
    const query = `
      SELECT ${campos}
      FROM quiz_preguntas
      WHERE id_quiz = ? AND estado = 1
      ORDER BY id_pregunta ASC
    `;
    const [rows] = await db.execute(query, [idQuiz]);
    
    return rows.map(row => ({
      idPregunta: row.id_pregunta,
      pregunta: row.pregunta,
      opciones: {
        A: row.opcion_a,
        B: row.opcion_b,
        C: row.opcion_c,
        D: row.opcion_d
      },
      ...(incluirRespuesta && { respuestaCorrecta: row.respuesta_correcta }),
      ...(incluirRespuesta && { explicacion: row.explicacion })
    }));
  } catch (error) {
    throw new Error(`Error obteniendo preguntas: ${error.message}`);
  }
}

/**
 * Guardar resultado de quiz
 * @param {number} idEmpleado
 * @param {number} idQuiz
 * @param {Object} data
 * @returns {Promise<Object>}
 */
async function guardarResultadoQuiz(idEmpleado, idQuiz, data) {
  try {
    const query = `
      INSERT INTO empleado_quiz_resultados (
        id_empleado,
        id_quiz,
        puntaje,
        aprobado,
        respuestas,
        fecha_respuesta
      ) VALUES (?, ?, ?, ?, ?, NOW())
    `;
    const [result] = await db.execute(query, [
      idEmpleado,
      idQuiz,
      data.puntaje,
      data.aprobado ? 1 : 0,
      JSON.stringify(data.detalle)
    ]);
    
    return {
      idResultado: result.insertId,
      success: result.affectedRows > 0
    };
  } catch (error) {
    throw new Error(`Error guardando resultado: ${error.message}`);
  }
}

/**
 * Obtener último resultado de quiz
 * @param {number} idEmpleado
 * @param {number} idQuiz
 * @returns {Promise<Object>}
 */
async function obtenerUltimoResultadoQuiz(idEmpleado, idQuiz) {
  try {
    const query = `
      SELECT 
        id_resultado,
        id_empleado,
        id_quiz,
        puntaje,
        aprobado,
        respuestas,
        fecha_respuesta
      FROM empleado_quiz_resultados
      WHERE id_empleado = ? AND id_quiz = ?
      ORDER BY fecha_respuesta DESC
      LIMIT 1
    `;
    const [rows] = await db.execute(query, [idEmpleado, idQuiz]);
    if (rows.length === 0) return null;
    
    const row = rows[0];
    return {
      idResultado: row.id_resultado,
      idEmpleado: row.id_empleado,
      idQuiz: row.id_quiz,
      puntaje: row.puntaje,
      aprobado: row.aprobado === 1,
      respuestas: JSON.parse(row.respuestas),
      fechaRespuesta: row.fecha_respuesta
    };
  } catch (error) {
    throw new Error(`Error obteniendo resultado: ${error.message}`);
  }
}

/**
 * Guardar respuesta individual de quiz
 * @param {number} idResultado
 * @param {Object} data - {idPregunta, respuestaUsuario, correcta}
 * @returns {Promise<Object>}
 */
async function guardarRespuestaQuiz(idResultado, data) {
  try {
    const query = `
      INSERT INTO empleado_quiz_respuestas (
        id_resultado,
        id_pregunta,
        respuesta_usuario,
        correcta
      ) VALUES (?, ?, ?, ?)
    `;
    const [result] = await db.execute(query, [
      idResultado,
      data.idPregunta,
      data.respuestaUsuario,
      data.correcta ? 1 : 0
    ]);
    
    return {
      idRespuesta: result.insertId,
      success: result.affectedRows > 0
    };
  } catch (error) {
    throw new Error(`Error guardando respuesta: ${error.message}`);
  }
}

/**
 * Obtener respuestas de un resultado
 * @param {number} idResultado
 * @returns {Promise<Array>}
 */
async function obtenerRespuestasResultado(idResultado) {
  try {
    const query = `
      SELECT 
        qr.id_respuesta,
        qr.id_pregunta,
        qr.respuesta_usuario,
        qr.correcta,
        qp.respuesta_correcta,
        qp.explicacion
      FROM empleado_quiz_respuestas qr
      INNER JOIN quiz_preguntas qp ON qr.id_pregunta = qp.id_pregunta
      WHERE qr.id_resultado = ?
      ORDER BY qr.id_pregunta ASC
    `;
    const [rows] = await db.execute(query, [idResultado]);
    
    return rows.map(row => ({
      idRespuesta: row.id_respuesta,
      idPregunta: row.id_pregunta,
      respuestaUsuario: row.respuesta_usuario,
      correcta: row.correcta === 1,
      respuestaCorrecta: row.respuesta_correcta,
      explicacion: row.explicacion
    }));
  } catch (error) {
    throw new Error(`Error obteniendo respuestas: ${error.message}`);
  }
}

/**
 * Crear insignia si no existe
 * @param {number} idEmpleado
 * @param {string} nombre
 * @param {string} descripcion
 * @returns {Promise<Object>}
 */
async function crearInsigniaSiNoExiste(idEmpleado, nombre, descripcion) {
  try {
    // Verificar si ya existe
    const checkQuery = `
      SELECT id_insignia
      FROM empleado_insignias
      WHERE id_empleado = ? AND nombre = ? AND estado = 1
      LIMIT 1
    `;
    const [checkRows] = await db.execute(checkQuery, [idEmpleado, nombre]);
    
    if (checkRows.length > 0) {
      // Ya existe
      return {
        idInsignia: checkRows[0].id_insignia,
        creada: false
      };
    }
    
    // Crear nueva insignia
    const insertQuery = `
      INSERT INTO empleado_insignias (
        id_empleado,
        nombre,
        descripcion,
        estado,
        fecha_obtenida
      ) VALUES (?, ?, ?, 1, NOW())
    `;
    const [result] = await db.execute(insertQuery, [idEmpleado, nombre, descripcion]);
    
    return {
      idInsignia: result.insertId,
      creada: true
    };
  } catch (error) {
    throw new Error(`Error creando insignia: ${error.message}`);
  }
}

module.exports = {
  inicializarTablaRespuestas,
  obtenerEmpresaPorUsuario,
  obtenerUsuarioPorId,
  obtenerEmpleadoPorUsuarioEmail,
  obtenerResumenProgreso,
  obtenerSiguienteLeccion,
  listarLecciones,
  listarLeccionesCompletadas,
  obtenerCalificaciones,
  obtenerUltimaInsignia,
  obtenerEmpleadoLeccion,
  iniciarLeccion,
  actualizarProgreso,
  calcularRankingEmpresa,
  obtenerLeccionPorId,
  obtenerContenidoLeccion,
  obtenerQuizPorLeccion,
  obtenerQuizPorId,
  obtenerPreguntasQuiz,
  guardarResultadoQuiz,
  guardarRespuestaQuiz,
  obtenerRespuestasResultado,
  obtenerUltimoResultadoQuiz,
  marcarLeccionCompletada,
  crearInsigniaSiNoExiste
};
