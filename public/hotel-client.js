const API_URL = 'http://localhost:3001/api';
let ws;
const reservationCache = {};
const guestCache = {};
const roomCache = {};
const checkInCache = {};

// WebSocket connection
function connectWebSocket() {
  ws = new WebSocket('ws://localhost:3001/ws');

  ws.onopen = () => {
    console.log('Connected to hotel system');
    updateConnectionStatus(true);
  };

  ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    console.log('Received update:', message);

    if (message.type === 'room_status_updated') {
      loadRooms();
    } else if (message.type === 'reservation_created' || message.type === 'reservation_updated') {
      loadReservations();
    } else if (message.type === 'guest_checked_in') {
      updateCheckInStatus();
    } else if (message.type === 'guest_checked_out') {
      updateCheckOutStatus();
    } else if (message.type === 'service_request_created' || message.type === 'service_request_updated') {
      loadServiceRequests();
    } else if (message.type === 'staff_assignment_updated') {
      loadStaffAssignments();
    }
  };

  ws.onclose = () => {
    console.log('Disconnected from hotel system');
    updateConnectionStatus(false);
    setTimeout(connectWebSocket, 3000);
  };

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
    updateConnectionStatus(false);
  };
}

function updateConnectionStatus(connected) {
  const status = document.getElementById('connectionStatus');
  if (connected) {
    status.textContent = '🟢 Connected';
    status.style.color = '#4caf50';
  } else {
    status.textContent = '🔴 Disconnected';
    status.style.color = '#f44336';
  }
}

// Tab Navigation
function showTab(tabName) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById(`${tabName}-tab`).classList.add('active');
  event.target.classList.add('active');

  if (tabName === 'rooms') loadRooms();
  else if (tabName === 'guests') loadGuests();
  else if (tabName === 'reservations') {
    loadReservations();
    loadGuestsForDropdown('resGuest');
    loadRoomsForDropdown('resRoom');
  }
  else if (tabName === 'checkins') {
    loadCheckInSelects();
  }
  else if (tabName === 'billing') {
    loadBillingSelects();
  }
  else if (tabName === 'staff') loadStaffAssignments();
  else if (tabName === 'services') {
    loadServiceRequests();
    loadReservationsForDropdown('serviceReservation');
  }
}

// ============ ROOM MANAGEMENT ============
document.getElementById('roomForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const room = {
    roomNumber: document.getElementById('roomNumber').value,
    type: document.getElementById('roomType').value,
    capacity: parseInt(document.getElementById('capacity').value),
    pricePerNight: parseFloat(document.getElementById('pricePerNight').value),
    floor: parseInt(document.getElementById('floor').value) || null,
    amenities: document.getElementById('amenities').value,
  };

  try {
    const response = await fetch(`${API_URL}/rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(room),
    });

    if (response.ok) {
      alert('Room added successfully!');
      document.getElementById('roomForm').reset();
      loadRooms();
    } else {
      const error = await response.json();
      alert(`Error: ${error.error}`);
    }
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
});

async function loadRooms() {
  try {
    const response = await fetch(`${API_URL}/rooms`);
    const rooms = await response.json();

    rooms.forEach(room => roomCache[room.id] = room);

    let html = '<div class="rooms-grid">';
    rooms.forEach(room => {
      const statusColor = {
        'available': '#4caf50',
        'occupied': '#ff9800',
        'cleaning': '#2196f3',
        'maintenance': '#f44336'
      }[room.status];

      html += `
        <div class="room-card" style="border-left: 5px solid ${statusColor}">
          <h4>${room.roomNumber}</h4>
          <p><strong>Type:</strong> ${room.type}</p>
          <p><strong>Capacity:</strong> ${room.capacity} guests</p>
          <p><strong>Floor:</strong> ${room.floor || 'N/A'}</p>
          <p><strong>Price:</strong> $${room.pricePerNight}/night</p>
          <p><strong>Status:</strong> <span style="color: ${statusColor}; font-weight: bold;">${room.status.toUpperCase()}</span></p>
          ${room.amenities ? `<p><strong>Amenities:</strong> ${room.amenities}</p>` : ''}
        </div>
      `;
    });
    html += '</div>';

    document.getElementById('roomsList').innerHTML = html || '<p>No rooms available</p>';
  } catch (error) {
    console.error('Error loading rooms:', error);
  }
}

// ============ GUEST MANAGEMENT ============
document.getElementById('guestForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const guest = {
    name: document.getElementById('guestName').value,
    email: document.getElementById('guestEmail').value,
    phone: document.getElementById('guestPhone').value,
    address: document.getElementById('guestAddress').value,
    city: document.getElementById('guestCity').value,
    country: document.getElementById('guestCountry').value,
    idNumber: document.getElementById('guestIdNumber').value,
  };

  try {
    const response = await fetch(`${API_URL}/guests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(guest),
    });

    if (response.ok) {
      alert('Guest registered successfully!');
      document.getElementById('guestForm').reset();
      loadGuests();
    } else {
      const error = await response.json();
      alert(`Error: ${error.error}`);
    }
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
});

