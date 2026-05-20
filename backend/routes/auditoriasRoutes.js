const express = require('express');
const router = express.Router();
const auditoriasController = require('../controllers/auditoriasController');
const authMiddleware = require('../middlewares/authMiddleware');

/**
 * Auditorías Routes
 * Todas las rutas protegidas con JWT
 * 
 * IMPORTANTE: Rutas específicas ANTES de /:id para evitar conflictos
 */

// Rutas específicas sin parámetros (POST/GET antes de /:id)
// POST /api/auditorias/ejecutar
router.post('/ejecutar', authMiddleware.verifyAuth, auditoriasController.ejecutarAuditoria);

// POST /api/auditorias/email-check
router.post('/email-check', authMiddleware.verifyAuth, auditoriasController.verificarCorreo);

// POST /api/auditorias/port-scan
router.post('/port-scan', authMiddleware.verifyAuth, auditoriasController.escanearPuertos);

// GET /api/auditorias (listar)
router.get('/', authMiddleware.verifyAuth, auditoriasController.listarAuditorias);

// Rutas con ID (específicos ANTES que :id genérico)
// POST /api/auditorias/:id/generar-resultados
router.post('/:id/generar-resultados', authMiddleware.verifyAuth, auditoriasController.generarResultados);

// GET /api/auditorias/:id/estado
router.get('/:id/estado', authMiddleware.verifyAuth, auditoriasController.obtenerEstadoAuditoria);

// GET /api/auditorias/:id/resultados
router.get('/:id/resultados', authMiddleware.verifyAuth, auditoriasController.obtenerResultadosFuncional);

// GET /api/auditorias/:id/pdf
router.get('/:id/pdf', authMiddleware.verifyAuth, auditoriasController.generarPdf);

// Rutas genéricas /:id (AL FINAL)
// GET /api/auditorias/:id
router.get('/:id', authMiddleware.verifyAuth, auditoriasController.obtenerAuditoriaPorId);

// DELETE /api/auditorias/:id
router.delete('/:id', authMiddleware.verifyAuth, auditoriasController.eliminarAuditoria);

module.exports = router;
