const auditoriasRepository = require('../repositories/auditoriasRepository');

/**
 * Auditorías Service
 * Lógica de negocio para auditorías
 */

/**
 * Validar formato de email
 * @param {string} email
 * @returns {boolean}
 */
function validarEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Simular verificación de correo
 * @param {string} email
 * @returns {Object} { estadoAuditoria, resumenResultado, detalleResultado }
 */
function simularVerificacionCorreo(email) {
  const emailLower = email.toLowerCase();
  
  // Palabras clave para simular leak
  const palabrasLeak = ['admin', 'ceo', 'test', 'demo'];
  const esLeak = palabrasLeak.some(palabra => emailLower.includes(palabra));

  if (esLeak) {
    return {
      estadoAuditoria: 'leaked',
      resumenResultado: '3 breaches found (LinkedIn, Dropbox, Canva).',
      detalleResultado: 'El correo aparece en filtraciones simuladas para fines de prototipo.'
    };
  } else {
    return {
      estadoAuditoria: 'secure',
      resumenResultado: 'No breaches found.',
      detalleResultado: 'No se encontraron filtraciones simuladas para este correo.'
    };
  }
}

/**
 * Simular escaneo de puertos
 * @param {string} target
 * @returns {Object} { estadoAuditoria, resumenResultado, detalleResultado }
 */
function simularEscanearPuertos(target) {
  const targetLower = target.toLowerCase();
  
  // Palabras clave para simular alerta
  const palabrasAlerta = ['8080', '192.168', 'localhost', 'test'];
  const esAlerta = palabrasAlerta.some(palabra => targetLower.includes(palabra));

  if (esAlerta) {
    return {
      estadoAuditoria: 'alert',
      resumenResultado: 'Port 8080 (HTTP-Proxy) exposed.',
      detalleResultado: 'Se detectó un puerto expuesto simulado para fines de prototipo.'
    };
  } else {
    return {
      estadoAuditoria: 'secure',
      resumenResultado: '0 high-risk ports open. SSH filtered.',
      detalleResultado: 'No se encontraron puertos críticos expuestos en la simulación.'
    };
  }
}

/**
 * Verificar correo
 * @param {number} idUsuario
 * @param {Object} data - { email }
 * @returns {Promise<Object>}
 */
async function verificarCorreo(idUsuario, data) {
  try {
    // Validar email
    if (!data.email || !data.email.trim()) {
      throw new Error('El correo es obligatorio');
    }

    const email = data.email.trim();

    if (!validarEmail(email)) {
      throw new Error('El formato del correo no es válido');
    }

    // Obtener empresa del usuario
    const empresa = await auditoriasRepository.obtenerEmpresaPorUsuario(idUsuario);
    if (!empresa) {
      throw new Error('No existe una empresa asociada al usuario autenticado');
    }

    // Simular verificación
    const simulacion = simularVerificacionCorreo(email);

    // Crear auditoría
    const idAuditoria = await auditoriasRepository.crearAuditoria(empresa.id_empresa, {
      target: email,
      tipo: 'email_check',
      estadoAuditoria: simulacion.estadoAuditoria,
      resumenResultado: simulacion.resumenResultado,
      detalleResultado: simulacion.detalleResultado
    });

    // Retornar auditoría creada
    return await auditoriasRepository.obtenerAuditoriaPorId(idAuditoria, empresa.id_empresa);
  } catch (error) {
    throw new Error(error.message);
  }
}

/**
 * Escanear puertos
 * @param {number} idUsuario
 * @param {Object} data - { target }
 * @returns {Promise<Object>}
 */
async function escanearPuertos(idUsuario, data) {
  try {
    // Validar target
    if (!data.target || !data.target.trim()) {
      throw new Error('El target es obligatorio');
    }

    const target = data.target.trim();

    // Obtener empresa del usuario
    const empresa = await auditoriasRepository.obtenerEmpresaPorUsuario(idUsuario);
    if (!empresa) {
      throw new Error('No existe una empresa asociada al usuario autenticado');
    }

    // Simular escaneo
    const simulacion = simularEscanearPuertos(target);

    // Crear auditoría
    const idAuditoria = await auditoriasRepository.crearAuditoria(empresa.id_empresa, {
      target: target,
      tipo: 'port_scan',
      estadoAuditoria: simulacion.estadoAuditoria,
      resumenResultado: simulacion.resumenResultado,
      detalleResultado: simulacion.detalleResultado
    });

    // Retornar auditoría creada
    return await auditoriasRepository.obtenerAuditoriaPorId(idAuditoria, empresa.id_empresa);
  } catch (error) {
    throw new Error(error.message);
  }
}

