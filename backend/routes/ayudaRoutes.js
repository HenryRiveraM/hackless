const express = require('express');
const router = express.Router();
const ayudaController = require('../controllers/ayudaController');
const authMiddleware = require('../middlewares/authMiddleware');

/**
 * Rutas de Ayuda y Soporte
 */

// FAQ (públicas, sin autenticación)
router.get('/faq', ayudaController.listarFaq);
router.get('/faq/populares', ayudaController.listarFaqPopulares);
router.get('/buscar', ayudaController.buscarFaq);

// Tickets (protegidas)
router.post('/tickets', authMiddleware.verifyAuth, ayudaController.crearTicket);
router.get('/tickets', authMiddleware.verifyAuth, ayudaController.listarTickets);
router.get('/tickets/:id', authMiddleware.verifyAuth, ayudaController.obtenerTicket);

// Chat de soporte (protegidas)
router.post('/chat', authMiddleware.verifyAuth, ayudaController.crearChat);
router.get('/chat', authMiddleware.verifyAuth, ayudaController.listarChats);
router.get('/chat/:id', authMiddleware.verifyAuth, ayudaController.obtenerChat);
router.post('/chat/:id/mensajes', authMiddleware.verifyAuth, ayudaController.enviarMensajeChat);
router.patch('/chat/:id/cerrar', authMiddleware.verifyAuth, ayudaController.cerrarChat);

// Estado del sistema (público)
router.get('/estado-sistema', ayudaController.obtenerEstadoSistema);

module.exports = router;
