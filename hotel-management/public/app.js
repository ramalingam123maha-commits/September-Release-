// State
let hotelState = {
  rooms: [],
  reservations: [],
  billingInvoices: [],
  staffTasks: []
};

let currentRoomFilter = 'All';
let selectedInvoice = null;
let socket = null;

// WebSocket Setup
function initWebSocket() {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${protocol}//${window.location.host}`;
  const indicator = document.getElementById('wsIndicator');
  const statusText = document.getElementById('wsStatusText');

  socket = new WebSocket(wsUrl);

  socket.onopen = () => {
    indicator.classList.add('online');
    statusText.textContent = 'Connected (Live)';
    setTicker('Connected to Grand Horizon Real-Time Event Bus');
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      handleServerEvent(data);
    } catch (e) {
      console.error('Error parsing WS message', e);
    }
  };

  socket.onclose = () => {
    indicator.classList.remove('online');
    statusText.textContent = 'Disconnected';
    setTicker('WebSocket connection lost. Reconnecting in 3s...');
    setTimeout(initWebSocket, 3000);
  };

  socket.onerror = (err) => {
    indicator.classList.remove('online');
    statusText.textContent = 'Error';
  };
}

function setTicker(msg) {
  const ticker = document.getElementById('tickerMessage');
  if (ticker) ticker.textContent = msg;
}

// Event Dispatcher from WebSocket
function handleServerEvent(event) {
  const { type, payload } = event;

  switch (type) {
    case 'INIT_STATE':
      hotelState = payload;
      renderAll();
      break;

    case 'BOOKING_CREATED':
      hotelState.reservations.push(payload.reservation);
      updateRoomInState(payload.room);
      if (payload.invoice) hotelState.billingInvoices.push(payload.invoice);
      setTicker(`New booking confirmed for ${payload.reservation.guestName} (Room ${payload.reservation.roomNumber})`);
      renderAll();
      break;

    case 'CHECK_IN':
      updateReservationInState(payload.reservation);
      updateRoomInState(payload.room);
      if (payload.staffTask) hotelState.staffTasks.unshift(payload.staffTask);
      setTicker(`Check-in completed: ${payload.reservation.guestName} into Room ${payload.reservation.roomNumber}`);
      renderAll();
      break;

    case 'CHECK_OUT':
      updateReservationInState(payload.reservation);
      updateRoomInState(payload.room);
      if (payload.staffTask) hotelState.staffTasks.unshift(payload.staffTask);
      setTicker(`Check-out completed: Room ${payload.reservation.roomNumber} is now available for turnaround`);
      renderAll();
      break;

    case 'BOOKING_CANCELLED':
      hotelState.reservations = hotelState.reservations.filter(r => r.id !== payload.reservationId);
      const rm = hotelState.rooms.find(r => r.id === payload.roomId);
      if (rm && rm.status === 'Reserved') rm.status = 'Available';
      setTicker(`Reservation ${payload.reservationId} was cancelled`);
      renderAll();
      break;

    case 'BILLING_UPDATED':
      const invIdx = hotelState.billingInvoices.findIndex(i => i.invoiceId === payload.invoice.invoiceId);
      if (invIdx !== -1) hotelState.billingInvoices[invIdx] = payload.invoice;
      else hotelState.billingInvoices.push(payload.invoice);
      setTicker(`Billing updated for Invoice ${payload.invoice.invoiceId} (${payload.invoice.guestName})`);
      renderAll();
      break;

    case 'STAFF_TASK_CREATED':
      hotelState.staffTasks.unshift(payload.task);
      setTicker(`Staff task dispatched: ${payload.task.title} [${payload.task.department}]`);
      renderAll();
      break;

    case 'STAFF_TASK_UPDATED':
      const tIdx = hotelState.staffTasks.findIndex(t => t.id === payload.task.id);
      if (tIdx !== -1) hotelState.staffTasks[tIdx] = payload.task;
      setTicker(`Task updated: ${payload.task.title} -> ${payload.task.status}`);
      renderAll();
      break;
  }
}

function updateRoomInState(room) {
  if (!room) return;
  const idx = hotelState.rooms.findIndex(r => r.id === room.id);
  if (idx !== -1) hotelState.rooms[idx] = room;
}

