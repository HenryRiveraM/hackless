/**
 * Routes para Incidencias de Seguridad
 */

const express = require('express');
const router = express.Router();
const incidenciasController = require('../controllers/incidenciasController');
const { verifyAuth } = require('../middlewares/authMiddleware');

// Obtener resumen (DEBE ir antes de /:id para no confundirse)
router.get('/resumen', verifyAuth, incidenciasController.obtenerResumen);

// Listar incidencias
router.get('/', verifyAuth, incidenciasController.listarIncidencias);

// Crear incidencia
router.post('/', verifyAuth, incidenciasController.crearIncidencia);

// Obtener incidencia por ID
router.get('/:id', verifyAuth, incidenciasController.obtenerIncidencia);

// Actualizar incidencia
router.put('/:id', verifyAuth, incidenciasController.actualizarIncidencia);

// Actualizar estado
router.patch('/:id/estado', verifyAuth, incidenciasController.actualizarEstado);

// Eliminar incidencia
router.delete('/:id', verifyAuth, incidenciasController.eliminarIncidencia);

// Timeline
router.get('/:id/timeline', verifyAuth, incidenciasController.obtenerTimeline);
router.post('/:id/timeline', verifyAuth, incidenciasController.agregarTimeline);

// Acciones
router.get('/:id/acciones', verifyAuth, incidenciasController.obtenerAcciones);
router.post('/:id/acciones', verifyAuth, incidenciasController.agregarAccion);

// Activos
router.get('/:id/activos', verifyAuth, incidenciasController.obtenerActivos);
router.post('/:id/activos', verifyAuth, incidenciasController.agregarActivo);

// Geolocalización
router.get('/:id/geolocalizacion', verifyAuth, incidenciasController.obtenerGeolocalizacion);

module.exports = router;