/**
 * Listar auditorías
 * @param {number} idUsuario
 * @param {Object} filtros
 * @returns {Promise<Object>}
 */
async function listarAuditorias(idUsuario, filtros = {}) {
  try {
    // Obtener empresa del usuario
    const empresa = await auditoriasRepository.obtenerEmpresaPorUsuario(idUsuario);
    if (!empresa) {
      throw new Error('No existe una empresa asociada al usuario autenticado');
    }

    // Validar paginación
    const page = parseInt(filtros.page) || 1;
    const pageSize = parseInt(filtros.pageSize) || 10;

    if (page < 1) {
      throw new Error('El número de página debe ser mayor a 0');
    }

    if (pageSize < 1 || pageSize > 100) {
      throw new Error('El tamaño de página debe estar entre 1 y 100');
    }

    // Validar filtros
    if (filtros.tipo && !['email_check', 'port_scan'].includes(filtros.tipo)) {
      throw new Error('Tipo de auditoría inválido');
    }

    if (filtros.estadoAuditoria && !['leaked', 'secure', 'alert', 'pending'].includes(filtros.estadoAuditoria)) {
      throw new Error('Estado de auditoría inválido');
    }

    // Listar auditorías
    const items = await auditoriasRepository.listarAuditorias(empresa.id_empresa, {
      tipo: filtros.tipo,
      estadoAuditoria: filtros.estadoAuditoria,
      busqueda: filtros.busqueda,
      page,
      pageSize
    });

    // Contar total
    const total = await auditoriasRepository.contarAuditorias(empresa.id_empresa, {
      tipo: filtros.tipo,
      estadoAuditoria: filtros.estadoAuditoria,
      busqueda: filtros.busqueda
    });

    return {
      items,
      total,
      page,
      pageSize
    };
  } catch (error) {
    throw new Error(error.message);
  }
}

/**
 * Obtener auditoría por ID
 * @param {number} idUsuario
 * @param {number} idAuditoria
 * @returns {Promise<Object>}
 */
async function obtenerAuditoriaPorId(idUsuario, idAuditoria) {
  try {
    // Obtener empresa del usuario
    const empresa = await auditoriasRepository.obtenerEmpresaPorUsuario(idUsuario);
    if (!empresa) {
      throw new Error('No existe una empresa asociada al usuario autenticado');
    }

    // Obtener auditoría
    const auditoria = await auditoriasRepository.obtenerAuditoriaPorId(idAuditoria, empresa.id_empresa);
    if (!auditoria) {
      throw new Error('La auditoría no existe');
    }

    return auditoria;
  } catch (error) {
    throw new Error(error.message);
  }
}

/**
 * Eliminar auditoría
 * @param {number} idUsuario
 * @param {number} idAuditoria
 * @returns {Promise<Object>}
 */
async function eliminarAuditoria(idUsuario, idAuditoria) {
  try {
    // Obtener empresa del usuario
    const empresa = await auditoriasRepository.obtenerEmpresaPorUsuario(idUsuario);
    if (!empresa) {
      throw new Error('No existe una empresa asociada al usuario autenticado');
    }

    // Verificar que la auditoría existe
    const auditoria = await auditoriasRepository.obtenerAuditoriaPorId(idAuditoria, empresa.id_empresa);
    if (!auditoria) {
      throw new Error('La auditoría no existe');
    }

    // Eliminar auditoría
    const resultado = await auditoriasRepository.eliminarAuditoria(idAuditoria, empresa.id_empresa);

    if (!resultado.success) {
      throw new Error('No se pudo eliminar la auditoría');
    }

    return {
      success: true,
      message: 'Auditoría eliminada correctamente'
    };
  } catch (error) {
    throw new Error(error.message);
  }
}

/**
 * Generar resultados de auditoría
 * @param {number} idUsuario
 * @param {number} idAuditoria
 * @returns {Promise<Object>}
 */
