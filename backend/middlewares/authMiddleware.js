// middlewares/authMiddleware.js
// Middleware para verificar autenticación en rutas protegidas
// Valida el JWT en las peticiones

const authService = require('../services/authService');

// Middleware para verificar JWT
function verifyAuth(req, res, next) {
  try {
    // Obtener el token del header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Token no proporcionado'
      });
    }
    
    // El token viene en formato "Bearer <token>"
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Formato de token inválido'
      });
    }
    
    // Verificar el token
    const decoded = authService.verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido o expirado'
      });
    }
    
    // Guardar los datos del usuario en la petición
    req.user = decoded;
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error en verificación de autenticación'
    });
  }
}

module.exports = {
  verifyAuth
};
