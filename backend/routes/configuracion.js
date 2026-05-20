const express = require('express');
const router = express.Router();
const configuracionController = require('../controllers/configuracionController');
const { verifyAuth } = require('../middlewares/authMiddleware');

// PERFIL
router.get('/perfil', verifyAuth, configuracionController.obtenerPerfil);
router.put('/perfil', verifyAuth, configuracionController.actualizarPerfil);

// SEGURIDAD
router.get('/seguridad', verifyAuth, configuracionController.obtenerSeguridad);
router.put('/seguridad', verifyAuth, configuracionController.actualizarSeguridad);

// SESIONES
router.get('/sesiones', verifyAuth, configuracionController.listarSesiones);
router.delete('/sesiones/:id', verifyAuth, configuracionController.cerrarSesion);
router.delete('/sesiones', verifyAuth, configuracionController.cerrarOtrasSesiones);

// SUSCRIPCIÓN
router.get('/suscripcion', verifyAuth, configuracionController.obtenerSuscripcion);
router.put('/suscripcion', verifyAuth, configuracionController.actualizarSuscripcion);

module.exports = router;
