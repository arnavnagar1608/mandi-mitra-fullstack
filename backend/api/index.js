'use strict';

// Vercel serverless entrypoint.
// Vercel runs this file as a serverless function; it does NOT call app.listen().
// Environment variables are injected by Vercel's dashboard — NOT from .env file.

const app = require('../src/app');

module.exports = app;
