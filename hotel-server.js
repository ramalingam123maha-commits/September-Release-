import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import sqlite3 from 'sqlite3';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer } from 'ws';
import http from 'http';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 4000;
const WS_PORT = process.env.WS_PORT || 4001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Database setup
const db = new sqlite3.Database(':memory:');

// WebSocket server
const server = http.createServer(app);
const wss = new WebSocketServer({ port: WS_PORT });
const connectedClients = new Set();

// Broadcast message to all connected WebSocket clients
function broadcastMessage(data) {
  connectedClients.forEach(client => {
    if (client.readyState === 1) { // OPEN
      client.send(JSON.stringify(data));
    }
  });
}

// Initialize database
db.serialize(() => {
  db.run(`
    CREATE TABLE rooms (
      id TEXT PRIMARY KEY,
      roomNumber TEXT UNIQUE NOT NULL,
      type TEXT NOT NULL,
      capacity INTEGER,
      pricePerNight REAL,
      amenities TEXT,
      status TEXT DEFAULT 'available',
      lastCleaned TEXT,
      floorNumber INTEGER
    )
  `);

  db.run(`
    CREATE TABLE guests (
      id TEXT PRIMARY KEY,
      firstName TEXT NOT NULL,
      lastName TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      address TEXT,
      city TEXT,
      country TEXT,
      idType TEXT,
      idNumber TEXT,
      registrationDate TEXT NOT NULL,
      loyaltyPoints INTEGER DEFAULT 0
    )
  `);

  db.run(`
    CREATE TABLE reservations (
      id TEXT PRIMARY KEY,
      guestId TEXT NOT NULL,
      roomId TEXT NOT NULL,
      checkInDate TEXT NOT NULL,
      checkOutDate TEXT NOT NULL,
      numberOfGuests INTEGER,
      status TEXT DEFAULT 'confirmed',
      specialRequests TEXT,
      reservationDate TEXT NOT NULL,
      totalPrice REAL,
      FOREIGN KEY (guestId) REFERENCES guests(id),
      FOREIGN KEY (roomId) REFERENCES rooms(id)
    )
  `);

  db.run(`
    CREATE TABLE checkIns (
      id TEXT PRIMARY KEY,
      reservationId TEXT NOT NULL,
      guestId TEXT NOT NULL,
      roomId TEXT NOT NULL,
      checkInTime TEXT NOT NULL,
      keyCardIssued TEXT,
      notes TEXT,
      FOREIGN KEY (reservationId) REFERENCES reservations(id),
      FOREIGN KEY (guestId) REFERENCES guests(id),
      FOREIGN KEY (roomId) REFERENCES rooms(id)
    )
  `);

  db.run(`
    CREATE TABLE checkOuts (
      id TEXT PRIMARY KEY,
      reservationId TEXT NOT NULL,
      guestId TEXT NOT NULL,
      roomId TEXT NOT NULL,
      checkOutTime TEXT NOT NULL,
      roomCondition TEXT,
      damageReported TEXT,
      notes TEXT,
      FOREIGN KEY (reservationId) REFERENCES reservations(id),
      FOREIGN KEY (guestId) REFERENCES guests(id),
      FOREIGN KEY (roomId) REFERENCES rooms(id)
    )
  `);

  db.run(`
    CREATE TABLE billing (
      id TEXT PRIMARY KEY,
      reservationId TEXT NOT NULL,
      guestId TEXT NOT NULL,
      roomCharges REAL,
      extraCharges REAL,
      discounts REAL,
      totalAmount REAL,
      paymentMethod TEXT,
      paymentStatus TEXT DEFAULT 'pending',
      billingDate TEXT NOT NULL,
      FOREIGN KEY (reservationId) REFERENCES reservations(id),
      FOREIGN KEY (guestId) REFERENCES guests(id)
    )
  `);

  db.run(`
    CREATE TABLE staff (
      id TEXT PRIMARY KEY,
      firstName TEXT NOT NULL,
      lastName TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      department TEXT,
      position TEXT,
      shift TEXT,
      hireDate TEXT NOT NULL,
      status TEXT DEFAULT 'active'
    )
  `);

  db.run(`
    CREATE TABLE staffTasks (
      id TEXT PRIMARY KEY,
      staffId TEXT NOT NULL,
      roomId TEXT,
      taskType TEXT,
      description TEXT,
      priority TEXT DEFAULT 'medium',
      status TEXT DEFAULT 'pending',
      assignedDate TEXT,
      completedDate TEXT,
      FOREIGN KEY (staffId) REFERENCES staff(id),
      FOREIGN KEY (roomId) REFERENCES rooms(id)
    )
  `);

  console.log('Hotel Management Database initialized successfully');
});

