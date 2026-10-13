import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { WebSocketServer } from 'ws';
import sqlite3 from 'sqlite3';
import { v4 as uuidv4 } from 'uuid';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Database setup
const db = new sqlite3.Database(':memory:');

// Track active connections
const connectedClients = new Set();

// Broadcast to all clients
function broadcastToClients(message) {
  connectedClients.forEach(client => {
    if (client.readyState === 1) { // OPEN
      client.send(JSON.stringify(message));
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
      capacity INTEGER NOT NULL,
      pricePerNight REAL NOT NULL,
      amenities TEXT,
      status TEXT DEFAULT 'available',
      floor INTEGER
    )
  `);

  db.run(`
    CREATE TABLE guests (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT NOT NULL,
      address TEXT,
      city TEXT,
      country TEXT,
      idNumber TEXT UNIQUE,
      checkInDate TEXT,
      checkOutDate TEXT
    )
  `);

  db.run(`
    CREATE TABLE reservations (
      id TEXT PRIMARY KEY,
      guestId TEXT NOT NULL,
      roomId TEXT NOT NULL,
      checkInDate TEXT NOT NULL,
      checkOutDate TEXT NOT NULL,
      numberOfNights INTEGER,
      totalPrice REAL,
      status TEXT DEFAULT 'confirmed',
      specialRequests TEXT,
      createdDate TEXT,
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
      status TEXT DEFAULT 'checked_in',
      notes TEXT,
      FOREIGN KEY (reservationId) REFERENCES reservations(id),
      FOREIGN KEY (guestId) REFERENCES guests(id),
      FOREIGN KEY (roomId) REFERENCES rooms(id)
    )
  `);

  db.run(`
    CREATE TABLE checkOuts (
      id TEXT PRIMARY KEY,
      checkInId TEXT NOT NULL,
      checkOutTime TEXT NOT NULL,
      roomCondition TEXT,
      damageNotes TEXT,
      status TEXT DEFAULT 'completed',
      FOREIGN KEY (checkInId) REFERENCES checkIns(id)
    )
  `);

  db.run(`
    CREATE TABLE billing (
      id TEXT PRIMARY KEY,
      reservationId TEXT NOT NULL,
      guestId TEXT NOT NULL,
      roomCharge REAL,
      services REAL DEFAULT 0,
      food REAL DEFAULT 0,
      otherCharges REAL DEFAULT 0,
      tax REAL DEFAULT 0,
      totalAmount REAL,
      paymentMethod TEXT,
      paymentStatus TEXT DEFAULT 'pending',
      billingDate TEXT,
      FOREIGN KEY (reservationId) REFERENCES reservations(id),
      FOREIGN KEY (guestId) REFERENCES guests(id)
    )
  `);

  db.run(`
    CREATE TABLE staffAssignments (
      id TEXT PRIMARY KEY,
      staffName TEXT NOT NULL,
      staffRole TEXT NOT NULL,
      assignedRoom TEXT,
      taskDescription TEXT,
      priority TEXT DEFAULT 'normal',
      status TEXT DEFAULT 'pending',
      createdDate TEXT,
      completedDate TEXT
    )
  `);

  db.run(`
    CREATE TABLE serviceRequests (
      id TEXT PRIMARY KEY,
      reservationId TEXT,
      guestId TEXT NOT NULL,
      roomId TEXT NOT NULL,
      serviceType TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'pending',
      priority TEXT DEFAULT 'normal',
      assignedStaff TEXT,
      requestTime TEXT,
      completedTime TEXT,
      FOREIGN KEY (reservationId) REFERENCES reservations(id),
      FOREIGN KEY (guestId) REFERENCES guests(id),
      FOREIGN KEY (roomId) REFERENCES rooms(id)
    )
  `);

  console.log('Hotel Management Database initialized');
});

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('New client connected');
  connectedClients.add(ws);

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log('Received:', data);
      // Messages will be handled through API calls that broadcast
    } catch (error) {
      console.error('WebSocket message error:', error);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    connectedClients.delete(ws);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// ============ ROOM MANAGEMENT ============

app.post('/api/rooms', (req, res) => {
  const { roomNumber, type, capacity, pricePerNight, amenities, floor } = req.body;

  if (!roomNumber || !type || !capacity || !pricePerNight) {
    return res.status(400).json({ error: 'Required fields missing' });
  }

  const id = uuidv4();

  db.run(
    `INSERT INTO rooms (id, roomNumber, type, capacity, pricePerNight, amenities, status, floor)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, roomNumber, type, capacity, pricePerNight, amenities, 'available', floor],
    (err) => {
      if (err) {
        return res.status(400).json({ error: 'Room already exists' });
      }
      const room = { id, roomNumber, type, capacity, pricePerNight, amenities, floor, status: 'available' };
      res.status(201).json(room);
      broadcastToClients({ type: 'room_created', data: room });
    }
  );
});

