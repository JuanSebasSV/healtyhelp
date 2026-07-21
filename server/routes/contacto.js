const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { enviarMensajeContacto } = require('../controllers/contactoController');

router.post('/', protect, enviarMensajeContacto);

module.exports = router;