async function loadGuests() {
  try {
    const response = await fetch(`${API_URL}/guests`);
    const guests = await response.json();

    guests.forEach(guest => guestCache[guest.id] = guest);

    let html = '<ul class="list">';
    guests.forEach(guest => {
      html += `
        <li class="list-item">
          <h4>${guest.name}</h4>
          <p><strong>Phone:</strong> ${guest.phone}</p>
          <p><strong>Email:</strong> ${guest.email || 'N/A'}</p>
          <p><strong>City:</strong> ${guest.city || 'N/A'} | <strong>Country:</strong> ${guest.country || 'N/A'}</p>
          <p><strong>ID:</strong> ${guest.idNumber || 'N/A'}</p>
        </li>
      `;
    });
    html += '</ul>';

    document.getElementById('guestsList').innerHTML = html || '<p>No guests registered</p>';
  } catch (error) {
    console.error('Error loading guests:', error);
  }
}

async function loadGuestsForDropdown(selectId) {
  try {
    const response = await fetch(`${API_URL}/guests`);
    const guests = await response.json();

    const select = document.getElementById(selectId);
    select.innerHTML = '<option value="">Select Guest</option>';
    guests.forEach(guest => {
      const option = document.createElement('option');
      option.value = guest.id;
      option.textContent = guest.name;
      select.appendChild(option);
    });
  } catch (error) {
    console.error('Error loading guests:', error);
  }
}

// ============ ROOM DROPDOWN ============
async function loadRoomsForDropdown(selectId) {
  try {
    const response = await fetch(`${API_URL}/rooms/available`);
    const rooms = await response.json();

    const select = document.getElementById(selectId);
    select.innerHTML = '<option value="">Select Room</option>';
    rooms.forEach(room => {
      const option = document.createElement('option');
      option.value = room.id;
      option.textContent = `${room.roomNumber} (${room.type} - $${room.pricePerNight})`;
      select.appendChild(option);
    });
  } catch (error) {
    console.error('Error loading rooms:', error);
  }
}

