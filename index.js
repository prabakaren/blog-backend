require('dotenv').config();

const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const blogRoutes = require('./routes/blogs');

const app = express();

// Only the frontend URL(s) in CLIENT_URL may call the API. Empty = allow all.
const allowed = (process.env.CLIENT_URL || '')
  .split(',')
  .map((u) => u.trim().replace(/\/$/, ''))
  .filter(Boolean);

app.use(
  cors({
    origin: allowed.length ? allowed : true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  })
);
app.use(express.json());

app.get('/', (req, res) => res.json({ message: 'Blog API is running' }));
app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);

app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

// Vercel runs the exported app, locally we start our own server
if (!process.env.VERCEL) {
  const port = process.env.PORT || 5000;
  app.listen(port, () => console.log(`Server running on port ${port}`));
}

module.exports = app;
