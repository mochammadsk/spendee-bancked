const express = require('express');
const crypto = require('node:crypto');
const cors = require('cors');
const database = require('./src/lib/database');
const helmet = require('helmet');
const morgan = require('morgan');
const routes = require('./src/routes');
require('dotenv').config();

// Create app
const app = express();

// Config
let connectDB;
try {
  ({ connectDB } = database);
} catch {}

// Security
app.set('trust proxy', 1);
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// Cors
const allowlist = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (!allowlist.length || allowlist.includes(origin))
        return cb(null, true);
      return cb(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
    ],
  })
);

// Middlewares
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Logger
app.use((req, res, next) => {
  req.id = req.headers['x-request-id'] || crypto.randomUUID();
  res.setHeader('x-request-id', req.id);
  next();
});
app.use(morgan('dev'));
app.use((req, _res, next) => {
  console.log(
    `[${new Date().toISOString()}] ${req.method} ${req.url} id=${req.id}`
  );
  next();
});

// Routes
app.get('/', (_req, res) => res.send('Your server is running ^_^'));
app.use('/api', routes);

app.use((err, _req, res, _next) => {
  console.error('ERROR:', err);
  const status = err.status || 500;
  res.status(status).json({ message: err.message || 'Internal Server Error' });
});

async function start() {
  try {
    if (typeof connectDB === 'function') {
      await connectDB();
    }
    const server = app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
    server.on('error', (e) => console.error('HTTP server error:', e));
  } catch (e) {
    console.error('Failed to start server:', e);
    process.exit(1);
  }
}

if (require.main === module) {
  start();
}

module.exports = app;