// ============ RESERVATION MANAGEMENT ============
document.getElementById('reservationForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const reservation = {
    guestId: document.getElementById('resGuest').value,
    roomId: document.getElementById('resRoom').value,
    checkInDate: document.getElementById('checkInDate').value,
    checkOutDate: document.getElementById('checkOutDate').value,
    specialRequests: document.getElementById('specialRequests').value,
  };

  try {
    const response = await fetch(`${API_URL}/reservations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reservation),
    });

    if (response.ok) {
      const res = await response.json();
      reservationCache[res.id] = res;
      alert('Reservation created successfully!');
      document.getElementById('reservationForm').reset();
      loadReservations();
    } else {
      const error = await response.json();
      alert(`Error: ${error.error}`);
    }
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
});

async function loadReservations() {
  try {
    const response = await fetch(`${API_URL}/reservations`);
    const reservations = await response.json();

    reservations.forEach(res => reservationCache[res.id] = res);

    let html = '<ul class="list">';
    reservations.forEach(res => {
      html += `
        <li class="list-item">
          <h4>${res.guestName} - Room ${res.roomNumber}</h4>
          <p><strong>Check-in:</strong> ${res.checkInDate} | <strong>Check-out:</strong> ${res.checkOutDate}</p>
          <p><strong>Nights:</strong> ${res.numberOfNights} | <strong>Total:</strong> $${res.totalPrice.toFixed(2)}</p>
          <p><strong>Status:</strong> ${res.status}</p>
          ${res.specialRequests ? `<p><strong>Special Requests:</strong> ${res.specialRequests}</p>` : ''}
        </li>
      `;
    });
    html += '</ul>';

    document.getElementById('reservationsList').innerHTML = html || '<p>No reservations</p>';
  } catch (error) {
    console.error('Error loading reservations:', error);
  }
}

async function loadReservationsForDropdown(selectId) {
  try {
    const response = await fetch(`${API_URL}/reservations`);
    const reservations = await response.json();

    const select = document.getElementById(selectId);
    select.innerHTML = '<option value="">Select Reservation</option>';
    const activeReservations = reservations.filter(r => r.status === 'confirmed');
    activeReservations.forEach(res => {
      const option = document.createElement('option');
      option.value = res.id;
      option.textContent = `${res.guestName} - Room ${res.roomNumber} (${res.checkInDate})`;
      select.appendChild(option);
    });
  } catch (error) {
    console.error('Error loading reservations:', error);
  }
}

// ============ CHECK-IN/CHECK-OUT ============
async function loadCheckInSelects() {
  loadReservationsForDropdown('ciReservation');
}

document.getElementById('checkInForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const reservationId = document.getElementById('ciReservation').value;
  if (!reservationId) {
    alert('Please select a reservation');
    return;
  }

  const reservation = reservationCache[reservationId];
  if (!reservation) {
    alert('Reservation not found');
    return;
  }

  const checkIn = {
    reservationId,
    guestId: reservation.guestId,
    roomId: reservation.roomId,
    notes: document.getElementById('ciNotes').value,
  };

  try {
    const response = await fetch(`${API_URL}/check-ins`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(checkIn),
    });

    if (response.ok) {
      const checkInData = await response.json();
      checkInCache[checkInData.id] = checkInData;
      alert('Check-in successful!');
      document.getElementById('checkInForm').reset();
      updateCheckInSelects();
    } else {
      const error = await response.json();
      alert(`Error: ${error.error}`);
    }
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
});

async function updateCheckInSelects() {
  try {
    const response = await fetch(`${API_URL}/check-ins`);
    if (!response.ok) return;

    const checkIns = await response.json();
    const select = document.getElementById('coCheckIn');
    select.innerHTML = '<option value="">Select Check-in Record</option>';

    checkIns.forEach(checkIn => {
      if (checkIn.status === 'checked_in') {
        const option = document.createElement('option');
        option.value = checkIn.id;
        option.textContent = `Guest ${checkIn.guestId.substring(0, 8)} - Room ${checkIn.roomId}`;
        select.appendChild(option);
        checkInCache[checkIn.id] = checkIn;
      }
    });
  } catch (error) {
    console.error('Error loading check-ins:', error);
  }
}

async function updateCheckInStatus() {
  updateCheckInSelects();
}

async function updateCheckOutStatus() {
  updateCheckInSelects();
}

document.getElementById('checkOutForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const checkOut = {
    checkInId: document.getElementById('coCheckIn').value,
    roomCondition: document.getElementById('roomCondition').value,
    damageNotes: document.getElementById('damageNotes').value,
  };

  try {
    const response = await fetch(`${API_URL}/check-outs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(checkOut),
    });

    if (response.ok) {
      alert('Check-out successful!');
      document.getElementById('checkOutForm').reset();
      updateCheckInSelects();
      loadBillingSelects();
    } else {
      const error = await response.json();
      alert(`Error: ${error.error}`);
    }
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
});

// ============ BILLING ============
async function loadBillingSelects() {
  loadReservationsForDropdown('billReservation');
}