function updateReservationInState(res) {
  if (!res) return;
  const idx = hotelState.reservations.findIndex(r => r.id === res.id);
  if (idx !== -1) hotelState.reservations[idx] = res;
}

// Navigation Tabs
function setupNavigation() {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-tab');
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b === btn));
      document.querySelectorAll('.content-pane').forEach(p => p.classList.toggle('active', p.id === `pane-${tab}`));

      const headers = {
        rooms: { title: 'Rooms & Occupancy Matrix', sub: 'Real-time room availability, pricing, and guest turnover status' },
        reservations: { title: 'Reservation Management', sub: 'Comprehensive guest booking schedules and booking records' },
        checkinout: { title: 'Arrivals & Departures Desk', sub: 'One-click check-ins, key allocations, and departure check-outs' },
        billing: { title: 'Billing, Folios & Ledger', sub: 'Real-time invoicing, incidentals, restaurant charges, and settlement' },
        staff: { title: 'Staff Coordination & Work Orders', sub: 'Live task board for Housekeeping, Engineering, and Concierge' }
      };

      if (headers[tab]) {
        document.getElementById('tabHeading').textContent = headers[tab].title;
        document.getElementById('tabSubtitle').textContent = headers[tab].sub;
      }
    });
  });
}

// KPI Ribbon
function renderKPIs() {
  const total = hotelState.rooms.length;
  const occupied = hotelState.rooms.filter(r => r.status === 'Occupied').length;
  const activeBookings = hotelState.reservations.filter(r => r.status === 'Confirmed' || r.status === 'Checked-In').length;
  const pendingTasks = hotelState.staffTasks.filter(t => t.status !== 'Completed').length;

  document.getElementById('kpiTotalRooms').textContent = total;
  const occPct = total > 0 ? Math.round((occupied / total) * 100) : 0;
  document.getElementById('kpiOccupancy').textContent = `${occPct}%`;
  document.getElementById('kpiOccupancyDetail').textContent = `${occupied} of ${total} occupied`;
  document.getElementById('kpiActiveBookings').textContent = activeBookings;
  document.getElementById('kpiPendingTasks').textContent = pendingTasks;
}

// Rooms Matrix
function filterRooms(filter) {
  currentRoomFilter = filter;
  document.querySelectorAll('.pill').forEach(p => {
    p.classList.toggle('active', p.textContent === filter);
  });
  renderRooms();
}

function renderRooms() {
  const container = document.getElementById('roomsGrid');
  container.innerHTML = '';

  const filtered = hotelState.rooms.filter(r => currentRoomFilter === 'All' || r.status === currentRoomFilter);

  filtered.forEach(room => {
    const card = document.createElement('div');
    card.className = `room-card status-${room.status.toLowerCase()}`;
    card.innerHTML = `
      <div class="room-top">
        <span class="room-number">Room ${room.number}</span>
        <span class="badge badge-${getBadgeClass(room.status)}">${room.status}</span>
      </div>
      <div class="room-type">${room.type} &bull; Floor ${room.floor}</div>
      <div class="room-meta">
        <span>Capacity: ${room.capacity} Guests</span>
        <span class="room-price">$${room.price}/night</span>
      </div>
    `;
    container.appendChild(card);
  });
}

function getBadgeClass(status) {
  switch (status) {
    case 'Available': return 'success';
    case 'Occupied': return 'danger';
    case 'Reserved': return 'info';
    case 'Maintenance': return 'warning';
    case 'Paid': return 'success';
    case 'Partial': return 'warning';
    case 'Unpaid': return 'danger';
    default: return 'info';
  }
}

