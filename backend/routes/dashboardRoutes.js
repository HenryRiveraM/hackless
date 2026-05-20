const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middlewares/authMiddleware');

/**
 * Dashboard Routes
 * Todas las rutas protegidas con JWT
 */

// GET /api/dashboard/resumen
router.get('/resumen', authMiddleware.verifyAuth, dashboardController.obtenerResumen);

// GET /api/dashboard/recomendaciones
router.get('/recomendaciones', authMiddleware.verifyAuth, dashboardController.listarRecomendaciones);

// POST /api/dashboard/recomendaciones
router.post('/recomendaciones', authMiddleware.verifyAuth, dashboardController.crearRecomendacion);

// PATCH /api/dashboard/recomendaciones/:id/estado
router.patch('/recomendaciones/:id/estado', authMiddleware.verifyAuth, dashboardController.actualizarEstadoRecomendacion);

// DELETE /api/dashboard/recomendaciones/:id
router.delete('/recomendaciones/:id', authMiddleware.verifyAuth, dashboardController.eliminarRecomendacion);

module.exports = router;