document.getElementById('billingForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const reservationId = document.getElementById('billReservation').value;
  if (!reservationId) {
    alert('Please select a reservation');
    return;
  }

  const reservation = reservationCache[reservationId];
  if (!reservation) {
    alert('Reservation not found');
    return;
  }

  const billing = {
    reservationId,
    guestId: reservation.guestId,
    services: parseFloat(document.getElementById('servicesCharge').value) || 0,
    food: parseFloat(document.getElementById('foodCharge').value) || 0,
    otherCharges: parseFloat(document.getElementById('otherCharges').value) || 0,
    paymentMethod: document.getElementById('paymentMethod').value,
  };

  try {
    const response = await fetch(`${API_URL}/billing`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(billing),
    });

    if (response.ok) {
      alert('Bill created successfully!');
      document.getElementById('billingForm').reset();
      loadBillingRecords();
    } else {
      const error = await response.json();
      alert(`Error: ${error.error}`);
    }
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
});

async function loadBillingRecords() {
  // Implement after adding billing endpoints
}

// ============ STAFF MANAGEMENT ============
document.getElementById('staffForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const assignment = {
    staffName: document.getElementById('staffName').value,
    staffRole: document.getElementById('staffRole').value,
    assignedRoom: document.getElementById('assignedRoom').value || null,
    taskDescription: document.getElementById('taskDescription').value,
    priority: document.getElementById('taskPriority').value,
  };

  try {
    const response = await fetch(`${API_URL}/staff-assignments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(assignment),
    });

    if (response.ok) {
      alert('Task assigned successfully!');
      document.getElementById('staffForm').reset();
      loadStaffAssignments();
    } else {
      const error = await response.json();
      alert(`Error: ${error.error}`);
    }
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
});

async function loadStaffAssignments() {
  try {
    const response = await fetch(`${API_URL}/staff-assignments`);
    const assignments = await response.json();

    let html = '<ul class="list">';
    assignments.forEach(assignment => {
      const statusColor = assignment.status === 'completed' ? '#4caf50' : '#ff9800';
      html += `
        <li class="list-item">
          <h4>${assignment.staffName} (${assignment.staffRole})</h4>
          <p><strong>Task:</strong> ${assignment.taskDescription}</p>
          <p><strong>Room:</strong> ${assignment.assignedRoom || 'N/A'}</p>
          <p><strong>Priority:</strong> ${assignment.priority}</p>
          <p><strong>Status:</strong> <span style="color: ${statusColor};">${assignment.status}</span></p>
        </li>
      `;
    });
    html += '</ul>';

    document.getElementById('staffList').innerHTML = html || '<p>No staff assignments</p>';
  } catch (error) {
    console.error('Error loading staff assignments:', error);
  }
}

// ============ SERVICE REQUESTS ============
document.getElementById('serviceForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const reservationId = document.getElementById('serviceReservation').value;
  if (!reservationId) {
    alert('Please select a reservation');
    return;
  }

  const reservation = reservationCache[reservationId];
  if (!reservation) {
    alert('Reservation not found');
    return;
  }

  const serviceRequest = {
    reservationId,
    guestId: reservation.guestId,
    roomId: reservation.roomId,
    serviceType: document.getElementById('serviceType').value,
    description: document.getElementById('serviceDescription').value,
    priority: document.getElementById('servicePriority').value,
  };

  try {
    const response = await fetch(`${API_URL}/service-requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(serviceRequest),
    });

    if (response.ok) {
      alert('Service request submitted!');
      document.getElementById('serviceForm').reset();
      loadServiceRequests();
    } else {
      const error = await response.json();
      alert(`Error: ${error.error}`);
    }
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
});

async function loadServiceRequests() {
  try {
    const response = await fetch(`${API_URL}/service-requests`);
    const requests = await response.json();

    let html = '<ul class="list">';
    requests.forEach(req => {
      const statusColor = req.status === 'completed' ? '#4caf50' : '#ff9800';
      html += `
        <li class="list-item">
          <h4>${req.serviceType}</h4>
          <p><strong>Description:</strong> ${req.description}</p>
          <p><strong>Room:</strong> ${req.roomId.substring(0, 8)}</p>
          <p><strong>Priority:</strong> ${req.priority}</p>
          <p><strong>Status:</strong> <span style="color: ${statusColor};">${req.status}</span></p>
        </li>
      `;
    });
    html += '</ul>';

    document.getElementById('servicesList').innerHTML = html || '<p>No service requests</p>';
  } catch (error) {
    console.error('Error loading service requests:', error);
  }
}

