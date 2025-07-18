const express = require('express');
const router = express.Router();
const passport = require('passport');
const bcrypt = require('bcrypt');
const User = require('../models/User');

// Registo
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const existeUser = await User.findOne({ username });
    if (existeUser) return res.status(400).json({ message: 'Utilizador já existe' });

    const hash = await bcrypt.hash(password, 10);
    const novoUser = new User({ username, password: hash });
    await novoUser.save();

    res.status(201).json({ message: 'Utilizador criado com sucesso' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login
router.post('/login', passport.authenticate('local'), (req, res) => {
  res.json({ message: 'Login com sucesso' });
});

// Logout
router.get('/logout', (req, res) => {
  req.logout(() => {
    res.json({ message: 'Logout efetuado' });
  });
});

module.exports = router;