async function generarResultadosAuditoria(idUsuario, idAuditoria) {
  try {
    const empresa = await auditoriasRepository.obtenerEmpresaPorUsuario(idUsuario);
    if (!empresa) {
      throw new Error('No existe una empresa asociada al usuario autenticado');
    }

    const auditoria = await auditoriasRepository.obtenerAuditoriaPorId(idAuditoria, empresa.id_empresa);
    if (!auditoria) {
      throw new Error('La auditoría no existe');
    }

    // Verificar si ya existe resultado
    const resultadoExistente = await auditoriasRepository.obtenerResultadoAuditoria(idAuditoria);
    if (resultadoExistente) {
      return resultadoExistente;
    }

    let puntuacion, nivelRiesgo, hallazgos, resumen, plan, escaneos, amenazas, servicios;

    // Generar según tipo de auditoría
    if (auditoria.tipo === 'email_check') {
      puntuacion = Math.floor(Math.random() * (85 - 60 + 1)) + 60;
      nivelRiesgo = auditoria.estadoAuditoria === 'leaked' ? 'alto' : 'medio';
      escaneos = 512;
      amenazas = auditoria.estadoAuditoria === 'leaked' ? 3 : 0;
      servicios = 8;
      
      resumen = `Email '${auditoria.target}' ${auditoria.estadoAuditoria === 'leaked' ? 'detectado en filtraciones' : 'seguro'}. Se realizó análisis en bases de datos de breaches conocidas.`;
      plan = 'Se recomienda cambiar contraseña y habilitar autenticación de dos factores si el email está comprometido.';
      
      hallazgos = [
        { titulo: '3 Correos comprometidos', descripcion: 'Filtraciones detectadas en bases de datos públicas', severidad: 'critico' },
        { titulo: 'Credenciales filtradas', descripcion: 'Se encontraron credenciales en dumps de datos', severidad: 'advertencia' },
        { titulo: 'Riesgo phishing alto', descripcion: 'Email aparece en listas de phishing conocidas', severidad: 'advertencia' }
      ];
    } else {
      // port_scan
      puntuacion = Math.floor(Math.random() * (95 - 70 + 1)) + 70;
      nivelRiesgo = auditoria.estadoAuditoria === 'alert' ? 'medio' : 'bajo';
      escaneos = 1248;
      amenazas = auditoria.estadoAuditoria === 'alert' ? 5 : 0;
      servicios = 15;
      
      resumen = `Target '${auditoria.target}' ${auditoria.estadoAuditoria === 'alert' ? 'tiene puertos expuestos' : 'es seguro'}. Se realizó escaneo completo de puertos.`;
      plan = 'Evaluar servicios expuestos y configurar firewall adecuadamente si es necesario.';
      
      hallazgos = [
        { titulo: 'Puertos abiertos detectados', descripcion: 'Se encontraron servicios escuchando en puertos públicos', severidad: 'advertencia' },
        { titulo: 'Servicios expuestos', descripcion: 'HTTP, SSH y otros servicios accesibles desde internet', severidad: 'advertencia' },
        { titulo: 'Firewall permisivo', descripcion: 'Reglas de firewall permiten acceso excesivo', severidad: 'informativo' }
      ];
    }

    // Crear resultado
    await auditoriasRepository.crearResultadoAuditoria(idAuditoria, {
      puntuacionSeguridad: puntuacion,
      nivelRiesgo,
      resumenGeneral: resumen,
      planAccion: plan,
      escaneosTotales: escaneos,
      amenazasBloqueadas: amenazas,
      serviciosProtegidos: servicios
    });

    // Crear hallazgos
    for (const hallazgo of hallazgos) {
      await auditoriasRepository.crearHallazgo(idAuditoria, hallazgo);
    }

    // Retornar resultado
    return await auditoriasRepository.obtenerResultadoAuditoria(idAuditoria);
  } catch (error) {
    throw new Error(error.message);
  }
}

/**
 * Obtener resultados de auditoría
 * @param {number} idUsuario
 * @param {number} idAuditoria
 * @returns {Promise<Object>}
 */
async function obtenerResultadosAuditoria(idUsuario, idAuditoria) {
  try {
    const empresa = await auditoriasRepository.obtenerEmpresaPorUsuario(idUsuario);
    if (!empresa) {
      throw new Error('No existe una empresa asociada al usuario autenticado');
    }

    const auditoria = await auditoriasRepository.obtenerAuditoriaPorId(idAuditoria, empresa.id_empresa);
    if (!auditoria) {
      throw new Error('La auditoría no existe');
    }

    const resultado = await auditoriasRepository.obtenerResultadoAuditoria(idAuditoria);
    if (!resultado) {
      throw new Error('No hay resultados generados para esta auditoría');
    }

    const hallazgos = await auditoriasRepository.obtenerHallazgosAuditoria(idAuditoria);

    return {
      ...resultado,
      hallazgos
    };
  } catch (error) {
    throw new Error(error.message);
  }
}

