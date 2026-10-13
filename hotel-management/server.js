const express = require('express');
const http = require('http');
const path = require('path');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-memory Database
let rooms = [
  { id: '101', number: '101', type: 'Deluxe Suite', price: 220, capacity: 2, status: 'Available', floor: 1 },
  { id: '102', number: '102', type: 'Deluxe Suite', price: 220, capacity: 2, status: 'Occupied', floor: 1 },
  { id: '103', number: '103', type: 'Single Room', price: 120, capacity: 1, status: 'Available', floor: 1 },
  { id: '201', number: '201', type: 'Executive Penthouse', price: 450, capacity: 4, status: 'Reserved', floor: 2 },
  { id: '202', number: '202', type: 'Double Room', price: 180, capacity: 2, status: 'Maintenance', floor: 2 },
  { id: '203', number: '203', type: 'Executive Penthouse', price: 450, capacity: 4, status: 'Available', floor: 2 }
];

let reservations = [
  {
    id: 'res-1001',
    guestName: 'Victoria Sterling',
    guestEmail: 'v.sterling@apex.io',
    guestPhone: '+1 555-019-8234',
    roomId: '102',
    roomNumber: '102',
    roomType: 'Deluxe Suite',
    checkInDate: '2025-05-10',
    checkOutDate: '2025-05-15',
    status: 'Checked-In',
    totalAmount: 1100,
    paidAmount: 1100,
    paymentStatus: 'Paid',
    createdAt: new Date().toISOString()
  },
  {
    id: 'res-1002',
    guestName: 'Arthur Dent',
    guestEmail: 'arthur.dent@galaxy.net',
    guestPhone: '+44 20 7946 0912',
    roomId: '201',
    roomNumber: '201',
    roomType: 'Executive Penthouse',
    checkInDate: '2025-05-12',
    checkOutDate: '2025-05-16',
    status: 'Confirmed',
    totalAmount: 1800,
    paidAmount: 600,
    paymentStatus: 'Partial',
    createdAt: new Date().toISOString()
  }
];

let billingInvoices = [
  {
    invoiceId: 'INV-8001',
    reservationId: 'res-1001',
    guestName: 'Victoria Sterling',
    roomNumber: '102',
    items: [
      { desc: 'Room Stay (5 nights @ $220/night)', amount: 1100 },
      { desc: 'Gourmet In-Room Dining', amount: 85 },
      { desc: 'Spa & Wellness Access', amount: 120 }
    ],
    subtotal: 1305,
    tax: 130.5,
    total: 1435.5,
    paid: 1435.5,
    status: 'Paid',
    paymentMethod: 'Credit Card (Visa)',
    issuedAt: new Date().toISOString()
  }
];

let staffTasks = [
  {
    id: 'st-501',
    title: 'Sanitize & Prepare Minibar for Room 101',
    department: 'Housekeeping',
    assignee: 'Maria Santos',
    roomNumber: '101',
    priority: 'High',
    status: 'In Progress',
    notes: 'Guest check-in expected at 2:00 PM',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'st-502',
    title: 'HVAC Temperature Sensor Calibration',
    department: 'Maintenance',
    assignee: 'David Kim',
    roomNumber: '202',
    priority: 'Urgent',
    status: 'Pending',
    notes: 'Thermostat reported variance of +4C',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'st-503',
    title: 'Deliver Extra Pillows & Towels',
    department: 'Concierge',
    assignee: 'Liam Hayes',
    roomNumber: '102',
    priority: 'Normal',
    status: 'Completed',
    notes: 'Delivered to Mrs. Sterling',
    updatedAt: new Date().toISOString()
  }
];

