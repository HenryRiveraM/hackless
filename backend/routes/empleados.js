const express = require('express');
const router = express.Router();
const empleadosController = require('../controllers/empleadosController');
const { verifyAuth } = require('../middlewares/authMiddleware');

router.get('/', verifyAuth, empleadosController.listar);

router.get('/resumen', verifyAuth, empleadosController.obtenerResumen);

router.get('/:id', verifyAuth, empleadosController.obtenerPorId);

router.post('/', verifyAuth, empleadosController.crear);

router.put('/:id', verifyAuth, empleadosController.actualizar);

router.delete('/:id', verifyAuth, empleadosController.eliminar);

module.exports = router;