app.get('/api/rooms', (req, res) => {
  db.all('SELECT * FROM rooms ORDER BY roomNumber ASC', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/api/rooms/available', (req, res) => {
  const { checkInDate, checkOutDate } = req.query;

  if (!checkInDate || !checkOutDate) {
    return db.all(
      "SELECT * FROM rooms WHERE status = 'available' ORDER BY roomNumber ASC",
      (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
      }
    );
  }

  db.all(
    `SELECT * FROM rooms WHERE id NOT IN (
      SELECT DISTINCT roomId FROM reservations 
      WHERE status != 'cancelled' 
      AND ((checkInDate <= ? AND checkOutDate >= ?)
        OR (checkInDate >= ? AND checkInDate < ?)
        OR (checkOutDate > ? AND checkOutDate <= ?))
    ) ORDER BY roomNumber ASC`,
    [checkOutDate, checkInDate, checkInDate, checkOutDate, checkInDate, checkOutDate],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

app.put('/api/rooms/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  db.run('UPDATE rooms SET status = ? WHERE id = ?', [status, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Room updated' });
    broadcastToClients({ type: 'room_status_updated', roomId: id, status });
  });
});

// ============ GUEST MANAGEMENT ============

app.post('/api/guests', (req, res) => {
  const { name, email, phone, address, city, country, idNumber } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ error: 'Name and phone required' });
  }

  const id = uuidv4();

  db.run(
    `INSERT INTO guests (id, name, email, phone, address, city, country, idNumber)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, name, email, phone, address, city, country, idNumber],
    (err) => {
      if (err) {
        return res.status(400).json({ error: 'Duplicate ID number or invalid data' });
      }
      res.status(201).json({
        id,
        name,
        email,
        phone,
        address,
        city,
        country,
        idNumber,
      });
    }
  );
});

app.get('/api/guests', (req, res) => {
  db.all('SELECT * FROM guests ORDER BY name ASC', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// ============ RESERVATION MANAGEMENT ============

app.post('/api/reservations', (req, res) => {
  const { guestId, roomId, checkInDate, checkOutDate, specialRequests } = req.body;

  if (!guestId || !roomId || !checkInDate || !checkOutDate) {
    return res.status(400).json({ error: 'Required fields missing' });
  }

  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);
  const numberOfNights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

  if (numberOfNights <= 0) {
    return res.status(400).json({ error: 'Invalid dates' });
  }

  // Get room price
  db.get('SELECT pricePerNight FROM rooms WHERE id = ?', [roomId], (priceErr, room) => {
    if (priceErr || !room) return res.status(400).json({ error: 'Room not found' });

    const totalPrice = room.pricePerNight * numberOfNights;
    const id = uuidv4();
    const createdDate = new Date().toISOString().split('T')[0];

    db.run(
      `INSERT INTO reservations (id, guestId, roomId, checkInDate, checkOutDate, numberOfNights, totalPrice, status, specialRequests, createdDate)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, guestId, roomId, checkInDate, checkOutDate, numberOfNights, totalPrice, 'confirmed', specialRequests, createdDate],
      (err) => {
        if (err) {
          return res.status(400).json({ error: 'Failed to create reservation' });
        }
        const reservation = {
          id,
          guestId,
          roomId,
          checkInDate,
          checkOutDate,
          numberOfNights,
          totalPrice,
          status: 'confirmed',
          specialRequests,
          createdDate,
        };
        res.status(201).json(reservation);
        broadcastToClients({ type: 'reservation_created', data: reservation });
      }
    );
  });
});