/**
 * Generar PDF de auditoría
 * @param {number} idUsuario
 * @param {number} idAuditoria
 * @returns {Promise<Buffer>}
 */
async function generarPdfAuditoria(idUsuario, idAuditoria) {
  try {
    const PDFDocument = require('pdfkit');
    
    const empresa = await auditoriasRepository.obtenerEmpresaPorUsuario(idUsuario);
    if (!empresa) {
      throw new Error('No existe una empresa asociada al usuario autenticado');
    }

    const auditoria = await auditoriasRepository.obtenerAuditoriaPorId(idAuditoria, empresa.id_empresa);
    if (!auditoria) {
      throw new Error('La auditoría no existe');
    }

    const resultado = await auditoriasRepository.obtenerResultadoAuditoria(idAuditoria);
    if (!resultado) {
      throw new Error('No hay resultados para esta auditoría');
    }

    const hallazgos = await auditoriasRepository.obtenerHallazgosAuditoria(idAuditoria);

    // Crear PDF
    const doc = new PDFDocument();
    let chunks = [];

    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => {});

    // Título
    doc.fontSize(20).font('Helvetica-Bold').text('Reporte de Auditoría de Seguridad', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica').text(`Empresa: ${empresa.nombre_empresa}`, { align: 'center' });
    doc.fontSize(10).text(`Auditoría ID: ${idAuditoria}`, { align: 'center' });
    doc.fontSize(10).text(`Generado: ${new Date().toLocaleDateString('es-ES')}`, { align: 'center' });
    doc.moveDown(1);

    // Resumen
    doc.fontSize(14).font('Helvetica-Bold').text('Resumen');
    doc.moveDown(0.3);
    doc.fontSize(11).font('Helvetica').text(resultado.resumenGeneral);
    doc.moveDown(0.5);

    // Puntuación
    doc.fontSize(12).font('Helvetica-Bold').text(`Puntuación de Seguridad: ${resultado.puntuacionSeguridad}/100`);
    doc.fontSize(12).text(`Nivel de Riesgo: ${resultado.nivelRiesgo.toUpperCase()}`);
    doc.moveDown(0.5);

    // Estadísticas
    doc.fontSize(12).font('Helvetica-Bold').text('Estadísticas');
    doc.moveDown(0.3);
    doc.fontSize(10).font('Helvetica').text(`Escaneos Totales: ${resultado.escaneosTotales}`);
    doc.fontSize(10).text(`Amenazas Bloqueadas: ${resultado.amenazasBloqueadas}`);
    doc.fontSize(10).text(`Servicios Protegidos: ${resultado.serviciosProtegidos}`);
    doc.moveDown(0.5);

    // Hallazgos
    doc.fontSize(14).font('Helvetica-Bold').text('Hallazgos');
    doc.moveDown(0.3);
    
    hallazgos.forEach((h, idx) => {
      doc.fontSize(11).font('Helvetica-Bold').text(`${idx + 1}. ${h.titulo} [${h.severidad}]`);
      doc.fontSize(10).font('Helvetica').text(h.descripcion);
      doc.moveDown(0.3);
    });

    doc.moveDown(0.5);

    // Plan de acción
    doc.fontSize(14).font('Helvetica-Bold').text('Plan de Acción');
    doc.moveDown(0.3);
    doc.fontSize(11).font('Helvetica').text(resultado.planAccion);

    doc.end();

    return new Promise((resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
    });
  } catch (error) {
    throw new Error(error.message);
  }
}

/**
 * Simular análisis de auditoría
 * @param {string} tipo - email_check o port_scan
 * @param {string} target
 * @returns {Object} { estadoAuditoria, puntuacion, nivelRiesgo, hallazgos, resumen, plan }
 */
