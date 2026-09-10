'use strict';

/**
 * Creates missing Firestore composite indexes via the Firestore Admin REST API.
 * Uses the service account key for authentication.
 * 
 * Missing indexes:
 * 1. payments: farmerId ASC + processedAt DESC
 * 2. procurements: farmerId ASC + createdAt DESC  (verify it exists)
 */

const admin = require('firebase-admin');
const https = require('https');
const path = require('path');

const serviceAccount = require(path.join(__dirname, '../serviceAccountKey.json'));

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

const PROJECT_ID = 'mandi-mitr-9db67';
const DATABASE_ID = '(default)';

async function getAccessToken() {
  const token = await admin.app().options.credential.getAccessToken();
  return token.access_token;
}

async function createIndex(accessToken, collectionGroup, fields) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      queryScope: 'COLLECTION',
      fields: fields.map(f => ({
        fieldPath: f.fieldPath,
        order: f.order,
      })),
    });

    const options = {
      hostname: 'firestore.googleapis.com',
      path: `/v1/projects/${PROJECT_ID}/databases/${DATABASE_ID}/collectionGroups/${collectionGroup}/indexes`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const parsed = JSON.parse(data);
        resolve({ status: res.statusCode, body: parsed });
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function listIndexes(accessToken, collectionGroup) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'firestore.googleapis.com',
      path: `/v1/projects/${PROJECT_ID}/databases/${DATABASE_ID}/collectionGroups/${collectionGroup}/indexes`,
      method: 'GET',
      headers: { 'Authorization': `Bearer ${accessToken}` },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    });
    req.on('error', reject);
    req.end();
  });
}

async function main() {
  console.log('Getting access token...');
  const token = await getAccessToken();

  // Check existing procurements indexes
  console.log('\n--- Checking procurements indexes ---');
  const procIdx = await listIndexes(token, 'procurements');
  console.log(JSON.stringify(procIdx?.indexes?.map(i => ({
    state: i.state,
    fields: i.fields,
  })), null, 2));

  // Check existing payments indexes
  console.log('\n--- Checking payments indexes ---');
  const payIdx = await listIndexes(token, 'payments');
  console.log(JSON.stringify(payIdx?.indexes?.map(i => ({
    state: i.state,
    fields: i.fields,
  })), null, 2));

  // Create missing: payments farmerId + processedAt
  console.log('\n--- Creating payments (farmerId + processedAt DESC) index ---');
  const result = await createIndex(token, 'payments', [
    { fieldPath: 'farmerId', order: 'ASCENDING' },
    { fieldPath: 'processedAt', order: 'DESCENDING' },
  ]);
  console.log(`Status: ${result.status}`);
  console.log(JSON.stringify(result.body, null, 2));

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
