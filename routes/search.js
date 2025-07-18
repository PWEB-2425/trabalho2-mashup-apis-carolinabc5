const express = require('express');
const router = express.Router();
const User = require('../models/User'); // modelo User

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

// Função para obter o clima da cidade
async function getWeather(city) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=pt`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Erro ao obter dados do OpenWeatherMap');
  const data = await res.json();
  return data;
}

// Função para obter resumo da Wikipedia
async function getWikipediaSummary(term) {
  const url = `https://pt.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(term)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Erro ao obter dados da Wikipedia');
  const data = await res.json();
  return data;
}

// Rota GET /search?term=xxxxx
router.get('/', async (req, res) => {
  const term = req.query.term;
  if (!term) return res.status(400).json({ message: 'Falta o parâmetro term' });

  // Obtém o id do user autenticado
  const userId = req.user._id;

  try {
    // Chama as duas APIs em paralelo
    const [weather, wikipedia] = await Promise.all([
      getWeather(term),
      getWikipediaSummary(term)
    ]);

    // Guarda o termo pesquisado no histórico do utilizador
    await User.findByIdAndUpdate(userId, {
      $push: { pesquisas: { termo: term, data: new Date() } }
    });

    // Envia resposta com dados combinados
    res.json({
      weather,
      wikipedia
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
