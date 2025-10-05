const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());

// API לשמירת מיקום
app.post('/collect-location', (req, res) => {
  const entry = { receivedAt: new Date().toISOString(), ...req.body };
  fs.appendFileSync(path.join(__dirname, 'locations.log'), JSON.stringify(entry) + '\n');
  res.sendStatus(200);
});

// סטטי
app.use(express.static(path.join(__dirname, 'public')));

// מיפוי root (אם אין index.html)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'TrackingLocation.html')); // או index.html אם קיים
});

const PORT = 3000;
app.listen(PORT, () => console.log(`listening on http://localhost:${PORT}`));
