const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { enviarMensajeContacto } = require('../controllers/contactoController');

const authOpcional = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (header?.startsWith('Bearer')) {
      const token = header.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (user) req.user = user;
    }
  } catch (_) {}
  next();
};

router.post('/', authOpcional, enviarMensajeContacto);

module.exports = router;