const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, admin } = require('../middleware/auth');

router.get('/', protect, admin, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({ total: users.length, users });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

module.exports = router;