// Broadcast WebSocket message to all connected clients
function broadcast(type, payload) {
  const message = JSON.stringify({ type, payload, timestamp: new Date().toISOString() });
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// WebSocket connection handling
wss.on('connection', ws => {
  // Send initial snapshot on connect
  ws.send(JSON.stringify({
    type: 'INIT_STATE',
    payload: {
      rooms,
      reservations,
      billingInvoices,
      staffTasks
    },
    timestamp: new Date().toISOString()
  }));

  ws.on('message', message => {
    try {
      const data = JSON.parse(message);
      if (data.type === 'PING') {
        ws.send(JSON.stringify({ type: 'PONG', timestamp: new Date().toISOString() }));
      }
    } catch (e) {
      // ignore
    }
  });
});

// REST API Endpoints
// Initial state
app.get('/api/state', (req, res) => {
  res.json({ rooms, reservations, billingInvoices, staffTasks });
});

// Rooms
app.get('/api/rooms', (req, res) => res.json(rooms));

// Reservations & Booking
app.post('/api/reservations', (req, res) => {
  const { guestName, guestEmail, guestPhone, roomId, checkInDate, checkOutDate, paidAmount } = req.body;
  const room = rooms.find(r => r.id === roomId);
  if (!room) return res.status(404).json({ error: 'Room not found' });
  if (room.status === 'Occupied' || room.status === 'Maintenance') {
    return res.status(400).json({ error: `Room ${room.number} is currently ${room.status}` });
  }

  // Calculate nights & total
  const d1 = new Date(checkInDate);
  const d2 = new Date(checkOutDate);
  const diffDays = Math.max(1, Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24)));
  const totalAmount = diffDays * room.price;
  const paid = parseFloat(paidAmount) || 0;

  const newRes = {
    id: 'res-' + Date.now().toString().slice(-5),
    guestName,
    guestEmail,
    guestPhone,
    roomId: room.id,
    roomNumber: room.number,
    roomType: room.type,
    checkInDate,
    checkOutDate,
    status: 'Confirmed',
    totalAmount,
    paidAmount: paid,
    paymentStatus: paid >= totalAmount ? 'Paid' : (paid > 0 ? 'Partial' : 'Unpaid'),
    createdAt: new Date().toISOString()
  };

  room.status = 'Reserved';
  reservations.push(newRes);

  // Auto-generate invoice
  const newInv = {
    invoiceId: 'INV-' + (8000 + billingInvoices.length + 1),
    reservationId: newRes.id,
    guestName: newRes.guestName,
    roomNumber: newRes.roomNumber,
    items: [{ desc: `${room.type} (${diffDays} night(s) @ $${room.price})`, amount: totalAmount }],
    subtotal: totalAmount,
    tax: +(totalAmount * 0.1).toFixed(2),
    total: +(totalAmount * 1.1).toFixed(2),
    paid: paid,
    status: paid >= totalAmount * 1.1 ? 'Paid' : (paid > 0 ? 'Partial' : 'Unpaid'),
    paymentMethod: paid > 0 ? 'Credit Card' : 'Pending',
    issuedAt: new Date().toISOString()
  };
  billingInvoices.push(newInv);

  broadcast('BOOKING_CREATED', { reservation: newRes, room, invoice: newInv });
  res.status(201).json(newRes);
});

// Check-in
app.post('/api/reservations/:id/checkin', (req, res) => {
  const reservation = reservations.find(r => r.id === req.params.id);
  if (!reservation) return res.status(404).json({ error: 'Reservation not found' });
  const room = rooms.find(r => r.id === reservation.roomId);
  
  reservation.status = 'Checked-In';
  if (room) room.status = 'Occupied';

  // Add staff task to notify housekeeping
  const staffNotice = {
    id: 'st-' + Date.now().toString().slice(-4),
    title: `Welcome packet & luggage dispatch for Room ${reservation.roomNumber}`,
    department: 'Concierge',
    assignee: 'On Duty Desk',
    roomNumber: reservation.roomNumber,
    priority: 'Normal',
    status: 'In Progress',
    notes: `Guest ${reservation.guestName} completed check-in`,
    updatedAt: new Date().toISOString()
  };
  staffTasks.unshift(staffNotice);

  broadcast('CHECK_IN', { reservation, room, staffTask: staffNotice });
  res.json({ reservation, room });
});

