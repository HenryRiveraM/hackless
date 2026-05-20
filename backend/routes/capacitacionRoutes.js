const express = require('express');
const router = express.Router();
const capacitacionController = require('../controllers/capacitacionController');
const authMiddleware = require('../middlewares/authMiddleware');

/**
 * Capacitación Routes
 * Todas las rutas protegidas con JWT
 */

// GET /api/capacitacion/dashboard
router.get('/dashboard', authMiddleware.verifyAuth, capacitacionController.obtenerDashboard);

// Rutas específicas de lecciones (ANTES de /lecciones/:id)
// GET /api/capacitacion/lecciones/completadas
router.get('/lecciones/completadas', authMiddleware.verifyAuth, capacitacionController.listarCompletadas);

// GET /api/capacitacion/lecciones/:id/contenido
router.get('/lecciones/:id/contenido', authMiddleware.verifyAuth, capacitacionController.obtenerContenidoLeccion);

// GET /api/capacitacion/lecciones/:id/quiz
router.get('/lecciones/:id/quiz', authMiddleware.verifyAuth, capacitacionController.obtenerQuizLeccion);

// GET /api/capacitacion/lecciones
router.get('/lecciones', authMiddleware.verifyAuth, capacitacionController.listarLecciones);

// POST /api/capacitacion/lecciones/:id/iniciar
router.post('/lecciones/:id/iniciar', authMiddleware.verifyAuth, capacitacionController.iniciarLeccion);

// PATCH /api/capacitacion/lecciones/:id/progreso
router.patch('/lecciones/:id/progreso', authMiddleware.verifyAuth, capacitacionController.actualizarProgreso);

// POST /api/capacitacion/quizzes/:id/responder
router.post('/quizzes/:id/responder', authMiddleware.verifyAuth, capacitacionController.responderQuiz);

// GET /api/capacitacion/quizzes/:id/resultado
router.get('/quizzes/:id/resultado', authMiddleware.verifyAuth, capacitacionController.obtenerResultadoQuiz);

module.exports = router;
