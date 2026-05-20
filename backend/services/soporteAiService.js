/**
 * Servicio de Soporte IA para generar respuestas del bot
 * Usa Google Gemini API para respuestas inteligentes
 * Fallback a respuestas mock si hay error o sin API key
 */

let GoogleGenerativeAI;
try {
  GoogleGenerativeAI = require('@google/generative-ai').GoogleGenerativeAI;
} catch (error) {
  console.warn('Google Generative AI módulo no disponible, usando mock responses');
  GoogleGenerativeAI = null;
}

let genAI = null;

  /**
 * Inicializar cliente Gemini
 */
function inicializarGenAI() {
  if (!genAI && GoogleGenerativeAI) {
    const apiKey = process.env.SOPORTE_AI_API_KEY || process.env.GEMINI_API_KEY;
    if (apiKey) {
      genAI = new GoogleGenerativeAI(apiKey.trim());
    }
  }
  return genAI;
}

/**
 * Generar respuesta automática del bot usando Gemini
 * @param {string} asunto - asunto de la conversación
 * @param {string} mensaje - mensaje del usuario
 * @returns {Promise<string>}
 */
async function generarRespuesta(asunto, mensaje) {
  try {
    const genAIClient = inicializarGenAI();
    
    if (!genAIClient) {
      // Sin API key, usar respuesta mock
      return generarRespuestaMock(asunto, mensaje);
    }

    // Preparar el prompt
    const prompt = `Eres un asistente de soporte técnico de seguridad para una plataforma de capacitación en seguridad cibernética.

Contexto de la consulta:
- Asunto: ${asunto}
- Mensaje del usuario: ${mensaje}

Responde de forma concisa (máximo 2-3 oraciones), amable y profesional. 
Si es una pregunta sobre seguridad, brinda consejos prácticos.
Si necesita asistencia personalizada, sugiere crear un ticket de soporte.
Mantén un tono de ayuda y disponibilidad.`;

    // Llamar a Gemini
    const model = genAIClient.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const respuesta = response.text();

    return respuesta || generarRespuestaMock(asunto, mensaje);
  } catch (error) {
    console.error('Error llamando a Gemini API:', error.message);
    // Fallback a respuesta mock en caso de error
    return generarRespuestaMock(asunto, mensaje);
  }
}

/**
 * Generar respuesta mock del bot (fallback)
 * @param {string} asunto
 * @param {string} mensaje
 * @returns {string}
 */
function generarRespuestaMock(asunto, mensaje) {
  // Respuestas según palabras clave detectadas
  const asuntoLower = asunto.toLowerCase();
  const mensajeLower = mensaje.toLowerCase();
  
  if (asuntoLower.includes('phishing') || mensajeLower.includes('phishing')) {
    return 'Gracias por contactarnos sobre phishing. Te recomendamos revisar nuestras guías sobre identificación de correos fraudulentos. Recuerda verificar siempre la dirección del remitente y no hacer clic en enlaces sospechosos. Si tienes más dudas, crea un ticket de soporte.';
  }
  
  if (asuntoLower.includes('contraseña') || asuntoLower.includes('mfa') || mensajeLower.includes('contraseña')) {
    return 'Entendemos tu consulta sobre seguridad de contraseñas. Te sugerimos revisar nuestras guías sobre creación de contraseñas robustas y autenticación de dos factores. Para asistencia personalizada, por favor crea un ticket de soporte.';
  }
  
  if (asuntoLower.includes('reporte') || mensajeLower.includes('reporte')) {
    return 'Gracias por tu interés en reportes de seguridad. Te recomendamos acceder a la sección de reportes en tu dashboard. Si necesitas ayuda específica, no dudes en crear un ticket.';
  }
  
  if (asuntoLower.includes('capacitación') || asuntoLower.includes('lección') || mensajeLower.includes('capacitación')) {
    return 'Sobre capacitación y lecciones, encuentra todo el contenido en la sección Capacitación de tu plataforma. Completa las lecciones para mejorar tu puntuación de seguridad. Para dudas específicas, crea un ticket de soporte.';
  }
  
  // Respuesta por defecto
  return 'Gracias por contactarnos. Revisamos tu consulta y te recomendamos revisar nuestras guías de ayuda. Si el problema continúa o necesitas asistencia adicional, por favor crea un ticket de soporte y nuestro equipo te atenderá pronto.';
}

module.exports = {
  generarRespuesta,
  generarRespuestaMock
};
