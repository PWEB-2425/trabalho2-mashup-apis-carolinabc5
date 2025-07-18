// server.js
const dotenv = require('dotenv');
dotenv.config(); // carregar .env logo no início

const express = require('express');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const path = require('path');

const User = require('./models/User');
const Pesquisa = require('./models/Pesquisa');

const authRouter = require('./routes/auth');
const apiRouter = require('./routes/api');
const searchRouter = require('./routes/search');

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares globais (devem estar antes das rotas)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'segredoMuitoSecreto',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Em produção usar HTTPS e true aqui
}));

app.use(passport.initialize());
app.use(passport.session());

// Configuração Passport LocalStrategy
passport.use(new LocalStrategy(async (username, password, done) => {
  try {
    const user = await User.findOne({ username });
    if (!user) return done(null, false, { message: 'Utilizador não encontrado' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return done(null, false, { message: 'Password incorreta' });

    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// Middleware para proteger rotas
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ message: 'Não autenticado' });
}

console.log('authRouter:', authRouter);
console.log('apiRouter:', apiRouter);
console.log('searchRouter:', searchRouter);

// Registo das rotas depois de middlewares essenciais
app.use('/auth', authRouter);
app.use('/api', apiRouter);
app.use('/search', searchRouter);

// Serve frontend estático (pasta public)
app.use(express.static(path.join(__dirname, 'public')));

// Rota raiz protegida - serve index.html se autenticado, senão redirect login
app.get('/user/:id', (req, res) => {
  if (req.isAuthenticated()) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  } else {
    res.redirect('/login.html');
  }
});

// Rota fallback para SPA (single page app)
app.get('/user/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Liga ao MongoDB e inicia servidor
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('MongoDB conectado com sucesso!');
  app.listen(PORT, () => console.log(`Servidor a correr na porta ${PORT}`));
})
.catch(err => {
  console.error('Erro a conectar ao MongoDB:', err.message);
  process.exit(1);
});
