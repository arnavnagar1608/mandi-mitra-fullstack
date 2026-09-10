const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');
const env = require('./env');

if (!admin.apps.length) {
  let credential;

  // 1. Check for local serviceAccountKey.json
  const serviceAccountPath = path.join(__dirname, '../../serviceAccountKey.json');
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = require(serviceAccountPath);
    credential = admin.credential.cert(serviceAccount);
  } 
  // 2. Otherwise use environment variables (Vercel / Production deployment)
  else if (env.firebaseClientEmail && env.firebasePrivateKey) {
    credential = admin.credential.cert({
      projectId: env.firebaseProjectId,
      clientEmail: env.firebaseClientEmail,
      privateKey: env.firebasePrivateKey
    });
  } 
  // 3. Fallback to default application credentials if running in GCP
  else {
    credential = admin.credential.applicationDefault();
  }

  admin.initializeApp({
    credential,
    projectId: env.firebaseProjectId
  });
}

const db = admin.firestore();
const auth = admin.auth();

module.exports = {
  admin,
  db,
  auth
};
