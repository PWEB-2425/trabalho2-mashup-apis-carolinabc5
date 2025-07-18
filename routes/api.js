const express = require('express');
const router = express.Router();
const passport = require('passport');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));


// Middleware para proteger rotas
function ensureAuth(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ message: 'Não autorizado' });
}

// POST /register — registo
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    // Aqui deverias verificar se o username já existe e validar password

    const userExists = await User.findOne({ username });
    if (userExists) return res.status(400).json({ message: 'Username já existe' });

    const newUser = new User({ username, password }); // password deve ser hash
    await newUser.save();
    res.status(201).json({ message: 'Utilizador registado com sucesso' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /login — login com passport local
router.post('/login', passport.authenticate('local'), (req, res) => {
  res.json({ message: 'Login efetuado com sucesso' });
});

// GET /logout — logout
router.get('/logout', (req, res) => {
  req.logout(() => {
    res.json({ message: 'Sessão terminada' });
  });
});

// POST /search — receber termo e fazer mashup APIs externas
router.post('/search', ensureAuth, async (req, res) => {
  const { termo } = req.body;
  if (!termo) return res.status(400).json({ message: 'Termo de pesquisa necessário' });

  try {
    // Exemplo: OpenWeatherMap + Wikipedia
    const apiKeyOWM = process.env.OPENWEATHERMAP_API_KEY;

    const weatherPromise = fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(termo)}&appid=${apiKeyOWM}&units=metric&lang=pt`
    ).then(r => r.json());

    const wikiPromise = fetch(
      `https://pt.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(termo)}`
    ).then(r => r.json());

    const [weather, wiki] = await Promise.all([weatherPromise, wikiPromise]);

    // Guardar no histórico do user
    const user = await User.findById(req.user._id);
    user.pesquisas.push({ termo, data: new Date() });
    await user.save();

    // Resposta combinada
    res.json({ weather, wiki });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /history — histórico do utilizador autenticado
router.get('/history', ensureAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ pesquisas: user.pesquisas });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