// Reservations Table
function renderReservations() {
  const tbody = document.getElementById('reservationsTableBody');
  tbody.innerHTML = '';

  if (hotelState.reservations.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:20px; color:var(--text-dim);">No reservations recorded.</td></tr>`;
    return;
  }

  hotelState.reservations.forEach(res => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${res.id}</strong></td>
      <td><strong>${res.guestName}</strong></td>
      <td><small>${res.guestEmail}<br>${res.guestPhone}</small></td>
      <td>Room ${res.roomNumber} (${res.roomType})</td>
      <td>${res.checkInDate}</td>
      <td>${res.checkOutDate}</td>
      <td><strong>$${res.totalAmount}</strong></td>
      <td><span class="badge badge-${res.status === 'Checked-In' ? 'danger' : (res.status === 'Confirmed' ? 'info' : 'success')}">${res.status}</span></td>
      <td>
        <div style="display:flex; gap:6px;">
          ${res.status === 'Confirmed' ? `<button class="btn btn-sm btn-gold" onclick="performCheckIn('${res.id}')">Check-In</button>` : ''}
          ${res.status === 'Checked-In' ? `<button class="btn btn-sm btn-outline" onclick="performCheckOut('${res.id}')">Check-Out</button>` : ''}
          <button class="btn btn-sm btn-outline" onclick="cancelReservation('${res.id}')">✕</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Check-in / Out Desk
function renderCheckInOutDesk() {
  const checkInList = document.getElementById('checkInList');
  const checkOutList = document.getElementById('checkOutList');
  checkInList.innerHTML = '';
  checkOutList.innerHTML = '';

  const confirmed = hotelState.reservations.filter(r => r.status === 'Confirmed');
  if (confirmed.length === 0) {
    checkInList.innerHTML = `<div style="color:var(--text-dim); padding:16px;">No pending guest arrivals at this hour.</div>`;
  } else {
    confirmed.forEach(r => {
      const item = document.createElement('div');
      item.className = 'desk-item';
      item.innerHTML = `
        <div>
          <strong>${r.guestName}</strong> &bull; Room ${r.roomNumber} (${r.roomType})
          <div style="font-size:0.8rem; color:var(--text-dim);">Arrival: ${r.checkInDate} to ${r.checkOutDate} | Balance: $${r.totalAmount - (r.paidAmount || 0)}</div>
        </div>
        <button class="btn btn-gold btn-sm" onclick="performCheckIn('${r.id}')">🛎️ Check In Now</button>
      `;
      checkInList.appendChild(item);
    });
  }

  const inHouse = hotelState.reservations.filter(r => r.status === 'Checked-In');
  if (inHouse.length === 0) {
    checkOutList.innerHTML = `<div style="color:var(--text-dim); padding:16px;">No guests currently in-house.</div>`;
  } else {
    inHouse.forEach(r => {
      const item = document.createElement('div');
      item.className = 'desk-item';
      item.innerHTML = `
        <div>
          <strong>${r.guestName}</strong> &bull; Room ${r.roomNumber}
          <div style="font-size:0.8rem; color:var(--text-dim);">Scheduled Departure: ${r.checkOutDate}</div>
        </div>
        <button class="btn btn-outline btn-sm" onclick="performCheckOut('${r.id}')">🚪 Check Out</button>
      `;
      checkOutList.appendChild(item);
    });
  }
}

// Check-In & Check-Out Actions
async function performCheckIn(resId) {
  try {
    const res = await fetch(`/api/reservations/${resId}/checkin`, { method: 'POST' });
    if (!res.ok) throw new Error('Check in failed');
  } catch (err) {
    alert(err.message);
  }
}

async function performCheckOut(resId) {
  try {
    const res = await fetch(`/api/reservations/${resId}/checkout`, { method: 'POST' });
    if (!res.ok) throw new Error('Check out failed');
  } catch (err) {
    alert(err.message);
  }
}

async function cancelReservation(resId) {
  if (confirm('Cancel this reservation?')) {
    try {
      await fetch(`/api/reservations/${resId}`, { method: 'DELETE' });
    } catch (e) {
      alert('Failed to cancel');
    }
  }
}

// Billing Table & Folios
function renderBilling() {
  const tbody = document.getElementById('billingTableBody');
  tbody.innerHTML = '';

  if (hotelState.billingInvoices.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:20px; color:var(--text-dim);">No billing invoices issued.</td></tr>`;
    return;
  }

  hotelState.billingInvoices.forEach(inv => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${inv.invoiceId}</strong></td>
      <td><strong>${inv.guestName}</strong></td>
      <td>Room ${inv.roomNumber}</td>
      <td>$${inv.subtotal.toFixed(2)}</td>
      <td>$${inv.tax.toFixed(2)}</td>
      <td><strong>$${inv.total.toFixed(2)}</strong></td>
      <td>$${inv.paid.toFixed(2)}</td>
      <td><span class="badge badge-${getBadgeClass(inv.status)}">${inv.status}</span></td>
      <td>
        <button class="btn btn-sm btn-outline" onclick="viewInvoiceDetail('${inv.invoiceId}')">View Folio</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function viewInvoiceDetail(invoiceId) {
  const inv = hotelState.billingInvoices.find(i => i.invoiceId === invoiceId);
  if (!inv) return;
  selectedInvoice = inv;

  const sec = document.getElementById('invoiceDetailSection');
  sec.style.display = 'block';
  document.getElementById('invoiceDetailTitle').textContent = `Folio ${inv.invoiceId} - ${inv.guestName} (Room ${inv.roomNumber})`;

  let itemsHtml = `
    <table class="horizon-table mb-24">
      <thead>
        <tr>
          <th>Description</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>
  `;
  inv.items.forEach(item => {
    itemsHtml += `
      <tr>
        <td>${item.desc}</td>
        <td>$${Number(item.amount).toFixed(2)}</td>
      </tr>
    `;
  });
  itemsHtml += `
      </tbody>
    </table>
    <div style="background:var(--bg-deep); padding:16px; border-radius:8px; display:flex; justify-content:space-between; align-items:center;">
      <div>
        <strong>Payment Status: </strong> <span class="badge badge-${getBadgeClass(inv.status)}">${inv.status}</span>
        <div style="font-size:0.8rem; color:var(--text-dim);">Method: ${inv.paymentMethod || 'Unspecified'} | Paid: $${inv.paid.toFixed(2)}</div>
      </div>
      <div style="text-align:right;">
        <div style="color:var(--text-dim);">Subtotal: $${inv.subtotal.toFixed(2)} | Tax: $${inv.tax.toFixed(2)}</div>
        <div style="font-size:1.3rem; font-weight:700; color:var(--gold);">Grand Total: $${inv.total.toFixed(2)}</div>
      </div>
    </div>
  `;

  document.getElementById('invoiceDetailBody').innerHTML = itemsHtml;
}

async function promptAddCharge() {
  if (!selectedInvoice) return;
  const desc = prompt('Enter service charge description (e.g., Room Service Champagne, Laundry):');
  if (!desc) return;
  const amt = prompt('Enter charge amount ($):', '50');
  if (!amt || isNaN(amt)) return;

  try {
    const res = await fetch(`/api/billing/${selectedInvoice.invoiceId}/charge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ desc, amount: parseFloat(amt) })
    });
    const updated = await res.json();
    selectedInvoice = updated;
    viewInvoiceDetail(updated.invoiceId);
  } catch (err) {
    alert(err.message);
  }
}

async function promptSettlePayment() {
  if (!selectedInvoice) return;
  const balance = selectedInvoice.total - selectedInvoice.paid;
  if (balance <= 0) {
    alert('This folio has already been settled in full.');
    return;
  }
  const amt = prompt(`Enter payment amount to apply (Balance: $${balance.toFixed(2)}):`, balance.toFixed(2));
  if (!amt || isNaN(amt)) return;

  try {
    const res = await fetch(`/api/billing/${selectedInvoice.invoiceId}/pay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: parseFloat(amt), method: 'Credit Card / Terminal' })
    });
    const updated = await res.json();
    selectedInvoice = updated;
    viewInvoiceDetail(updated.invoiceId);
  } catch (err) {
    alert(err.message);
  }
}

// Staff Coordination Kanban
function renderStaffTasks() {
  const pendingCol = document.getElementById('tasksPendingList');
  const progressCol = document.getElementById('tasksProgressList');
  const completedCol = document.getElementById('tasksCompletedList');

  pendingCol.innerHTML = '';
  progressCol.innerHTML = '';
  completedCol.innerHTML = '';

  let pendingCount = 0;
  let progressCount = 0;
  let completedCount = 0;

  hotelState.staffTasks.forEach(task => {
    const card = document.createElement('div');
    card.className = 'task-card';
    card.innerHTML = `
      <h4>${task.title}</h4>
      <div style="font-size:0.8rem; color:var(--gold); font-weight:600;">Room: ${task.roomNumber} &bull; ${task.department}</div>
      <p style="font-size:0.78rem; color:var(--text-dim); margin-top:4px;">${task.notes || 'No special notes'}</p>
      <div class="task-meta">
        <span>👤 ${task.assignee}</span>
        <span class="badge badge-${task.priority === 'Urgent' ? 'danger' : 'info'}">${task.priority}</span>
      </div>
      <div style="display:flex; gap:6px; margin-top:10px;">
        ${task.status === 'Pending' ? `<button class="btn btn-sm btn-gold" onclick="updateTaskStatus('${task.id}', 'In Progress')">Start</button>` : ''}
        ${task.status === 'In Progress' ? `<button class="btn btn-sm btn-outline" onclick="updateTaskStatus('${task.id}', 'Completed')">Complete</button>` : ''}
        ${task.status === 'Completed' ? `<span style="font-size:0.75rem; color:var(--success);">✓ Inspected</span>` : ''}
      </div>
    `;

    if (task.status === 'Pending') {
      pendingCol.appendChild(card);
      pendingCount++;
    } else if (task.status === 'In Progress') {
      progressCol.appendChild(card);
      progressCount++;
    } else {
      completedCol.appendChild(card);
      completedCount++;
    }
  });

  document.getElementById('staffPendingCount').textContent = pendingCount;
  document.getElementById('staffProgressCount').textContent = progressCount;
  document.getElementById('staffCompletedCount').textContent = completedCount;
}

async function updateTaskStatus(taskId, status) {
  try {
    await fetch(`/api/staff-tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
  } catch (err) {
    alert(err.message);
  }
}

// Modals
function openNewBookingModal() {
  const sel = document.getElementById('resRoomSelect');
  sel.innerHTML = '';
  hotelState.rooms.forEach(r => {
    sel.innerHTML += `<option value="${r.id}" ${r.status !== 'Available' ? 'disabled' : ''}>
      Room ${r.number} (${r.type} - $${r.price}/night) - [${r.status}]
    </option>`;
  });

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 4);

  document.getElementById('resCheckIn').value = tomorrow.toISOString().split('T')[0];
  document.getElementById('resCheckOut').value = nextWeek.toISOString().split('T')[0];

  document.getElementById('bookingModal').classList.add('open');
}

function openNewTaskModal() {
  document.getElementById('taskModal').classList.add('open');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

async function submitNewBooking(e) {
  e.preventDefault();
  const guestName = document.getElementById('resGuestName').value.trim();
  const guestEmail = document.getElementById('resGuestEmail').value.trim();
  const guestPhone = document.getElementById('resGuestPhone').value.trim();
  const roomId = document.getElementById('resRoomSelect').value;
  const checkInDate = document.getElementById('resCheckIn').value;
  const checkOutDate = document.getElementById('resCheckOut').value;
  const paidAmount = parseFloat(document.getElementById('resAdvancePayment').value) || 0;

  try {
    const res = await fetch('/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guestName, guestEmail, guestPhone, roomId, checkInDate, checkOutDate, paidAmount })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create booking');
    }
    closeModal('bookingModal');
    document.getElementById('bookingForm').reset();
  } catch (err) {
    alert(err.message);
  }
}

async function submitNewTask(e) {
  e.preventDefault();
  const title = document.getElementById('taskTitle').value.trim();
  const department = document.getElementById('taskDepartment').value;
  const roomNumber = document.getElementById('taskRoom').value.trim();
  const assignee = document.getElementById('taskAssignee').value.trim();
  const priority = document.getElementById('taskPriority').value;
  const notes = document.getElementById('taskNotes').value.trim();

  try {
    const res = await fetch('/api/staff-tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, department, roomNumber, assignee, priority, notes })
    });
    if (!res.ok) throw new Error('Failed to create task');
    closeModal('taskModal');
    document.getElementById('taskForm').reset();
  } catch (err) {
    alert(err.message);
  }
}

// Master Render
function renderAll() {
  renderKPIs();
  renderRooms();
  renderReservations();
  renderCheckInOutDesk();
  renderBilling();
  renderStaffTasks();
}

// Init on load
document.addEventListener('DOMContentLoaded', () => {
  setupNavigation();
  initWebSocket();
});
