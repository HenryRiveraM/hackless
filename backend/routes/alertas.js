/**
 * Routes para Alertas de Seguridad
 */

const express = require('express');
const router = express.Router();
const alertasController = require('../controllers/alertasController');
const { verifyAuth } = require('../middlewares/authMiddleware');

// Obtener resumen (DEBE ir antes de /:id para no confundirse)
router.get('/resumen', verifyAuth, alertasController.obtenerResumen);

// Listar alertas
router.get('/', verifyAuth, alertasController.listarAlertas);

// Obtener alerta por ID
router.get('/:id', verifyAuth, alertasController.obtenerAlertaPorId);

// Crear alerta
router.post('/', verifyAuth, alertasController.crearAlerta);

// Actualizar alerta
router.put('/:id', verifyAuth, alertasController.actualizarAlerta);

// Actualizar estado de alerta
router.patch('/:id/estado', verifyAuth, alertasController.actualizarEstadoAlerta);

// Eliminar alerta
router.delete('/:id', verifyAuth, alertasController.eliminarAlerta);

module.exports = router;
