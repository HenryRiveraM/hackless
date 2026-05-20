var express = require('express');
var router = express.Router();
var historialController = require('../controllers/historialAlertasController');
var { verifyAuth } = require('../middlewares/authMiddleware');

// GET /api/historial-alertas/resumen - debe ir ANTES de /:id
router.get('/resumen', verifyAuth, historialController.obtenerResumen);

// GET /api/historial-alertas/exportar - debe ir ANTES de /:id
router.get('/exportar', verifyAuth, historialController.exportarHistorial);

// GET /api/historial-alertas - Listar historial
router.get('/', verifyAuth, historialController.listarHistorial);

// PATCH /api/historial-alertas/:id/resolver - Resolver incidencia
router.patch('/:id/resolver', verifyAuth, historialController.resolverIncidencia);

module.exports = router;
