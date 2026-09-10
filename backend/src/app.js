'use strict';

const express = require('express');
const cors = require('cors');
const { errorHandler } = require('./middleware/errorHandler');
const routes = require('./routes');
const env = require('./config/env');

const app = express();

// ── CORS ─────────────────────────────────────────────────────────────────────
// In production: restrict to your actual frontend domain.
// In development: allow everything.
const allowedOrigins = env.isProduction
  ? [
      'https://mandi-mitra.vercel.app',
      'https://mandi-mitra-frontend.vercel.app',
      // Add your real production domain here
    ]
  : ['http://localhost:3000', 'http://localhost:3001'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g., curl, Postman, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`CORS: Origin '${origin}' not allowed`));
    },
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      env: env.isProduction ? 'production' : 'development',
      timestamp: new Date().toISOString(),
    },
  });
});

// ── API routes ────────────────────────────────────────────────────────────────
app.use('/api', routes);

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Route ${req.method} ${req.path} not found` });
});

// ── Centralized error handler (must be last) ──────────────────────────────────
app.use(errorHandler);

module.exports = app;
