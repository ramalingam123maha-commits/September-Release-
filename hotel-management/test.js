const http = require('http');
const assert = require('assert');
const WebSocket = require('ws');
const { app, server } = require('./server');

const TEST_PORT = 4199;

server.listen(TEST_PORT, async () => {
  console.log(`Test server running on port ${TEST_PORT}`);

  try {
    // 1. Test GET /api/state
    const stateRes = await fetch(`http://localhost:${TEST_PORT}/api/state`);
    assert.strictEqual(stateRes.status, 200, 'GET /api/state should return 200');
    const stateData = await stateRes.json();
    assert(Array.isArray(stateData.rooms), 'Rooms should be an array');
    assert(Array.isArray(stateData.reservations), 'Reservations should be an array');
    console.log('✓ GET /api/state verified');

    // 2. Test WebSocket connection & broadcast
    const ws = new WebSocket(`ws://localhost:${TEST_PORT}`);
    let wsInitReceived = false;

    await new Promise((resolve, reject) => {
      ws.on('open', () => {
        console.log('✓ WebSocket client connected successfully');
      });
      ws.on('message', (msg) => {
        const parsed = JSON.parse(msg);
        if (parsed.type === 'INIT_STATE') {
          wsInitReceived = true;
          resolve();
        }
      });
      ws.on('error', reject);
    });
    assert(wsInitReceived, 'Should receive INIT_STATE message from WebSocket server');

    // 3. Test Room Booking via API and verify WS broadcast
    const bookingPromise = new Promise((resolve) => {
      ws.on('message', (msg) => {
        const parsed = JSON.parse(msg);
        if (parsed.type === 'BOOKING_CREATED') {
          assert.strictEqual(parsed.payload.reservation.guestName, 'Jane Doe');
          resolve();
        }
      });
    });

    const createRes = await fetch(`http://localhost:${TEST_PORT}/api/reservations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        guestName: 'Jane Doe',
        guestEmail: 'jane@example.com',
        guestPhone: '+1-555-0101',
        roomId: '101',
        checkInDate: '2025-06-01',
        checkOutDate: '2025-06-03',
        paidAmount: 440
      })
    });
    assert.strictEqual(createRes.status, 201, 'Booking creation should return 201');
    const createdData = await createRes.json();
    await bookingPromise;
    console.log('✓ Booking created and WebSocket broadcast verified');

    // 4. Test Check-in
    const checkinRes = await fetch(`http://localhost:${TEST_PORT}/api/reservations/${createdData.id}/checkin`, {
      method: 'POST'
    });
    assert.strictEqual(checkinRes.status, 200);
    const checkinData = await checkinRes.json();
    assert.strictEqual(checkinData.reservation.status, 'Checked-In');
    console.log('✓ Guest check-in verified');

    // 5. Test Check-out
    const checkoutRes = await fetch(`http://localhost:${TEST_PORT}/api/reservations/${createdData.id}/checkout`, {
      method: 'POST'
    });
    assert.strictEqual(checkoutRes.status, 200);
    const checkoutData = await checkoutRes.json();
    assert.strictEqual(checkoutData.reservation.status, 'Checked-Out');
    console.log('✓ Guest check-out verified');

    // 6. Test Staff Task creation
    const staffRes = await fetch(`http://localhost:${TEST_PORT}/api/staff-tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Inspect Penthouse Jacuzzi',
        department: 'Maintenance',
        assignee: 'Leo Vance',
        roomNumber: '201',
        priority: 'High',
        notes: 'Pre-arrival check'
      })
    });
    assert.strictEqual(staffRes.status, 201);
    console.log('✓ Staff Task dispatch verified');

    ws.close();
    server.close();
    console.log('\nAll Hotel Management tests passed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Test failed:', err);
    process.exit(1);
  }
});
