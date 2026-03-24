const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors({ origin: 'http://localhost:4200' }));
app.use(express.json());

const DB_PATH = path.join(__dirname, 'db.json');

function readDb() {
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
}

function writeDb(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

function safeUser(user) {
  const { password, ...rest } = user;
  return rest;
}

// ---------------- AUTH ----------------
app.post('/api/auth/register', (req, res) => {
  const { username, password, height, weight, dateOfBirth, sex } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ message: 'username and password required' });
  }

  const db = readDb();
  db.users ||= [];

  if (db.users.some(u => u.username === username)) {
    return res.status(409).json({ message: 'username already exists' });
  }

  const user = {
    id: Date.now(),
    username,
    password,
    token: `${username}-token`,
    height: height ?? null,
    weight: weight ?? null,
    dateOfBirth: dateOfBirth ?? null,
    sex: sex ?? null
  };

  db.users.push(user);
  writeDb(db);

  res.status(201).json(safeUser(user));
});

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body || {};
  const db = readDb();
  db.users ||= [];

  const user = db.users.find(
    u => u.username === username && u.password === password
  );

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  res.json(safeUser(user));
});

// ---------------- PROFILE ----------------
app.patch('/api/users/:id', (req, res) => {
  const id = Number(req.params.id);
  const db = readDb();
  db.users ||= [];

  const idx = db.users.findIndex(u => Number(u.id) === id);
  if (idx < 0) {
    return res.status(404).json({ message: 'User not found' });
  }

  db.users[idx] = { ...db.users[idx], ...req.body };
  writeDb(db);

  res.json(safeUser(db.users[idx]));
});

// ---------------- WEIGHT ----------------
app.get('/api/weight', (req, res) => {
  const userId = Number(req.query.userId);
  const days = Number(req.query.days || 30);

  const db = readDb();
  db.weightLogs ||= [];

  let logs = db.weightLogs;

  if (!Number.isNaN(userId)) {
    logs = logs.filter(log => Number(log.userId) === userId);
  }

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  logs = logs
    .filter(log => new Date(log.loggedAt) >= cutoff)
    .sort((a, b) => new Date(b.loggedAt) - new Date(a.loggedAt));

  res.json(logs);
});

app.post('/api/weight', (req, res) => {
  const { userId, weightKG } = req.body || {};

  if (!userId || weightKG == null) {
    return res.status(400).json({ message: 'userId and weightKG are required' });
  }

  const db = readDb();
  db.users ||= [];
  db.weightLogs ||= [];

  const user = db.users.find(u => Number(u.id) === Number(userId));
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const newLog = {
    id: Date.now(),
    userId: Number(userId),
    weightKG: Number(weightKG),
    loggedAt: new Date().toISOString()
  };

  db.weightLogs.push(newLog);

  // keep latest profile weight in sync
  const userIdx = db.users.findIndex(u => Number(u.id) === Number(userId));
  if (userIdx >= 0) {
    db.users[userIdx].weight = Number(weightKG);
  }

  writeDb(db);

  res.status(201).json(newLog);
});

app.listen(3000, () => {
  console.log('Mock API running at http://localhost:3000');
});