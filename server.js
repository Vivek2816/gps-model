const express = require('express');
const path = require('path');
const app = express();

// Use dynamic port for hosting (Render, Railway, etc.)
const PORT = process.env.PORT || 3000;

// Replace or add more tokens for security
const VALID_TOKENS = (process.env.VALID_TOKENS || 'driver-secret-123').split(',');

// Store latest location for each bus
const buses = {}; // { busId: { lat, lon, ts } }

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Driver POSTs location: { busId, token, lat, lon }
app.post('/update-location', (req, res) => {
  const { busId, token, lat, lon } = req.body || {};

  if (!busId || !token || typeof lat !== 'number' || typeof lon !== 'number') {
    return res.status(400).json({ error: 'Missing fields or invalid coordinates' });
  }

  if (!VALID_TOKENS.includes(token)) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  buses[busId] = { lat, lon, ts: Date.now() };
  console.log(`Updated ${busId}:`, buses[busId]);
  return res.sendStatus(200);
});

// User GETs location of a bus: /bus-location/:busId
app.get('/bus-location/:busId', (req, res) => {
  const { busId } = req.params;
  if (!buses[busId]) return res.status(404).json({ error: 'Unknown bus ID' });
  res.json(buses[busId]);
});

// Serve frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/user.html'));
});

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
