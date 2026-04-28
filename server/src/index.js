require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const todoRoutes = require('./routes/todos');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());

app.use('/api/todos', todoRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

async function getMongoUri() {
  if (process.env.MONGODB_URI) return process.env.MONGODB_URI;
  // No URI configured — spin up an embedded MongoDB for development
  const path = require('path');
  const fs = require('fs');
  const { MongoMemoryServer } = require('mongodb-memory-server');
  const dbPath = path.join(__dirname, '../../.mongodb-data');
  fs.mkdirSync(dbPath, { recursive: true });
  const memServer = await MongoMemoryServer.create({ instance: { dbPath, storageEngine: 'wiredTiger' } });
  const uri = memServer.getUri();
  console.log('Using embedded MongoDB (data persists in server/.mongodb-data). Set MONGODB_URI in .env to use your own.');
  return uri;
}

getMongoUri()
  .then((uri) => mongoose.connect(uri))
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });
