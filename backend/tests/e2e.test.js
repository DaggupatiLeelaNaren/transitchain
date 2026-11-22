import test from 'node:test';
import assert from 'node:assert';
import axios from 'axios';

const BASE_URL = 'http://127.0.0.1:5000/api';

test('TransitChain Full End-to-End Workflow Verification', async (t) => {
  const timestamp = Date.now();
  const testEmail = `commuter_${timestamp}@transitchain.com`;
  const testPassword = 'Password@TransitChain2026!';
  let userToken = '';
  let adminToken = '';
  let journeyId = '';
  let bookingId = '';
  let receivedOtp = '';

  await t.test('1. User Registration & OTP Issuance', async () => {
    const res = await axios.post(`${BASE_URL}/auth/register`, {
      name: 'E2E Commuter',
      email: testEmail,
      password: testPassword,
      confirmPassword: testPassword,
      termsAccepted: true
    });
    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.data.success, true);
    assert.ok(res.data.data.userId);
    receivedOtp = res.data.data.debugOtp;
    assert.ok(receivedOtp, 'OTP was generated');
  });

  await t.test('2. Email OTP Verification', async () => {
    const res = await axios.post(`${BASE_URL}/auth/verify-email`, {
      email: testEmail,
      otp: receivedOtp
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.data.isVerified, true);
  });

  await t.test('3. User Login', async () => {
    const res = await axios.post(`${BASE_URL}/auth/login`, {
      email: testEmail,
      password: testPassword
    });
    assert.strictEqual(res.status, 200);
    assert.ok(res.data.data.token);
    userToken = res.data.data.token;
  });

  await t.test('4. Multimodal Journey Search (Indira Nagar to KPHB)', async () => {
    const res = await axios.post(
      `${BASE_URL}/journeys/search`,
      {
        origin: { lat: 17.4435, lon: 78.3582, name: 'Indira Nagar - Gachibowli' },
        destination: { lat: 17.4975, lon: 78.4014, name: 'KPHB Colony' },
        departureTime: '08:30',
        modes: ['bus', 'metro', 'walk'],
        optimizationPreference: 'balanced'
      },
      { headers: { Authorization: `Bearer ${userToken}` } }
    );
    assert.strictEqual(res.status, 200);
    assert.ok(res.data.data.alternatives.length > 0);
    assert.ok(res.data.data.paretoCount >= 1);
    journeyId = res.data.data.journeyId;
  });

  await t.test('5. Save Journey as Favorite', async () => {
    const res = await axios.post(
      `${BASE_URL}/journeys/${journeyId}/favorite`,
      {},
      { headers: { Authorization: `Bearer ${userToken}` } }
    );
    assert.strictEqual(res.status, 200);
    assert.ok(res.data.data._id);
  });

  await t.test('6. Book Trip via Provider Adapter', async () => {
    const res = await axios.post(
      `${BASE_URL}/bookings`,
      {
        journeyId,
        providerCode: 'TGSRTC',
        routeShortName: '195W',
        fromStopName: 'Indira Nagar',
        toStopName: 'KPHB Colony',
        totalFare: 35.0,
        passengerCount: 1
      },
      { headers: { Authorization: `Bearer ${userToken}` } }
    );
    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.data.data.status, 'confirmed');
    assert.ok(res.data.data.bookingReference.startsWith('TC-TGSRTC-'));
    bookingId = res.data.data._id;
  });

  await t.test('7. Fetch Active Bookings & QR Ticket', async () => {
    const res = await axios.get(`${BASE_URL}/bookings/${bookingId}`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.data.status, 'confirmed');
    assert.ok(res.data.data.qrPayload);
  });

  await t.test('8. Real-time Journey Tracking Query', async () => {
    const res = await axios.get(`${BASE_URL}/tracking/${journeyId}`);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.data.journeyId, journeyId);
  });

  await t.test('9. Support Chatbot Query about Bookings', async () => {
    const res = await axios.post(
      `${BASE_URL}/chat/message`,
      { text: 'Check my booking status' },
      { headers: { Authorization: `Bearer ${userToken}` } }
    );
    assert.strictEqual(res.status, 200);
    assert.ok(res.data.data.text.includes('booking'));
  });

  await t.test('10. Cancel Booking and Verify Refund', async () => {
    const res = await axios.post(
      `${BASE_URL}/bookings/${bookingId}/cancel`,
      { reason: 'User requested cancellation' },
      { headers: { Authorization: `Bearer ${userToken}` } }
    );
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.data.status, 'cancelled');
    assert.strictEqual(res.data.data.refundStatus, 'processed');
  });

  await t.test('11. Admin Login & Authorization', async () => {
    const res = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@transitchain.com',
      password: 'Admin@TransitChain2026!'
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.data.user.role, 'admin');
    adminToken = res.data.data.token;
  });

  await t.test('12. Admin Dashboard Live Stats', async () => {
    const res = await axios.get(`${BASE_URL}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.strictEqual(res.status, 200);
    assert.ok(res.data.data.totalUsers >= 3);
    assert.ok(res.data.data.totalBookings >= 1);
  });

  await t.test('13. Admin Run Autonomous MAPE-K Cycle', async () => {
    const res = await axios.post(
      `${BASE_URL}/admin/mapek/run`,
      {},
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.data.cycle, 'MAPE-K Complete');
    assert.ok(res.data.data.executedActions.length > 0);
  });
});
