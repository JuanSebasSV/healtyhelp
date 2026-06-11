const express = require("express");
const router  = express.Router();
const { protect, admin } = require("../middleware/auth");

const {
  getMisNotificaciones,
  leerTodas,
  leerUna,
  contarNoLeidas,
  enviarMensaje,
  eliminarUna,
  limpiarNotifHuerfanas,
} = require("../controllers/notificationController");

// Todas las rutas requieren estar autenticado
router.use(protect);

router.get("/",          getMisNotificaciones);
router.get("/no-leidas", contarNoLeidas);

router.put("/leer-todas",  leerTodas);
router.put("/:id/leer",    leerUna);

router.post("/mensaje", admin, enviarMensaje);

// IMPORTANTE: rutas estáticas siempre antes de /:id
router.delete("/limpiar-huerfanas", admin, limpiarNotifHuerfanas);
router.delete("/:id",               eliminarUna);

module.exports = router;