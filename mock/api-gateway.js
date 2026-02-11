const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors({ origin: 'http://localhost:4200' }));
app.use(express.json());

const DB = 'http://localhost:3001';

function safeUser(u) {
  const { password, ...safe } = u;
  return safe;
}

// Register
app.post('/api/auth/register', async (req, res) => {
  const { username, password, height, weight, dateOfBirth, sex } = req.body || {};
  if (!username || !password) return res.status(400).json({ message: 'username and password required' });

  const existing = await fetch(`${DB}/users?username=${encodeURIComponent(username)}`).then(r => r.json());
  if (existing.length) return res.status(409).json({ message: 'username already exists' });

  const newUser = {
    id: `u_${Date.now()}`,
    username,
    password,
    token: `${username}-token`,
    height: height ?? null,
    weight: weight ?? null,
    dateOfBirth: dateOfBirth ?? null,
    sex: sex ?? null
  };

  const created = await fetch(`${DB}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newUser)
  }).then(r => r.json());

  res.status(201).json(safeUser(created));
});

// Login
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body || {};
  const users = await fetch(
    `${DB}/users?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`
  ).then(r => r.json());

  if (!users.length) return res.status(401).json({ message: 'Invalid credentials' });
  res.json(safeUser(users[0]));
});

// Update profile
app.patch('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  const updated = await fetch(`${DB}/users/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req.body || {})
  }).then(async r => {
    if (!r.ok) return null;
    return r.json();
  });

  if (!updated) return res.status(404).json({ message: 'User not found' });
  res.json(safeUser(updated));
});

app.listen(3000, () => console.log('Mock API (gateway) on http://localhost:3000'));
