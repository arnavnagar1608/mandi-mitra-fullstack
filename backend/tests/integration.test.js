'use strict';

/**
 * Mandi Mitra Backend — Integration Test Suite
 * 
 * Tests all API endpoints against the live Firestore database using mock tokens.
 * Run: node tests/integration.test.js
 * 
 * Requirements:
 *  - Server must be running on PORT 5000 (node src/server.js)
 *  - NODE_ENV must be 'development' (mock tokens enabled)
 *  - Firebase must be accessible (live Firestore)
 */

const http = require('http');

const BASE_URL = 'http://localhost:5000';
const MOCK_TOKEN_F1 = 'mock-token-f1';
const AUTH_HEADER = { Authorization: `Bearer ${MOCK_TOKEN_F1}`, 'Content-Type': 'application/json' };
const JSON_HEADER = { 'Content-Type': 'application/json' };

let passed = 0;
let failed = 0;
const failures = [];

// ── HTTP helper ──────────────────────────────────────────────────────────────

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'localhost',
      port: 5000,
      path,
      method,
      headers: {
        ...headers,
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

// ── Assertion helpers ─────────────────────────────────────────────────────────

function assert(name, condition, detail = '') {
  if (condition) {
    console.log(`  ✓ ${name}`);
    passed++;
  } else {
    console.error(`  ✗ ${name}${detail ? ' — ' + detail : ''}`);
    failed++;
    failures.push(`${name}${detail ? ': ' + detail : ''}`);
  }
}

function assertStatus(name, res, expectedStatus) {
  assert(`${name} — status ${expectedStatus}`, res.status === expectedStatus,
    `got ${res.status}: ${JSON.stringify(res.body?.error || res.body).slice(0, 120)}`);
}

function assertSuccess(name, res) {
  assertStatus(name, res, 200);
  assert(`${name} — success=true`, res.body?.success === true, JSON.stringify(res.body).slice(0, 120));
}

// ── Test groups ───────────────────────────────────────────────────────────────

async function testHealth() {
  console.log('\n[Health]');
  const res = await request('GET', '/api/health');
  assertSuccess('GET /api/health', res);
  assert('health.data.status = ok', res.body?.data?.status === 'ok');
}

async function testAuthEndpoints() {
  console.log('\n[Auth]');

  // Send OTP (mock)
  const sendRes = await request('POST', '/api/auth/send-otp',
    { identifier: '8888888888', method: 'mobile' }, JSON_HEADER);
  assertSuccess('POST /api/auth/send-otp', sendRes);
  assert('simulatedOtp present in dev', typeof sendRes.body?.data?.simulatedOtp === 'string');

  // Verify wrong OTP
  const wrongRes = await request('POST', '/api/auth/verify-otp',
    { identifier: '8888888888', otp: '9999' }, JSON_HEADER);
  assertStatus('POST /api/auth/verify-otp (wrong OTP) → 401', wrongRes, 401);
  assert('wrong OTP code = INVALID_OTP', wrongRes.body?.error?.code === 'INVALID_OTP');

  // Verify correct OTP
  const correctRes = await request('POST', '/api/auth/verify-otp',
    { identifier: '8888888888', otp: '1234' }, JSON_HEADER);
  assertSuccess('POST /api/auth/verify-otp (correct OTP)', correctRes);
  assert('isNewFarmer flag present', typeof correctRes.body?.data?.isNewFarmer === 'boolean');

  // Mock token (dev)
  const mockRes = await request('POST', '/api/auth/mock-token', { uid: 'f1' }, JSON_HEADER);
  assertSuccess('POST /api/auth/mock-token (dev)', mockRes);
  assert('token = mock-token-f1', mockRes.body?.data?.token === 'mock-token-f1');

  // Unauthenticated request
  const unauthedRes = await request('GET', '/api/farmers/me');
  assertStatus('GET /api/farmers/me (no token) → 401', unauthedRes, 401);
}

async function testFarmerEndpoints() {
  console.log('\n[Farmers]');

  const meRes = await request('GET', '/api/farmers/me', null, AUTH_HEADER);
  assertSuccess('GET /api/farmers/me', meRes);
  assert('farmer.id = f1', meRes.body?.data?.farmer?.id === 'f1');
  assert('farmer has name', !!meRes.body?.data?.farmer?.name);
  assert('aadhaarLast4 field present', !!meRes.body?.data?.farmer?.aadhaarLast4);

  const notifRes = await request('GET', '/api/farmers/me/notifications', null, AUTH_HEADER);
  assertSuccess('GET /api/farmers/me/notifications', notifRes);
  assert('notifications is array', Array.isArray(notifRes.body?.data?.notifications));
}

async function testCenterEndpoints() {
  console.log('\n[Centers]');

  const listRes = await request('GET', '/api/centers');
  assertSuccess('GET /api/centers', listRes);
  assert('centers array has items', Array.isArray(listRes.body?.data?.centers)
    && listRes.body.data.centers.length > 0);
  assert('center has distance field', typeof listRes.body?.data?.centers[0]?.distance === 'number');

  const singleRes = await request('GET', '/api/centers/c1');
  assertSuccess('GET /api/centers/c1', singleRes);
  assert('center.id = c1', singleRes.body?.data?.center?.id === 'c1');

  const queueRes = await request('GET', '/api/centers/c1/queue');
  assertSuccess('GET /api/centers/c1/queue', queueRes);

  const slotsRes = await request('GET', '/api/centers/c1/slots?date=2026-09-08');
  assertSuccess('GET /api/centers/c1/slots', slotsRes);
  assert('slots has morning/afternoon/evening', 
    slotsRes.body?.data?.morning !== undefined &&
    slotsRes.body?.data?.afternoon !== undefined &&
    slotsRes.body?.data?.evening !== undefined);
}

async function testSlotEndpoints() {
  console.log('\n[Slots]');

  const slotsRes = await request('GET', '/api/slots?centerId=c1&date=2026-09-08');
  assertSuccess('GET /api/slots', slotsRes);
  assert('slots array present', Array.isArray(slotsRes.body?.data?.slots));

  const singleSlotRes = await request('GET', '/api/slots/c1-2026-09-08-2');
  assertSuccess('GET /api/slots/:slotId', singleSlotRes);
  assert('slot.id correct', singleSlotRes.body?.data?.slot?.id === 'c1-2026-09-08-2');
}

async function testBookingEndpoints() {
  console.log('\n[Bookings]');

  const myRes = await request('GET', '/api/bookings/my', null, AUTH_HEADER);
  assertSuccess('GET /api/bookings/my', myRes);
  assert('bookings is array with items', Array.isArray(myRes.body?.data?.bookings)
    && myRes.body.data.bookings.length > 0);

  const byIdRes = await request('GET', '/api/bookings/b1', null, AUTH_HEADER);
  assertSuccess('GET /api/bookings/b1', byIdRes);
  assert('booking.id = b1', byIdRes.body?.data?.booking?.id === 'b1');
  assert('booking.farmerId = f1', byIdRes.body?.data?.booking?.farmerId === 'f1');

  const queueRes = await request('GET', '/api/bookings/b1/queue-status', null, AUTH_HEADER);
  assertSuccess('GET /api/bookings/b1/queue-status', queueRes);
  assert('queueStatus has myToken', typeof queueRes.body?.data?.queueStatus?.myToken === 'number');
  assert('queueStatus has procurementStage', typeof queueRes.body?.data?.queueStatus?.procurementStage === 'string');

  // Cancel a completed booking — should fail with CANNOT_CANCEL
  const cancelRes = await request('POST', '/api/bookings/b3/cancel', {}, AUTH_HEADER);
  assertStatus('POST /api/bookings/b3/cancel (completed→reject) → 409', cancelRes, 409);
  assert('cancel error code = CANNOT_CANCEL', cancelRes.body?.error?.code === 'CANNOT_CANCEL');
}

async function testCropEndpoints() {
  console.log('\n[Crops]');

  const listRes = await request('GET', '/api/crops');
  assertSuccess('GET /api/crops', listRes);
  assert('crops array has items', Array.isArray(listRes.body?.data?.crops)
    && listRes.body.data.crops.length > 0);
  assert('crop has mspRate', typeof listRes.body?.data?.crops[0]?.mspRate === 'number');

  const singleRes = await request('GET', '/api/crops/wheat');
  if (singleRes.status === 200) {
    assertSuccess('GET /api/crops/wheat', singleRes);
  } else {
    // doc ID may differ — just verify list works
    assert('GET /api/crops/wheat → 200 or 404', [200, 404].includes(singleRes.status));
  }
}

async function testTestimonialEndpoints() {
  console.log('\n[Testimonials]');

  const listRes = await request('GET', '/api/testimonials');
  assertSuccess('GET /api/testimonials', listRes);
  assert('testimonials array present', Array.isArray(listRes.body?.data?.testimonials));
}

async function testAdminEndpoints() {
  console.log('\n[Admin & Officer Desk]');

  // 1. Unauthenticated roster access should be rejected
  const unauthedRoster = await request('GET', '/api/admin/centers/c1/roster');
  assertStatus('GET /api/admin/centers/c1/roster (no token) → 401', unauthedRoster, 401);

  // 2. Invalid officer login should be rejected
  const invalidLogin = await request('POST', '/api/admin/login', {
    officerId: 'OFFICER-MP-001',
    password: 'wrong_password_xyz'
  }, JSON_HEADER);
  assertStatus('POST /api/admin/login (wrong password) → 401', invalidLogin, 401);

  // 3. Valid officer login
  const validLogin = await request('POST', '/api/admin/login', {
    officerId: 'OFFICER-MP-001',
    password: 'Mandi@Officer2026'
  }, JSON_HEADER);
  assertSuccess('POST /api/admin/login (correct credentials)', validLogin);
  assert('officer token returned', typeof validLogin.body?.data?.token === 'string');
  assert('officer profile returned', validLogin.body?.data?.officer?.officerId === 'OFFICER-MP-001');

  const officerToken = validLogin.body?.data?.token;
  const officerHeader = {
    'Authorization': `Bearer ${officerToken}`,
    'Content-Type': 'application/json'
  };

  // 4. Authorized roster query with officer token
  const rosterRes = await request('GET', '/api/admin/centers/c1/roster', null, officerHeader);
  assertSuccess('GET /api/admin/centers/c1/roster (officer token)', rosterRes);
  assert('roster array present', Array.isArray(rosterRes.body?.data?.roster));
}

async function test404() {
  console.log('\n[404 / Error handling]');

  const notFoundRes = await request('GET', '/api/nonexistent-route');
  assertStatus('GET /api/nonexistent → 404', notFoundRes, 404);
  assert('404 success=false', notFoundRes.body?.success === false);
}

// ── Main runner ───────────────────────────────────────────────────────────────

async function main() {
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║  Mandi Mitra Backend — Integration Tests     ║');
  console.log('╚══════════════════════════════════════════════╝');
  console.log(`  Target: ${BASE_URL}`);

  try {
    await testHealth();
    await testAuthEndpoints();
    await testFarmerEndpoints();
    await testCenterEndpoints();
    await testSlotEndpoints();
    await testBookingEndpoints();
    await testCropEndpoints();
    await testTestimonialEndpoints();
    await testAdminEndpoints();
    await test404();
  } catch (err) {
    console.error('\nFATAL:', err.message);
    console.error('Is the server running on port 5000?');
    process.exit(1);
  }

  console.log('\n══════════════════════════════════════════════════');
  console.log(`  Results: ${passed} passed, ${failed} failed`);
  if (failures.length) {
    console.log('\n  Failures:');
    failures.forEach((f) => console.log(`    - ${f}`));
  }
  console.log('══════════════════════════════════════════════════\n');
  process.exit(failed > 0 ? 1 : 0);
}

main();
