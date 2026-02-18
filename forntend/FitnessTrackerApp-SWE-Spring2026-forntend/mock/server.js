const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors({ origin: 'http://localhost:4200' }));
app.use(express.json());

const DB_PATH = path.join(__dirname, 'db.json');

function readDb() {
  const raw = fs.readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(raw);
}
function writeDb(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

function safeUser(u) {
  const { password, ...safe } = u;
  return safe;
}

// POST /api/auth/register
app.post('/api/auth/register', (req, res) => {
  const { username, password, height, weight, dateOfBirth, sex, neck, waist, hips } = req.body || {};
  if (!username || !password) return res.status(400).json({ message: 'username and password required' });

  const db = readDb();
  db.users ||= [];

  if (db.users.some(u => u.username === username)) {
    return res.status(409).json({ message: 'username already exists' });
  }

  const user = {
    id: `u_${Date.now()}`,
    username,
    password,
    token: `${username}-token`,
    height: height ?? null,
    weight: weight ?? null,
    dateOfBirth: dateOfBirth ?? null,
    sex: sex ?? null,
    neck: neck ?? null,
    waist: waist ?? null,
    hips: hips ?? null,
  };

  db.users.push(user);
  writeDb(db);

  res.status(201).json(safeUser(user));
});

// POST /api/auth/login
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body || {};
  const db = readDb();
  db.users ||= [];

  const user = db.users.find(u => u.username === username);
  if (!user || user.password !== password) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  res.json(safeUser(user));
});

// PATCH /api/users/:id  (save profile edits)
app.patch('/api/users/:id', (req, res) => {
  const { id } = req.params;
  const db = readDb();
  db.users ||= [];

  const idx = db.users.findIndex(u => u.id === id);
  if (idx < 0) return res.status(404).json({ message: 'User not found' });

  db.users[idx] = { ...db.users[idx], ...req.body };
  writeDb(db);

  res.json(safeUser(db.users[idx]));
});

app.listen(3000, () => console.log('Mock API running at http://localhost:3000'));
