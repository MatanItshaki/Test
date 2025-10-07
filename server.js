// server.js
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();

// ===== Middlewares =====
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// לוג כניסות בסיסי + ניסיון עדין להביא עיר/מדינה (ללא תלות חיצונית)
app.use(async (req, res, next) => {
  try {
    const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '')
      .toString().split(',')[0].trim();

    // לוג בסיסי
    const baseLine = {
      time: new Date().toISOString(),
      ip,
      ua: req.headers['user-agent'],
      path: req.url
    };

    // נסיון עדין ל-GeoIP עם fetch המובנה ב-Node (ללא להפיל את הבקשה אם נכשל)
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 2500); // timeout 2.5s
      const r = await fetch(`https://ipapi.co/${ip}/json/`, { signal: ctrl.signal });
      clearTimeout(t);
      if (r.ok) {
        const geo = await r.json();
        baseLine.city = geo?.city || null;
        baseLine.country = geo?.country_name || null;
      }
    } catch { /* מתעלמים בשקט אם ה-geo נכשל */ }

    fs.appendFileSync(path.join(__dirname, 'visits.log'), JSON.stringify(baseLine) + '\n');
  } catch { /* לא מפילים בקשה על לוג */ }
  next();
});

// ===== Routes =====

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

// צפייה בכל המיקומים שנשמרו (עם הגנה על שורות ריקות/שבורות)
app.get('/locations', (req, res) => {
  try {
    const file = path.join(__dirname, 'locations.log');
    if (!fs.existsSync(file)) return res.json([]);
    const data = fs.readFileSync(file, 'utf8').trim();
    if (!data) return res.json([]);
    const lines = data.split('\n').reduce((arr, line) => {
      try { if (line.trim()) arr.push(JSON.parse(line)); } catch {}
      return arr;
    }, []);
    res.json(lines);
  } catch (e) {
    console.error('read /locations failed:', e);
    res.status(500).json({ error: 'failed to read locations' });
  }
});

// איפוס/ניקוי locations.log (גלוי – רצוי להגן בסיסמה/טוקן אם שומרים)
app.get('/clear-locations', (req, res) => {
  try {
    fs.writeFileSync(path.join(__dirname, 'locations.log'), '');
    res.send('✅ locations.log נוקה בהצלחה');
  } catch (e) {
    console.error(e);
    res.status(500).send('שגיאה בעת ניקוי הקובץ');
  }
});

// בדיקת בריאות מהירה
app.get('/health', (_req, res) => res.send('OK'));

// ===== Server listen =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`listening on http://0.0.0.0:${PORT}`));