// WebSocket connection handler
wss.on('connection', (ws) => {
  connectedClients.add(ws);
  console.log(`Client connected. Total clients: ${connectedClients.size}`);

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      console.log('Received message:', message.type);
      // Echo or broadcast based on message type
      broadcastMessage({ type: 'notification', data: message });
    } catch (error) {
      console.error('WebSocket message error:', error);
    }
  });

  ws.on('close', () => {
    connectedClients.delete(ws);
    console.log(`Client disconnected. Total clients: ${connectedClients.size}`);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// ============ ROOM ENDPOINTS ============

// Create a new room
app.post('/api/rooms', (req, res) => {
  const { roomNumber, type, capacity, pricePerNight, amenities, floorNumber } = req.body;

  if (!roomNumber || !type) {
    return res.status(400).json({ error: 'Room number and type are required' });
  }

  const id = uuidv4();

  db.run(
    `INSERT INTO rooms (id, roomNumber, type, capacity, pricePerNight, amenities, floorNumber, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'available')`,
    [id, roomNumber, type, capacity, pricePerNight, amenities, floorNumber],
    (err) => {
      if (err) {
        return res.status(400).json({ error: 'Room number must be unique' });
      }
      broadcastMessage({ type: 'room_created', roomId: id });
      res.status(201).json({
        id,
        roomNumber,
        type,
        capacity,
        pricePerNight,
        amenities,
        floorNumber,
        status: 'available',
      });
    }
  );
});

// Get all rooms
app.get('/api/rooms', (req, res) => {
  db.all('SELECT * FROM rooms ORDER BY floorNumber ASC, roomNumber ASC', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Get room by ID
app.get('/api/rooms/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM rooms WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Room not found' });
    res.json(row);
  });
});

// Update room status
app.put('/api/rooms/:id', (req, res) => {
  const { id } = req.params;
  const { status, lastCleaned, type, capacity, pricePerNight } = req.body;

  db.run(
    'UPDATE rooms SET status = ?, lastCleaned = ?, type = ?, capacity = ?, pricePerNight = ? WHERE id = ?',
    [status, lastCleaned, type, capacity, pricePerNight, id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      broadcastMessage({ type: 'room_updated', roomId: id, status });
      res.json({ message: 'Room updated successfully' });
    }
  );
});

