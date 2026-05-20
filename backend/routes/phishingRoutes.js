const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const phishingController = require('../controllers/phishingController');

// Proteger todas las rutas con autenticación
router.use(authMiddleware.verifyAuth);

// Plantillas (ANTES de :id dinámico)
router.get('/plantillas', phishingController.listarPlantillas);
router.get('/plantillas/:id', phishingController.obtenerPlantilla);

// Dashboard y rutas específicas (ANTES de :id dinámico)
router.get('/dashboard/:idCampana', phishingController.obtenerDashboard);
router.get('/historial', phishingController.obtenerHistorial);
router.get('/empleado/:id', phishingController.obtenerDetalleEmpleado);

// Campaña específica - asignaciones y simulaciones (ANTES de GET/:id)
router.post('/campanas/:id/empleados', phishingController.asignarEmpleados);
router.post('/campanas/:id/simular', phishingController.simularEventos);

// CRUD campañas
router.get('/campanas', phishingController.obtenerCampanas);
router.post('/campanas', phishingController.crearCampana);
router.get('/campanas/:id', phishingController.obtenerCampana);
router.put('/campanas/:id', phishingController.actualizarCampana);
router.delete('/campanas/:id', phishingController.eliminarCampana);

module.exports = router;