// ============ REPORTS ============
async function generateHotelStatusReport() {
  try {
    const response = await fetch(`${API_URL}/reports/hotel-status`);
    const report = await response.json();

    const html = `
      <div class="report">
        <p><strong>Total Rooms:</strong> ${report.totalRooms}</p>
        <p><strong>Occupied:</strong> ${report.occupiedRooms}</p>
        <p><strong>In Cleaning:</strong> ${report.cleaningRooms}</p>
        <p><strong>Available:</strong> ${report.availableRooms}</p>
        <p><strong>Occupancy Rate:</strong> ${report.occupancyRate}%</p>
        <p><strong>Generated:</strong> ${new Date(report.generatedAt).toLocaleString()}</p>
      </div>
    `;
    document.getElementById('hotelReport').innerHTML = html;
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
}

async function generateOccupancyReport() {
  try {
    const response = await fetch(`${API_URL}/reports/occupancy`);
    const data = await response.json();

    let html = '<div class="report"><table style="width: 100%; border-collapse: collapse;">';
    html += '<tr style="background: #667eea; color: white;"><th style="padding: 10px; border: 1px solid #ddd;">Room #</th><th style="padding: 10px; border: 1px solid #ddd;">Type</th><th style="padding: 10px; border: 1px solid #ddd;">Reservations</th><th style="padding: 10px; border: 1px solid #ddd;">Total Nights</th><th style="padding: 10px; border: 1px solid #ddd;">Revenue</th></tr>';
    data.forEach(row => {
      html += `<tr>
        <td style="padding: 10px; border: 1px solid #ddd;">${row.roomNumber}</td>
        <td style="padding: 10px; border: 1px solid #ddd;">${row.type}</td>
        <td style="padding: 10px; border: 1px solid #ddd;">${row.reservationCount || 0}</td>
        <td style="padding: 10px; border: 1px solid #ddd;">${row.totalNights || 0}</td>
        <td style="padding: 10px; border: 1px solid #ddd;">$${(row.totalRevenue || 0).toFixed(2)}</td>
      </tr>`;
    });
    html += '</table></div>';
    document.getElementById('occupancyReport').innerHTML = html;
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
}

async function generateRevenueReport() {
  try {
    const response = await fetch(`${API_URL}/reports/revenue`);
    const data = await response.json();

    let html = '<div class="report"><table style="width: 100%; border-collapse: collapse;">';
    html += '<tr style="background: #667eea; color: white;"><th style="padding: 10px; border: 1px solid #ddd;">Date</th><th style="padding: 10px; border: 1px solid #ddd;">Checkouts</th><th style="padding: 10px; border: 1px solid #ddd;">Room Revenue</th><th style="padding: 10px; border: 1px solid #ddd;">Services</th><th style="padding: 10px; border: 1px solid #ddd;">Total</th></tr>';
    data.forEach(row => {
      html += `<tr>
        <td style="padding: 10px; border: 1px solid #ddd;">${row.billingDate}</td>
        <td style="padding: 10px; border: 1px solid #ddd;">${row.checkouts}</td>
        <td style="padding: 10px; border: 1px solid #ddd;">$${(row.roomRevenue || 0).toFixed(2)}</td>
        <td style="padding: 10px; border: 1px solid #ddd;">$${(row.serviceRevenue || 0).toFixed(2)}</td>
        <td style="padding: 10px; border: 1px solid #ddd;">$${(row.totalRevenue || 0).toFixed(2)}</td>
      </tr>`;
    });
    html += '</table></div>';
    document.getElementById('revenueReport').innerHTML = html;
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
}

// Initialize
connectWebSocket();
loadRooms();
loadGuests();
