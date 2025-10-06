// server.js
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();

// Middlewares
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// דף הבית (אם אין index.html ב-public)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html')); // או TrackingLocation.html
});

// קבלת מיקום ושמירה לשורה בלוג
app.post('/collect-location', (req, res) => {
  try {
    const entry = { receivedAt: new Date().toISOString(), ...req.body };
    fs.appendFileSync(path.join(__dirname, 'locations.log'), JSON.stringify(entry) + '\n');
    res.sendStatus(200);
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

// צפייה בכל המיקומים שנשמרו
app.get('/locations', (req, res) => {
  try {
    const file = path.join(__dirname, 'locations.log');
    if (!fs.existsSync(file)) return res.json([]);
    const data = fs.readFileSync(file, 'utf8');
    const lines = data.trim() ? data.trim().split('\n').map(JSON.parse) : [];
    res.json(lines);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'failed to read locations' });
  }
});

// האזנה לפורט (Render מספק PORT בסביבה)
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`listening on http://0.0.0.0:${PORT}`));