function simularAnalisisAuditoria(tipo, target) {
  const targetLower = target.toLowerCase();
  let resultado = {};

  if (tipo === 'email_check') {
    const palabrasAlerta = ['admin', 'ceo', 'test', 'demo'];
    const esAlerta = palabrasAlerta.some(palabra => targetLower.includes(palabra));

    if (esAlerta) {
      resultado = {
        estadoAuditoria: 'leaked',
        puntuacion: 62,
        nivelRiesgo: 'alto',
        escaneos: 512,
        amenazas: 3,
        servicios: 8,
        resumen: `Email '${target}' detectado en filtraciones. Se encontraron vulnerabilidades críticas en análisis de seguridad.`,
        plan: 'Se recomienda cambiar contraseña inmediatamente y habilitar autenticación de dos factores (MFA). Revisar actividad reciente de la cuenta.',
        hallazgos: [
          { titulo: 'Correo sensible detectado', descripcion: 'El correo analizado parece pertenecer a una cuenta crítica.', severidad: 'critico' },
          { titulo: 'Posible exposición a phishing', descripcion: 'Email identificado en campañas de phishing conocidas.', severidad: 'advertencia' },
          { titulo: 'Requiere MFA obligatorio', descripcion: 'Esta cuenta debe tener autenticación de dos factores activada.', severidad: 'advertencia' }
        ]
      };
    } else {
      resultado = {
        estadoAuditoria: 'secure',
        puntuacion: 88,
        nivelRiesgo: 'bajo',
        escaneos: 512,
        amenazas: 0,
        servicios: 8,
        resumen: `Email '${target}' no detectado en filtraciones simuladas. Seguridad adecuada verificada.`,
        plan: 'Mantener medidas de seguridad actuales. Realizar auditorías periódicas cada 30 días.',
        hallazgos: [
          { titulo: 'Sin filtraciones simuladas', descripcion: 'Email no encontrado en bases de datos públicas de breaches.', severidad: 'informativo' },
          { titulo: 'Riesgo bajo detectado', descripcion: 'Análisis indica seguridad adecuada del correo.', severidad: 'informativo' }
        ]
      };
    }
  } else if (tipo === 'port_scan') {
    const palabrasAlerta = ['8080', 'localhost', '192.168', 'test'];
    const esAlerta = palabrasAlerta.some(palabra => targetLower.includes(palabra));

    if (esAlerta) {
      resultado = {
        estadoAuditoria: 'alert',
        puntuacion: 68,
        nivelRiesgo: 'medio',
        escaneos: 1248,
        amenazas: 5,
        servicios: 15,
        resumen: `Target '${target}' tiene puertos potencialmente expuestos. Se detectaron servicios que requieren revisión.`,
        plan: 'Evaluar servicios expuestos y configurar reglas de firewall restrictivas. Considerar usar VPN o restricciones de IP.',
        hallazgos: [
          { titulo: 'Puerto potencialmente expuesto', descripcion: 'Se detectó servicio escuchando en puerto no seguro.', severidad: 'advertencia' },
          { titulo: 'Servicio requiere revisión', descripcion: 'Servicios identificados necesitan configuración adicional de seguridad.', severidad: 'advertencia' },
          { titulo: 'Firewall permisivo', descripcion: 'Reglas de firewall permiten acceso desde múltiples fuentes.', severidad: 'informativo' }
        ]
      };
    } else {
      resultado = {
        estadoAuditoria: 'secure',
        puntuacion: 91,
        nivelRiesgo: 'bajo',
        escaneos: 1248,
        amenazas: 0,
        servicios: 15,
        resumen: `Target '${target}' no tiene puertos críticos expuestos. Configuración de seguridad adecuada verificada.`,
        plan: 'Mantener configuración actual. Realizar escaneos periódicos cada 15 días.',
        hallazgos: [
          { titulo: 'No se detectaron puertos críticos', descripcion: 'Escaneo completo no identificó puertos inseguros.', severidad: 'informativo' },
          { titulo: 'Servicios protegidos', descripcion: 'Todos los servicios están detrás de firewall adecuado.', severidad: 'informativo' }
        ]
      };
    }
  }

  return resultado;
}

/**
 * Ejecutar auditoría funcional
 * @param {number} idUsuario
 * @param {Object} data - { tipo, target }
 * @returns {Promise<number>}
 */