// Get available rooms
app.get('/api/rooms/available/list', (req, res) => {
  db.all('SELECT * FROM rooms WHERE status = ?', ['available'], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// ============ GUEST ENDPOINTS ============

// Register a guest
app.post('/api/guests', (req, res) => {
  const { firstName, lastName, email, phone, address, city, country, idType, idNumber } = req.body;

  if (!firstName || !lastName || !email) {
    return res.status(400).json({ error: 'First name, last name, and email are required' });
  }

  const id = uuidv4();
  const registrationDate = new Date().toISOString();

  db.run(
    `INSERT INTO guests (id, firstName, lastName, email, phone, address, city, country, idType, idNumber, registrationDate, loyaltyPoints)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, firstName, lastName, email, phone, address, city, country, idType, idNumber, registrationDate, 0],
    (err) => {
      if (err) {
        return res.status(400).json({ error: 'Email already exists or invalid data' });
      }
      res.status(201).json({
        id,
        firstName,
        lastName,
        email,
        phone,
        address,
        city,
        country,
        idType,
        idNumber,
        registrationDate,
        loyaltyPoints: 0,
      });
    }
  );
});

// Get all guests
app.get('/api/guests', (req, res) => {
  db.all('SELECT * FROM guests ORDER BY registrationDate DESC', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Get guest by ID
app.get('/api/guests/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM guests WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Guest not found' });
    res.json(row);
  });
});

// Update guest
app.put('/api/guests/:id', (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, phone, address, city, country, loyaltyPoints } = req.body;

  db.run(
    'UPDATE guests SET firstName = ?, lastName = ?, phone = ?, address = ?, city = ?, country = ?, loyaltyPoints = ? WHERE id = ?',
    [firstName, lastName, phone, address, city, country, loyaltyPoints, id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Guest updated successfully' });
    }
  );
});

// ============ RESERVATION ENDPOINTS ============

// Create reservation
app.post('/api/reservations', (req, res) => {
  const { guestId, roomId, checkInDate, checkOutDate, numberOfGuests, specialRequests, totalPrice } = req.body;

  if (!guestId || !roomId || !checkInDate || !checkOutDate) {
    return res.status(400).json({ error: 'Guest ID, room ID, check-in date, and check-out date are required' });
  }

  const id = uuidv4();
  const reservationDate = new Date().toISOString();

  db.run(
    `INSERT INTO reservations (id, guestId, roomId, checkInDate, checkOutDate, numberOfGuests, specialRequests, reservationDate, totalPrice, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed')`,
    [id, guestId, roomId, checkInDate, checkOutDate, numberOfGuests, specialRequests, reservationDate, totalPrice],
    (err) => {
      if (err) {
        return res.status(400).json({ error: 'Invalid guest or room ID' });
      }
      broadcastMessage({ type: 'reservation_created', reservationId: id, roomId });
      res.status(201).json({
        id,
        guestId,
        roomId,
        checkInDate,
        checkOutDate,
        numberOfGuests,
        specialRequests,
        reservationDate,
        totalPrice,
        status: 'confirmed',
      });
    }
  );
});

// Get all reservations
app.get('/api/reservations', (req, res) => {
  db.all(
    `SELECT r.*, g.firstName, g.lastName, g.email, rm.roomNumber, rm.type, rm.pricePerNight
     FROM reservations r
     JOIN guests g ON r.guestId = g.id
     JOIN rooms rm ON r.roomId = rm.id
     ORDER BY r.checkInDate DESC`,
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// Get reservations for guest
app.get('/api/guests/:guestId/reservations', (req, res) => {
  const { guestId } = req.params;
  db.all(
    `SELECT r.*, rm.roomNumber, rm.type
     FROM reservations r
     JOIN rooms rm ON r.roomId = rm.id
     WHERE r.guestId = ?
     ORDER BY r.checkInDate DESC`,
    [guestId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// Update reservation
app.put('/api/reservations/:id', (req, res) => {
  const { id } = req.params;
  const { status, checkInDate, checkOutDate, numberOfGuests, specialRequests } = req.body;

  db.run(
    'UPDATE reservations SET status = ?, checkInDate = ?, checkOutDate = ?, numberOfGuests = ?, specialRequests = ? WHERE id = ?',
    [status, checkInDate, checkOutDate, numberOfGuests, specialRequests, id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      broadcastMessage({ type: 'reservation_updated', reservationId: id, status });
      res.json({ message: 'Reservation updated successfully' });
    }
  );
});

// Cancel reservation
app.delete('/api/reservations/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM reservations WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    broadcastMessage({ type: 'reservation_cancelled', reservationId: id });
    res.json({ message: 'Reservation cancelled successfully' });
  });
});

// ============ CHECK-IN ENDPOINTS ============

// Check-in guest
app.post('/api/check-ins', (req, res) => {
  const { reservationId, guestId, roomId, keyCardIssued, notes } = req.body;

  if (!reservationId || !guestId || !roomId) {
    return res.status(400).json({ error: 'Reservation ID, guest ID, and room ID are required' });
  }

  const id = uuidv4();
  const checkInTime = new Date().toISOString();

  db.run(
    `INSERT INTO checkIns (id, reservationId, guestId, roomId, checkInTime, keyCardIssued, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, reservationId, guestId, roomId, checkInTime, keyCardIssued, notes],
    (err) => {
      if (err) {
        return res.status(400).json({ error: 'Invalid data' });
      }
      // Update room status to occupied
      db.run('UPDATE rooms SET status = ? WHERE id = ?', ['occupied', roomId]);
      // Update reservation status
      db.run('UPDATE reservations SET status = ? WHERE id = ?', ['checked_in', reservationId]);
      
      broadcastMessage({ type: 'guest_checked_in', reservationId, roomId, guestId });
      res.status(201).json({
        id,
        reservationId,
        guestId,
        roomId,
        checkInTime,
        keyCardIssued,
        notes,
      });
    }
  );
});

// Get check-ins
app.get('/api/check-ins', (req, res) => {
  db.all(
    `SELECT c.*, g.firstName, g.lastName, rm.roomNumber
     FROM checkIns c
     JOIN guests g ON c.guestId = g.id
     JOIN rooms rm ON c.roomId = rm.id
     ORDER BY c.checkInTime DESC`,
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// ============ CHECK-OUT ENDPOINTS ============

// Check-out guest
app.post('/api/check-outs', (req, res) => {
  const { reservationId, guestId, roomId, roomCondition, damageReported, notes } = req.body;

  if (!reservationId || !guestId || !roomId) {
    return res.status(400).json({ error: 'Reservation ID, guest ID, and room ID are required' });
  }

  const id = uuidv4();
  const checkOutTime = new Date().toISOString();

  db.run(
    `INSERT INTO checkOuts (id, reservationId, guestId, roomId, checkOutTime, roomCondition, damageReported, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, reservationId, guestId, roomId, checkOutTime, roomCondition, damageReported, notes],
    (err) => {
      if (err) {
        return res.status(400).json({ error: 'Invalid data' });
      }
      // Update room status to cleaning_required
      db.run('UPDATE rooms SET status = ? WHERE id = ?', ['cleaning_required', roomId]);
      // Update reservation status
      db.run('UPDATE reservations SET status = ? WHERE id = ?', ['checked_out', reservationId]);
      
      broadcastMessage({ type: 'guest_checked_out', reservationId, roomId, guestId });
      res.status(201).json({
        id,
        reservationId,
        guestId,
        roomId,
        checkOutTime,
        roomCondition,
        damageReported,
        notes,
      });
    }
  );
});

// Get check-outs
app.get('/api/check-outs', (req, res) => {
  db.all(
    `SELECT c.*, g.firstName, g.lastName, rm.roomNumber
     FROM checkOuts c
     JOIN guests g ON c.guestId = g.id
     JOIN rooms rm ON c.roomId = rm.id
     ORDER BY c.checkOutTime DESC`,
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// ============ BILLING ENDPOINTS ============

// Create billing
app.post('/api/billing', (req, res) => {
  const { reservationId, guestId, roomCharges, extraCharges, discounts, paymentMethod } = req.body;

  if (!reservationId || !guestId) {
    return res.status(400).json({ error: 'Reservation ID and guest ID are required' });
  }

  const id = uuidv4();
  const billingDate = new Date().toISOString();
  const totalAmount = (roomCharges || 0) + (extraCharges || 0) - (discounts || 0);

  db.run(
    `INSERT INTO billing (id, reservationId, guestId, roomCharges, extraCharges, discounts, totalAmount, paymentMethod, paymentStatus, billingDate)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
    [id, reservationId, guestId, roomCharges, extraCharges, discounts, totalAmount, paymentMethod, billingDate],
    (err) => {
      if (err) {
        return res.status(400).json({ error: 'Invalid data' });
      }
      res.status(201).json({
        id,
        reservationId,
        guestId,
        roomCharges,
        extraCharges,
        discounts,
        totalAmount,
        paymentMethod,
        paymentStatus: 'pending',
        billingDate,
      });
    }
  );
});

// Get all billing
app.get('/api/billing', (req, res) => {
  db.all(
    `SELECT b.*, g.firstName, g.lastName, g.email
     FROM billing b
     JOIN guests g ON b.guestId = g.id
     ORDER BY b.billingDate DESC`,
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// Get billing for guest
app.get('/api/guests/:guestId/billing', (req, res) => {
  const { guestId } = req.params;
  db.all(
    'SELECT * FROM billing WHERE guestId = ? ORDER BY billingDate DESC',
    [guestId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// Update billing payment status
app.put('/api/billing/:id', (req, res) => {
  const { id } = req.params;
  const { paymentStatus, paymentMethod } = req.body;

  db.run(
    'UPDATE billing SET paymentStatus = ?, paymentMethod = ? WHERE id = ?',
    [paymentStatus, paymentMethod, id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      broadcastMessage({ type: 'billing_updated', billingId: id, paymentStatus });
      res.json({ message: 'Billing updated successfully' });
    }
  );
});

// ============ STAFF ENDPOINTS ============

// Add staff member
app.post('/api/staff', (req, res) => {
  const { firstName, lastName, email, phone, department, position, shift } = req.body;

  if (!firstName || !lastName || !email) {
    return res.status(400).json({ error: 'First name, last name, and email are required' });
  }

  const id = uuidv4();
  const hireDate = new Date().toISOString();

  db.run(
    `INSERT INTO staff (id, firstName, lastName, email, phone, department, position, shift, hireDate, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
    [id, firstName, lastName, email, phone, department, position, shift, hireDate],
    (err) => {
      if (err) {
        return res.status(400).json({ error: 'Email already exists or invalid data' });
      }
      res.status(201).json({
        id,
        firstName,
        lastName,
        email,
        phone,
        department,
        position,
        shift,
        hireDate,
        status: 'active',
      });
    }
  );
});

// Get all staff
app.get('/api/staff', (req, res) => {
  db.all('SELECT * FROM staff WHERE status = ? ORDER BY department, position', ['active'], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// ============ STAFF TASKS ENDPOINTS ============

// Create staff task
app.post('/api/staff-tasks', (req, res) => {
  const { staffId, roomId, taskType, description, priority } = req.body;

  if (!staffId || !taskType) {
    return res.status(400).json({ error: 'Staff ID and task type are required' });
  }

  const id = uuidv4();
  const assignedDate = new Date().toISOString();

  db.run(
    `INSERT INTO staffTasks (id, staffId, roomId, taskType, description, priority, status, assignedDate)
     VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)`,
    [id, staffId, roomId, taskType, description, priority || 'medium', assignedDate],
    (err) => {
      if (err) {
        return res.status(400).json({ error: 'Invalid data' });
      }
      broadcastMessage({ type: 'task_assigned', taskId: id, staffId });
      res.status(201).json({
        id,
        staffId,
        roomId,
        taskType,
        description,
        priority: priority || 'medium',
        status: 'pending',
        assignedDate,
      });
    }
  );
});

// Get staff tasks
app.get('/api/staff-tasks', (req, res) => {
  db.all(
    `SELECT t.*, s.firstName, s.lastName, s.email, rm.roomNumber
     FROM staffTasks t
     LEFT JOIN staff s ON t.staffId = s.id
     LEFT JOIN rooms rm ON t.roomId = rm.id
     WHERE t.status != 'completed'
     ORDER BY t.priority DESC, t.assignedDate ASC`,
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// Update staff task status
app.put('/api/staff-tasks/:id', (req, res) => {
  const { id } = req.params;
  const { status, completedDate } = req.body;

  db.run(
    'UPDATE staffTasks SET status = ?, completedDate = ? WHERE id = ?',
    [status, completedDate || new Date().toISOString(), id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      broadcastMessage({ type: 'task_updated', taskId: id, status });
      res.json({ message: 'Task updated successfully' });
    }
  );
});

// Get tasks for specific staff
app.get('/api/staff/:staffId/tasks', (req, res) => {
  const { staffId } = req.params;
  db.all(
    `SELECT t.*, rm.roomNumber
     FROM staffTasks t
     LEFT JOIN rooms rm ON t.roomId = rm.id
     WHERE t.staffId = ? AND t.status != 'completed'
     ORDER BY t.priority DESC, t.assignedDate ASC`,
    [staffId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// ============ REPORTS ENDPOINTS ============

// Get occupancy report
app.get('/api/reports/occupancy', (req, res) => {
  db.all('SELECT COUNT(*) as occupiedRooms FROM rooms WHERE status = ?', ['occupied'], (err, occupiedResult) => {
    if (err) return res.status(500).json({ error: err.message });

    db.all('SELECT COUNT(*) as totalRooms FROM rooms', (err, totalResult) => {
      if (err) return res.status(500).json({ error: err.message });

      const occupied = occupiedResult[0].occupiedRooms;
      const total = totalResult[0].totalRooms;
      const occupancyRate = total > 0 ? ((occupied / total) * 100).toFixed(2) : 0;

      res.json({
        occupiedRooms: occupied,
        totalRooms: total,
        occupancyRate: parseFloat(occupancyRate),
        availableRooms: total - occupied,
        generatedDate: new Date().toISOString(),
      });
    });
  });
});

// Get revenue report
app.get('/api/reports/revenue', (req, res) => {
  db.all(
    `SELECT 
      SUM(totalAmount) as totalRevenue,
      COUNT(*) as totalBills,
      AVG(totalAmount) as avgBillAmount
     FROM billing WHERE paymentStatus = ?`,
    ['paid'],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });

      const report = {
        totalRevenue: rows[0].totalRevenue || 0,
        totalBills: rows[0].totalBills || 0,
        averageBillAmount: rows[0].avgBillAmount || 0,
        generatedDate: new Date().toISOString(),
      };

      res.json(report);
    }
  );
});

// Get booking statistics
app.get('/api/reports/bookings', (req, res) => {
  db.all(
    `SELECT 
      COUNT(*) as totalReservations,
      COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmedReservations,
      COUNT(CASE WHEN status = 'checked_in' THEN 1 END) as checkedInGuests,
      COUNT(CASE WHEN status = 'checked_out' THEN 1 END) as checkedOutGuests
     FROM reservations`,
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });

      const stats = rows[0];
      res.json({
        totalReservations: stats.totalReservations,
        confirmedReservations: stats.confirmedReservations,
        checkedInGuests: stats.checkedInGuests,
        checkedOutGuests: stats.checkedOutGuests,
        generatedDate: new Date().toISOString(),
      });
    }
  );
});

// ============ ERROR HANDLING ============
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// ============ START SERVER ============
app.listen(PORT, () => {
  console.log(`Hotel Management API running on http://localhost:${PORT}`);
  console.log(`WebSocket server running on ws://localhost:${WS_PORT}`);
  console.log('Real-time updates enabled for room status, reservations, check-ins, and billing');
});
