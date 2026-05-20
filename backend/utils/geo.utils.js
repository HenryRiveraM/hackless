/**
 * Utilidades para Geolocalización
 * Integración con ip-api.com
 */

const axios = require('axios');

const GEO_API_URL = 'http://ip-api.com/json';
const GEO_API_TIMEOUT = 5000; // 5 segundos timeout

/**
 * Obtener geolocalización de una IP
 * NO lanza excepciones que rompan flujo principal
 * Retorna null si falla
 */
async function obtenerGeolocalizacion(ip) {
  try {
    // Validar que sea una IP válida
    if (!ip || typeof ip !== 'string') {
      console.warn('[GEO] IP inválida:', ip);
      return null;
    }

    // Realizar petición a ip-api.com
    const response = await axios.get(`${GEO_API_URL}/${ip}`, {
      timeout: GEO_API_TIMEOUT,
      headers: {
        'User-Agent': 'Hackless-Security'
      }
    });

    // Validar respuesta
    if (!response.data || response.data.status !== 'success') {
      console.warn('[GEO] API returned non-success status:', response.data?.status);
      return null;
    }

    // Extraer datos relevantes
    const geoData = {
      pais: response.data.country || null,
      ciudad: response.data.city || null,
      region: response.data.regionName || null,
      latitud: response.data.lat || null,
      longitud: response.data.lon || null,
      proveedor: response.data.isp || null,
      rawResponse: JSON.stringify(response.data)
    };

    console.log('[GEO] Localización obtenida para IP:', ip);
    return geoData;
  } catch (error) {
    // No lanzar excepción, solo loguear
    console.warn('[GEO] Error al obtener geolocalización:', {
      ip,
      error: error.message,
      code: error.code
    });

    return null;
  }
}

module.exports = {
  obtenerGeolocalizacion
};