async function ejecutarAuditoria(idUsuario, data) {
  try {
    // Validar empresa
    const empresa = await auditoriasRepository.obtenerEmpresaPorUsuario(idUsuario);
    if (!empresa) {
      throw new Error('No existe una empresa asociada al usuario autenticado');
    }

    // Validar tipo
    const tiposValidos = ['email_check', 'port_scan'];
    if (!data.tipo || !tiposValidos.includes(data.tipo)) {
      throw new Error('El tipo debe ser: email_check o port_scan');
    }

    // Validar target
    if (!data.target || !data.target.trim()) {
      throw new Error('El target es obligatorio');
    }

    let idAuditoria;
    
    try {
      // 1. Crear auditoría con estado procesando
      idAuditoria = await auditoriasRepository.crearAuditoriaProceso(empresa.id_empresa, {
        target: data.target.trim(),
        tipo: data.tipo
      });

      // 2. Simular análisis
      const analisis = simularAnalisisAuditoria(data.tipo, data.target.trim());

      // 3. Crear resultado
      await auditoriasRepository.crearResultadoAuditoria(idAuditoria, {
        puntuacionSeguridad: analisis.puntuacion,
        nivelRiesgo: analisis.nivelRiesgo,
        resumenGeneral: analisis.resumen,
        planAccion: analisis.plan,
        escaneosTotales: analisis.escaneos,
        amenazasBloqueadas: analisis.amenazas,
        serviciosProtegidos: analisis.servicios
      });

      // 4. Crear hallazgos
      await auditoriasRepository.crearHallazgosAuditoria(idAuditoria, analisis.hallazgos);

      // 5. Actualizar auditoría a completado
      await auditoriasRepository.actualizarAuditoriaProceso(idAuditoria, empresa.id_empresa, {
        estadoProceso: 'completado',
        estadoAuditoria: analisis.estadoAuditoria
      });

      return idAuditoria;
    } catch (error) {
      // En caso de error, marcar como fallido
      if (idAuditoria) {
        await auditoriasRepository.actualizarAuditoriaProceso(idAuditoria, empresa.id_empresa, {
          estadoProceso: 'fallido',
          errorProceso: error.message
        }).catch(err => console.error('Error actualizando auditoría fallida:', err));
      }
      throw error;
    }
  } catch (error) {
    throw new Error(error.message);
  }
}

/**
 * Obtener estado de auditoría
 * @param {number} idUsuario
 * @param {number} idAuditoria
 * @returns {Promise<Object>}
 */
async function obtenerEstadoAuditoria(idUsuario, idAuditoria) {
  try {
    const empresa = await auditoriasRepository.obtenerEmpresaPorUsuario(idUsuario);
    if (!empresa) {
      throw new Error('No existe una empresa asociada al usuario autenticado');
    }

    const auditoria = await auditoriasRepository.obtenerAuditoriaPorId(idAuditoria, empresa.id_empresa);
    if (!auditoria) {
      throw new Error('La auditoría no existe');
    }

    return {
      idAuditoria: auditoria.idAuditoria,
      estadoProceso: auditoria.estadoProceso,
      estadoAuditoria: auditoria.estadoAuditoria,
      redirect: auditoria.estadoProceso === 'completado' ? `/auditorias/${idAuditoria}/resultados` : null
    };
  } catch (error) {
    throw new Error(error.message);
  }
}

/**
 * Obtener resultados de auditoría funcional
 * @param {number} idUsuario
 * @param {number} idAuditoria
 * @returns {Promise<Object>}
 */
async function obtenerResultadosFuncional(idUsuario, idAuditoria) {
  try {
    const empresa = await auditoriasRepository.obtenerEmpresaPorUsuario(idUsuario);
    if (!empresa) {
      throw new Error('No existe una empresa asociada al usuario autenticado');
    }

    const auditoria = await auditoriasRepository.obtenerAuditoriaPorId(idAuditoria, empresa.id_empresa);
    if (!auditoria) {
      throw new Error('La auditoría no existe');
    }

    const resultado = await auditoriasRepository.obtenerResultadoAuditoria(idAuditoria);
    if (!resultado) {
      throw new Error('No hay resultados para esta auditoría');
    }

    const hallazgos = await auditoriasRepository.obtenerHallazgosAuditoria(idAuditoria);

    return {
      idAuditoria: auditoria.idAuditoria,
      target: auditoria.target,
      tipo: auditoria.tipo,
      estadoAuditoria: auditoria.estadoAuditoria,
      estadoProceso: auditoria.estadoProceso,
      puntuacionSeguridad: resultado.puntuacionSeguridad,
      nivelRiesgo: resultado.nivelRiesgo,
      resumenGeneral: resultado.resumenGeneral,
      planAccion: resultado.planAccion,
      escaneosTotales: resultado.escaneosTotales,
      amenazasBloqueadas: resultado.amenazasBloqueadas,
      serviciosProtegidos: resultado.serviciosProtegidos,
      hallazgos: hallazgos
    };
  } catch (error) {
    throw new Error(error.message);
  }
}

module.exports = {
  verificarCorreo,
  escanearPuertos,
  listarAuditorias,
  obtenerAuditoriaPorId,
  eliminarAuditoria,
  generarResultadosAuditoria,
  obtenerResultadosAuditoria,
  generarPdfAuditoria,
  ejecutarAuditoria,
  obtenerEstadoAuditoria,
  obtenerResultadosFuncional
};
