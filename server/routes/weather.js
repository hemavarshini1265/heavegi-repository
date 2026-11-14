const express = require('express');
const axios = require('axios');

const router = express.Router();

// Static fallback weather data for major Indian cities
const FALLBACK_WEATHER = {
  mumbai:    { city: 'Mumbai',    temp: 32, feels_like: 36, humidity: 78, description: 'Partly cloudy', wind_speed: 14 },
  delhi:     { city: 'Delhi',     temp: 28, feels_like: 30, humidity: 60, description: 'Hazy sunshine',  wind_speed: 10 },
  bangalore: { city: 'Bangalore', temp: 24, feels_like: 25, humidity: 65, description: 'Mostly cloudy', wind_speed: 12 },
  chennai:   { city: 'Chennai',   temp: 34, feels_like: 40, humidity: 80, description: 'Hot & humid',   wind_speed: 16 },
  kolkata:   { city: 'Kolkata',   temp: 30, feels_like: 35, humidity: 75, description: 'Cloudy',        wind_speed: 8  },
  hyderabad: { city: 'Hyderabad', temp: 29, feels_like: 32, humidity: 55, description: 'Clear sky',     wind_speed: 11 },
  pune:      { city: 'Pune',      temp: 26, feels_like: 28, humidity: 60, description: 'Partly sunny',  wind_speed: 9  },
  jaipur:    { city: 'Jaipur',    temp: 33, feels_like: 36, humidity: 40, description: 'Sunny & dry',   wind_speed: 13 },
};

// GET /api/weather?city=Mumbai
router.get('/', async (req, res) => {
  const city = req.query.city || 'Mumbai';
  const apiKey = process.env.WEATHER_API_KEY;

  if (apiKey) {
    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)},IN&appid=${apiKey}&units=metric`;
      const { data } = await axios.get(url, { timeout: 5000 });
      return res.json({
        source: 'live',
        city: data.name,
        country: data.sys.country,
        temp: Math.round(data.main.temp),
        feels_like: Math.round(data.main.feels_like),
        humidity: data.main.humidity,
        description: data.weather[0].description,
        wind_speed: data.wind.speed,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('[Weather] OpenWeatherMap API failed, using fallback:', err.message);
    }
  }

  // Fallback
  const key = city.toLowerCase().trim();
  const fallback = FALLBACK_WEATHER[key] || { city, temp: 30, feels_like: 33, humidity: 65, description: 'Data unavailable', wind_speed: 10 };
  res.json({ source: 'fallback', ...fallback, timestamp: new Date().toISOString(), note: 'Live data unavailable; showing cached estimate.' });
});

module.exports = router;
