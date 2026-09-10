const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const env = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  
  // OTP Strategy
  smsProvider: process.env.SMS_PROVIDER || 'mock',
  mockOtpDefault: process.env.MOCK_OTP_DEFAULT || '1234',

  // Firebase
  firebaseProjectId: process.env.FIREBASE_PROJECT_ID || 'mandi-mitr-9db67',
  firebaseClientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  firebasePrivateKey: process.env.FIREBASE_PRIVATE_KEY 
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    : undefined
};

module.exports = env;
