const express = require('express');
const router = express.Router();
const reportesController = require('../controllers/reportesController');
const { verifyAuth } = require('../middlewares/authMiddleware');

router.get('/', verifyAuth, reportesController.listar);

router.get('/:id', verifyAuth, reportesController.obtenerPorId);

router.post('/', verifyAuth, reportesController.crear);

router.put('/:id', verifyAuth, reportesController.actualizar);

router.delete('/:id', verifyAuth, reportesController.eliminar);

module.exports = router;