app.get('/api/reservations', (req, res) => {
  db.all(
    `SELECT r.*, g.name as guestName, rm.roomNumber, rm.type as roomType
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

app.get('/api/reservations/guest/:guestId', (req, res) => {
  const { guestId } = req.params;

  db.all(
    `SELECT r.*, rm.roomNumber, rm.type as roomType
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

app.put('/api/reservations/:id', (req, res) => {
  const { id } = req.params;
  const { status, specialRequests } = req.body;

  db.run(
    'UPDATE reservations SET status = ?, specialRequests = ? WHERE id = ?',
    [status, specialRequests, id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Reservation updated' });
      broadcastToClients({ type: 'reservation_updated', reservationId: id, status });
    }
  );
});

// ============ CHECK-IN/CHECK-OUT ============

app.post('/api/check-ins', (req, res) => {
  const { reservationId, guestId, roomId, notes } = req.body;

  if (!reservationId || !guestId || !roomId) {
    return res.status(400).json({ error: 'Required fields missing' });
  }

  const id = uuidv4();
  const checkInTime = new Date().toISOString();

  db.run(
    `INSERT INTO checkIns (id, reservationId, guestId, roomId, checkInTime, status, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, reservationId, guestId, roomId, checkInTime, 'checked_in', notes],
    (err) => {
      if (err) {
        return res.status(400).json({ error: 'Check-in failed' });
      }

      db.run(
        'UPDATE rooms SET status = ? WHERE id = ?',
        ['occupied', roomId],
        () => {
          const checkIn = { id, reservationId, guestId, roomId, checkInTime, status: 'checked_in', notes };
          res.status(201).json(checkIn);
          broadcastToClients({ type: 'guest_checked_in', data: checkIn });
        }
      );
    }
  );
});

app.post('/api/check-outs', (req, res) => {
  const { checkInId, roomCondition, damageNotes } = req.body;

  if (!checkInId) {
    return res.status(400).json({ error: 'Check-in ID required' });
  }

  const id = uuidv4();
  const checkOutTime = new Date().toISOString();

  db.run(
    `INSERT INTO checkOuts (id, checkInId, checkOutTime, roomCondition, damageNotes, status)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, checkInId, checkOutTime, roomCondition, damageNotes, 'completed'],
    (err) => {
      if (err) {
        return res.status(400).json({ error: 'Check-out failed' });
      }

      db.get('SELECT roomId FROM checkIns WHERE id = ?', [checkInId], (getErr, row) => {
        if (getErr || !row) return res.status(500).json({ error: 'Check-in not found' });

        db.run(
          'UPDATE rooms SET status = ? WHERE id = ?',
          ['cleaning', row.roomId],
          () => {
            const checkOut = { id, checkInId, checkOutTime, roomCondition, damageNotes, status: 'completed' };
            res.status(201).json(checkOut);
            broadcastToClients({ type: 'guest_checked_out', data: checkOut });
          }
        );
      });
    }
  );
});

// ============ BILLING ============

app.post('/api/billing', (req, res) => {
  const { reservationId, guestId, services, food, otherCharges, paymentMethod } = req.body;

  if (!reservationId || !guestId) {
    return res.status(400).json({ error: 'Required fields missing' });
  }

  db.get(
    'SELECT totalPrice FROM reservations WHERE id = ?',
    [reservationId],
    (err, reservation) => {
      if (err || !reservation) {
        return res.status(400).json({ error: 'Reservation not found' });
      }

      const roomCharge = reservation.totalPrice;
      const servicesCharge = services || 0;
      const foodCharge = food || 0;
      const otherCharge = otherCharges || 0;
      const subtotal = roomCharge + servicesCharge + foodCharge + otherCharge;
      const tax = subtotal * 0.1; // 10% tax
      const totalAmount = subtotal + tax;

      const id = uuidv4();
      const billingDate = new Date().toISOString().split('T')[0];

      db.run(
        `INSERT INTO billing (id, reservationId, guestId, roomCharge, services, food, otherCharges, tax, totalAmount, paymentMethod, paymentStatus, billingDate)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, reservationId, guestId, roomCharge, servicesCharge, foodCharge, otherCharge, tax, totalAmount, paymentMethod, 'pending', billingDate],
        (billErr) => {
          if (billErr) {
            return res.status(400).json({ error: 'Billing failed' });
          }

          const billing = {
            id,
            reservationId,
            guestId,
            roomCharge,
            services: servicesCharge,
            food: foodCharge,
            otherCharges: otherCharge,
            tax,
            totalAmount,
            paymentMethod,
            paymentStatus: 'pending',
            billingDate,
          };

          res.status(201).json(billing);
          broadcastToClients({ type: 'billing_created', data: billing });
        }
      );
    }
  );
});

app.get('/api/billing/:reservationId', (req, res) => {
  const { reservationId } = req.params;

  db.get(
    'SELECT * FROM billing WHERE reservationId = ?',
    [reservationId],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!row) return res.status(404).json({ error: 'Billing not found' });
      res.json(row);
    }
  );
});

app.put('/api/billing/:id', (req, res) => {
  const { id } = req.params;
  const { paymentStatus } = req.body;

  db.run(
    'UPDATE billing SET paymentStatus = ? WHERE id = ?',
    [paymentStatus, id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Billing updated' });
      broadcastToClients({ type: 'billing_updated', billingId: id, paymentStatus });
    }
  );
});

// ============ STAFF MANAGEMENT ============

app.post('/api/staff-assignments', (req, res) => {
  const { staffName, staffRole, assignedRoom, taskDescription, priority } = req.body;

  if (!staffName || !staffRole) {
    return res.status(400).json({ error: 'Staff name and role required' });
  }

  const id = uuidv4();
  const createdDate = new Date().toISOString();

  db.run(
    `INSERT INTO staffAssignments (id, staffName, staffRole, assignedRoom, taskDescription, priority, status, createdDate)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, staffName, staffRole, assignedRoom, taskDescription, priority || 'normal', 'pending', createdDate],
    (err) => {
      if (err) {
        return res.status(400).json({ error: 'Assignment failed' });
      }

      const assignment = {
        id,
        staffName,
        staffRole,
        assignedRoom,
        taskDescription,
        priority: priority || 'normal',
        status: 'pending',
        createdDate,
      };

      res.status(201).json(assignment);
      broadcastToClients({ type: 'staff_assignment_created', data: assignment });
    }
  );
});

app.get('/api/staff-assignments', (req, res) => {
  db.all(
    'SELECT * FROM staffAssignments ORDER BY createdDate DESC',
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

app.put('/api/staff-assignments/:id', (req, res) => {
  const { id } = req.params;
  const { status, completedDate } = req.body;

  db.run(
    'UPDATE staffAssignments SET status = ?, completedDate = ? WHERE id = ?',
    [status, completedDate, id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Assignment updated' });
      broadcastToClients({ type: 'staff_assignment_updated', assignmentId: id, status });
    }
  );
});

// ============ SERVICE REQUESTS ============

app.post('/api/service-requests', (req, res) => {
  const { reservationId, guestId, roomId, serviceType, description, priority } = req.body;

  if (!guestId || !roomId || !serviceType) {
    return res.status(400).json({ error: 'Required fields missing' });
  }

  const id = uuidv4();
  const requestTime = new Date().toISOString();

  db.run(
    `INSERT INTO serviceRequests (id, reservationId, guestId, roomId, serviceType, description, status, priority, requestTime)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, reservationId, guestId, roomId, serviceType, description, 'pending', priority || 'normal', requestTime],
    (err) => {
      if (err) {
        return res.status(400).json({ error: 'Service request failed' });
      }

      const request = {
        id,
        reservationId,
        guestId,
        roomId,
        serviceType,
        description,
        status: 'pending',
        priority: priority || 'normal',
        requestTime,
      };

      res.status(201).json(request);
      broadcastToClients({ type: 'service_request_created', data: request });
    }
  );
});

app.get('/api/service-requests', (req, res) => {
  db.all(
    'SELECT * FROM serviceRequests ORDER BY requestTime DESC',
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

app.put('/api/service-requests/:id', (req, res) => {
  const { id } = req.params;
  const { status, assignedStaff, completedTime } = req.body;

  db.run(
    'UPDATE serviceRequests SET status = ?, assignedStaff = ?, completedTime = ? WHERE id = ?',
    [status, assignedStaff, completedTime, id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Service request updated' });
      broadcastToClients({ type: 'service_request_updated', requestId: id, status });
    }
  );
});

// ============ REPORTS ============

app.get('/api/reports/occupancy', (req, res) => {
  db.all(
    `SELECT r.roomNumber, r.type, COUNT(res.id) as reservationCount,
      SUM(res.numberOfNights) as totalNights, SUM(res.totalPrice) as totalRevenue
     FROM rooms r
     LEFT JOIN reservations res ON r.id = res.roomId AND res.status = 'confirmed'
     GROUP BY r.id
     ORDER BY r.roomNumber`,
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

app.get('/api/reports/revenue', (req, res) => {
  db.all(
    `SELECT b.billingDate, COUNT(DISTINCT b.reservationId) as checkouts,
      SUM(b.roomCharge) as roomRevenue, SUM(b.services) as serviceRevenue,
      SUM(b.food) as foodRevenue, SUM(b.totalAmount) as totalRevenue
     FROM billing b
     GROUP BY b.billingDate
     ORDER BY b.billingDate DESC`,
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

app.get('/api/reports/hotel-status', (req, res) => {
  db.all('SELECT COUNT(*) as total FROM rooms', (roomErr, roomCount) => {
    if (roomErr) return res.status(500).json({ error: roomErr.message });

    db.all("SELECT COUNT(*) as occupied FROM rooms WHERE status = 'occupied'", (occupErr, occup) => {
      if (occupErr) return res.status(500).json({ error: occupErr.message });

      db.all("SELECT COUNT(*) as cleaning FROM rooms WHERE status = 'cleaning'", (cleanErr, cleaning) => {
        if (cleanErr) return res.status(500).json({ error: cleanErr.message });

        db.all("SELECT COUNT(*) as available FROM rooms WHERE status = 'available'", (availErr, available) => {
          if (availErr) return res.status(500).json({ error: availErr.message });

          const report = {
            totalRooms: roomCount[0].total,
            occupiedRooms: occup[0].occupied,
            cleaningRooms: cleaning[0].cleaning,
            availableRooms: available[0].available,
            occupancyRate: ((occup[0].occupied / roomCount[0].total) * 100).toFixed(1),
            generatedAt: new Date().toISOString(),
          };

          res.json(report);
        });
      });
    });
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
server.listen(PORT, () => {
  console.log(`Hotel Management System running on http://localhost:${PORT}`);
  console.log(`WebSocket server running on ws://localhost:${PORT}/ws`);
  console.log('Features:');
  console.log('  ✓ Room Management & Availability');
  console.log('  ✓ Guest Management');
  console.log('  ✓ Reservations & Bookings');
  console.log('  ✓ Check-in/Check-out');
  console.log('  ✓ Billing & Payments');
  console.log('  ✓ Staff Coordination');
  console.log('  ✓ Service Requests');
  console.log('  ✓ Real-time WebSocket Updates');
  console.log('  ✓ Revenue & Occupancy Reports');
});

export default { app, server };