// Check-out
app.post('/api/reservations/:id/checkout', (req, res) => {
  const reservation = reservations.find(r => r.id === req.params.id);
  if (!reservation) return res.status(404).json({ error: 'Reservation not found' });
  const room = rooms.find(r => r.id === reservation.roomId);
  
  reservation.status = 'Checked-Out';
  if (room) room.status = 'Available';

  // Add housekeeping turnaround task
  const turnTask = {
    id: 'st-' + Date.now().toString().slice(-4),
    title: `Complete Room Turnover & Deep Clean Room ${reservation.roomNumber}`,
    department: 'Housekeeping',
    assignee: 'Housekeeping Team',
    roomNumber: reservation.roomNumber,
    priority: 'High',
    status: 'Pending',
    notes: `Guest ${reservation.guestName} checked out`,
    updatedAt: new Date().toISOString()
  };
  staffTasks.unshift(turnTask);

  broadcast('CHECK_OUT', { reservation, room, staffTask: turnTask });
  res.json({ reservation, room });
});

// Cancel Reservation
app.delete('/api/reservations/:id', (req, res) => {
  const idx = reservations.findIndex(r => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Reservation not found' });
  const [removed] = reservations.splice(idx, 1);
  const room = rooms.find(r => r.id === removed.roomId);
  if (room && room.status === 'Reserved') {
    room.status = 'Available';
  }

  broadcast('BOOKING_CANCELLED', { reservationId: removed.id, roomId: removed.roomId });
  res.json({ message: 'Reservation cancelled', reservation: removed });
});

// Billing endpoints
app.get('/api/billing', (req, res) => res.json(billingInvoices));

app.post('/api/billing/:id/pay', (req, res) => {
  const inv = billingInvoices.find(i => i.invoiceId === req.params.id);
  if (!inv) return res.status(404).json({ error: 'Invoice not found' });
  const { amount, method } = req.body;
  inv.paid += parseFloat(amount) || (inv.total - inv.paid);
  if (inv.paid >= inv.total) {
    inv.status = 'Paid';
  } else {
    inv.status = 'Partial';
  }
  if (method) inv.paymentMethod = method;

  broadcast('BILLING_UPDATED', { invoice: inv });
  res.json(inv);
});

// Add service charge to invoice
app.post('/api/billing/:id/charge', (req, res) => {
  const inv = billingInvoices.find(i => i.invoiceId === req.params.id);
  if (!inv) return res.status(404).json({ error: 'Invoice not found' });
  const { desc, amount } = req.body;
  inv.items.push({ desc, amount: parseFloat(amount) });
  inv.subtotal += parseFloat(amount);
  inv.tax = +(inv.subtotal * 0.1).toFixed(2);
  inv.total = +(inv.subtotal + inv.tax).toFixed(2);
  if (inv.paid < inv.total) inv.status = inv.paid > 0 ? 'Partial' : 'Unpaid';

  broadcast('BILLING_UPDATED', { invoice: inv });
  res.json(inv);
});

// Staff coordination endpoints
app.get('/api/staff-tasks', (req, res) => res.json(staffTasks));

app.post('/api/staff-tasks', (req, res) => {
  const { title, department, assignee, roomNumber, priority, notes } = req.body;
  const task = {
    id: 'st-' + Date.now().toString().slice(-4),
    title,
    department: department || 'General',
    assignee: assignee || 'Unassigned',
    roomNumber: roomNumber || 'General',
    priority: priority || 'Normal',
    status: 'Pending',
    notes: notes || '',
    updatedAt: new Date().toISOString()
  };
  staffTasks.unshift(task);

  broadcast('STAFF_TASK_CREATED', { task });
  res.status(201).json(task);
});

app.patch('/api/staff-tasks/:id', (req, res) => {
  const task = staffTasks.find(t => t.id === req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  const { status, assignee, priority } = req.body;
  if (status) task.status = status;
  if (assignee) task.assignee = assignee;
  if (priority) task.priority = priority;
  task.updatedAt = new Date().toISOString();

  broadcast('STAFF_TASK_UPDATED', { task });
  res.json(task);
});

// Port fallback
const PORT = process.env.PORT || 4000;
if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`Hotel Management System backend running on http://localhost:${PORT}`);
  });
}

module.exports = { app, server };
