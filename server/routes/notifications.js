const express = require('express');
const router  = express.Router();
const { protect, admin } = require('../middleware/auth');

const {
  getMisNotificaciones,
  leerTodas,
  leerUna,
  contarNoLeidas,
  enviarMensaje,
  limpiarNotifHuerfanas,
} = require('../controllers/notificationController');

// Todas las rutas requieren estar autenticado
router.use(protect);

router.get ('/',              getMisNotificaciones);
router.get ('/no-leidas',     contarNoLeidas);
router.put ('/leer-todas',    leerTodas);
router.put ('/:id/leer',      leerUna);
router.delete('/limpiar-huerfanas', admin, limpiarNotifHuerfanas);

// Solo admins pueden enviar mensajes directos
router.post('/mensaje', admin, enviarMensaje);

module.exports = router;
