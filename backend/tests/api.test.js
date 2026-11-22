import test from 'node:test';
import assert from 'node:assert';
import axios from 'axios';

const BASE_URL = 'http://127.0.0.1:5000/api';

test('TransitChain Backend API Test Suite', async (t) => {
  let userToken = '';
  let adminToken = '';
  let testBookingId = '';
  let testJourneyId = '';

  await t.test('1. Health check returns 200 and healthy status', async () => {
    const res = await axios.get(`${BASE_URL}/health`);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.data.status, 'healthy');
  });

  await t.test('2. User login with valid credentials returns JWT token', async () => {
    const res = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'user@transitchain.com',
      password: 'User@TransitChain2026!'
    });
    assert.strictEqual(res.status, 200);
    assert.ok(res.data.data.token);
    userToken = res.data.data.token;
  });

  await t.test('3. Admin login with admin credentials returns admin token', async () => {
    const res = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@transitchain.com',
      password: 'Admin@TransitChain2026!'
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.data.user.role, 'admin');
    adminToken = res.data.data.token;
  });

  await t.test('4. Fetch current user profile with token', async () => {
    const res = await axios.get(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.data.user.email, 'user@transitchain.com');
  });

  await t.test('5. Providers endpoint returns TGSRTC and HMRL', async () => {
    const res = await axios.get(`${BASE_URL}/providers`);
    assert.strictEqual(res.status, 200);
    assert.ok(res.data.data.length >= 2);
    const codes = res.data.data.map(p => p.code);
    assert.ok(codes.includes('TGSRTC'));
    assert.ok(codes.includes('HMRL'));
  });

  await t.test('6. Stops endpoint returns multimodal stops', async () => {
    const res = await axios.get(`${BASE_URL}/stops`);
    assert.strictEqual(res.status, 200);
    assert.ok(res.data.data.length >= 10);
  });

  await t.test('7. Search journeys from Indira Nagar to KPHB', async () => {
    const res = await axios.post(`${BASE_URL}/journeys/search`, {
      origin: { lat: 17.4435, lon: 78.3582, name: 'Indira Nagar - Gachibowli' },
      destination: { lat: 17.4975, lon: 78.4014, name: 'KPHB Colony' },
      departureTime: '08:30',
      modes: ['bus', 'metro', 'walk'],
      optimizationPreference: 'balanced'
    });
    assert.strictEqual(res.status, 200);
    assert.ok(res.data.data.alternatives.length > 0);
    testJourneyId = res.data.data.journeyId;
  });

  await t.test('8. Create booking via provider adapter', async () => {
    const res = await axios.post(`${BASE_URL}/bookings`, {
      journeyId: testJourneyId,
      providerCode: 'TGSRTC',
      routeShortName: '195W',
      fromStopName: 'Indira Nagar',
      toStopName: 'KPHB Colony',
      totalFare: 35.0,
      passengerCount: 1
    }, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.data.data.status, 'confirmed');
    assert.ok(res.data.data.ticketNumber);
    testBookingId = res.data.data._id;
  });

  await t.test('9. Fetch user bookings list', async () => {
    const res = await axios.get(`${BASE_URL}/bookings`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    assert.strictEqual(res.status, 200);
    assert.ok(res.data.data.length >= 1);
  });

  await t.test('10. Cancel booking with full refund processing', async () => {
    const res = await axios.post(`${BASE_URL}/bookings/${testBookingId}/cancel`, {
      reason: 'Plan changed'
    }, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.data.status, 'cancelled');
    assert.strictEqual(res.data.data.refundStatus, 'processed');
  });

  await t.test('11. Journey tracking endpoint', async () => {
    const res = await axios.get(`${BASE_URL}/tracking/${testJourneyId}`);
    assert.strictEqual(res.status, 200);
    assert.ok(res.data.data.journeyId);
  });

  await t.test('12. Nearby places discovery around KPHB', async () => {
    const res = await axios.get(`${BASE_URL}/places/nearby?lat=17.4975&lon=78.4014`);
    assert.strictEqual(res.status, 200);
    assert.ok(res.data.data.length > 0);
  });

  await t.test('13. Chatbot responds to route query', async () => {
    const res = await axios.post(`${BASE_URL}/chat/message`, {
      text: 'Tell me about the metro blue line'
    });
    assert.strictEqual(res.status, 200);
    assert.ok(res.data.data.text.includes('Raidurg'));
  });

  await t.test('14. Admin dashboard statistics', async () => {
    const res = await axios.get(`${BASE_URL}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.strictEqual(res.status, 200);
    assert.ok(res.data.data.totalUsers >= 2);
    assert.ok(res.data.data.activeProviders >= 2);
  });
});
