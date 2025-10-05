// server.js
const express = require('express');
const fs = require('fs');
const app = express();
app.use(express.json());

app.post('/collect-location', (req, res) => {
  const entry = {
    receivedAt: new Date().toISOString(),
    ...req.body
  };
  // שמירה לקובץ (או DB) — רק בסביבת ניסוי ובאישור
  fs.appendFileSync('locations.log', JSON.stringify(entry) + '\n');
  res.sendStatus(200);
});

app.use(express.static('public')); // כאן תכניס את ה-HTML לעומת public/index.html

app.listen(3000, () => console.log('listening on http://localhost:3000'));
