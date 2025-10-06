const fs = require('fs');
const path = require('path');

// ... ה-Express שלך

app.get('/locations', (req, res) => {
  try {
    const file = path.join(__dirname, 'locations.log');
    if (!fs.existsSync(file)) return res.json([]); // אין נתונים עדיין
    const data = fs.readFileSync(file, 'utf8');
    const lines = data.trim() ? data.trim().split('\n').map(JSON.parse) : [];
    res.json(lines);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'failed to read locations' });
  }
});
