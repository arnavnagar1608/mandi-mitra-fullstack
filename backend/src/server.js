'use strict';

// Load environment variables from .env (local development only)
require('dotenv').config();

const app = require('./app');
const env = require('./config/env');

const PORT = env.port || 5000;

app.listen(PORT, () => {
  console.log(`\n🌾 Mandi Mitra backend running`);
  console.log(`   http://localhost:${PORT}/api/health`);
  console.log(`   Environment : ${env.isProduction ? 'production' : 'development'}`);
  console.log(`   SMS provider: ${env.smsProvider}`);
  console.log(`   Mock tokens : ${env.isProduction ? 'DISABLED ✗' : 'ENABLED ✓'}\n`);
});
