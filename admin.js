/* ============================================
   SynthWork — Admin Dashboard Logic
   Auth, bookings CRUD, contacts view, Supabase
   ============================================ */

const ADMIN_PASSWORD = 'synthwork2026';
let currentBookings = [];
let currentContacts = [];

document.addEventListener('DOMContentLoaded', () => {
  // Check if already logged in
  if (sessionStorage.getItem('synthwork_admin') === 'true') {
    showDashboard();
  }

  initLogin();
  initLogout();
  initTabs();
  initPasswordToggle();
  initModalClose();
  initStatusFilter();
  initRefresh();
  initClearButtons();
});

// ===== AUTH =====

function initLogin() {
  const form = document.getElementById('loginForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const password = document.getElementById('adminPassword').value;

    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem('synthwork_admin', 'true');
      showDashboard();
    } else {
      document.getElementById('passwordGroup').classList.add('error');
      document.getElementById('adminPassword').value = '';
      document.getElementById('adminPassword').focus();
    }
  });
}

function initLogout() {
  const btn = document.getElementById('logoutBtn');
  if (btn) {
    btn.addEventListener('click', () => {
      sessionStorage.removeItem('synthwork_admin');
      document.getElementById('adminDashboard').style.display = 'none';
      document.getElementById('adminLogin').style.display = 'flex';
      showToast('info', 'Logged Out', 'You have been logged out of the admin panel.');
    });
  }
}

function showDashboard() {
  document.getElementById('adminLogin').style.display = 'none';
  document.getElementById('adminDashboard').style.display = 'block';
  loadBookings();
  loadContacts();
}

function initPasswordToggle() {
  const toggle = document.getElementById('passwordToggle');
  const input = document.getElementById('adminPassword');
  if (!toggle || !input) return;

  toggle.addEventListener('click', () => {
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
    toggle.querySelector('.eye-open').style.display = isPassword ? 'none' : 'block';
    toggle.querySelector('.eye-closed').style.display = isPassword ? 'block' : 'none';
  });
}

// ===== TABS =====

function initTabs() {
  const tabs = document.querySelectorAll('.admin-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const tabName = tab.dataset.tab;
      document.getElementById('panelBookings').style.display = tabName === 'bookings' ? 'block' : 'none';
      document.getElementById('panelContacts').style.display = tabName === 'contacts' ? 'block' : 'none';
    });
  });
}

// ===== STATUS FILTER =====

function initStatusFilter() {
  const filter = document.getElementById('statusFilter');
  if (filter) {
    filter.addEventListener('change', () => loadBookings());
  }
}

function initRefresh() {
  const btn = document.getElementById('refreshBtn');
  if (btn) {
    btn.addEventListener('click', () => {
      loadBookings();
      loadContacts();
      showToast('info', 'Refreshed', 'Data has been refreshed.');
    });
  }
}

// ===== LOAD BOOKINGS =====

async function loadBookings() {
  const tbody = document.getElementById('bookingsBody');
  if (!tbody) return;

  tbody.innerHTML = '<tr><td colspan="6" class="table-empty"><span class="spinner" style="margin: 0 auto;"></span></td></tr>';

  try {
    if (!window.sbClient) {
      tbody.innerHTML = '<tr><td colspan="6" class="table-empty">Supabase not connected. Please check configuration.</td></tr>';
      return;
    }

    const filter = document.getElementById('statusFilter').value;
    let query = window.sbClient.from('bookings').select('*').order('created_at', { ascending: false });

    if (filter !== 'all') {
      query = query.eq('status', filter);
    }

    const { data, error } = await query;

    if (error) throw error;

    currentBookings = data || [];
    updateStats();
    renderBookings(currentBookings);
  } catch (err) {
    console.error('Load bookings error:', err);
    tbody.innerHTML = '<tr><td colspan="6" class="table-empty">Failed to load bookings. Check your Supabase connection.</td></tr>';
  }
}

function renderBookings(bookings) {
  const tbody = document.getElementById('bookingsBody');
  if (!tbody) return;

  if (!bookings.length) {
    tbody.innerHTML = '<tr><td colspan="6" class="table-empty">No bookings found.</td></tr>';
    return;
  }

  tbody.innerHTML = bookings.map(b => `
    <tr>
      <td data-label="Name">
        <div>
          <span class="table-name">${escapeHtml(b.name)}</span>
          <br><span class="table-email">${escapeHtml(b.email)}</span>
        </div>
      </td>
      <td data-label="Service">${escapeHtml(b.service)}</td>
      <td data-label="Date">${b.booked_date ? formatDate(b.booked_date) : '—'}</td>
      <td data-label="Time">${b.booked_time ? formatTime(b.booked_time) : '—'}</td>
      <td data-label="Status"><span class="badge badge-${b.status}">${b.status}</span></td>
      <td data-label="Actions">
        <div class="table-actions">
          <button class="table-action-btn view" onclick="viewBooking(${b.id})">View</button>
          ${b.status === 'pending' ? `
            <button class="table-action-btn approve" onclick="approveBooking(${b.id})">Approve</button>
            <button class="table-action-btn decline" onclick="declineBooking(${b.id})">Decline</button>
          ` : ''}
        </div>
      </td>
    </tr>
  `).join('');
}

// ===== LOAD CONTACTS =====

async function loadContacts() {
  const tbody = document.getElementById('contactsBody');
  if (!tbody) return;

  tbody.innerHTML = '<tr><td colspan="4" class="table-empty"><span class="spinner" style="margin: 0 auto;"></span></td></tr>';

  try {
    if (!window.sbClient) {
      tbody.innerHTML = '<tr><td colspan="4" class="table-empty">Supabase not connected.</td></tr>';
      return;
    }

    const { data, error } = await window.sbClient
      .from('contact_submissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    currentContacts = data || [];
    renderContacts(currentContacts);
  } catch (err) {
    console.error('Load contacts error:', err);
    tbody.innerHTML = '<tr><td colspan="4" class="table-empty">Failed to load messages.</td></tr>';
  }
}

function renderContacts(contacts) {
  const tbody = document.getElementById('contactsBody');
  if (!tbody) return;

  if (!contacts.length) {
    tbody.innerHTML = '<tr><td colspan="4" class="table-empty">No contact messages found.</td></tr>';
    return;
  }

  tbody.innerHTML = contacts.map(c => `
    <tr>
      <td data-label="Name"><span class="table-name">${escapeHtml(c.name)}</span></td>
      <td data-label="Email">${escapeHtml(c.email)}</td>
      <td data-label="Message"><span class="table-message">${escapeHtml(c.message)}</span></td>
      <td data-label="Date">${c.created_at ? new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</td>
    </tr>
  `).join('');
}

// ===== UPDATE STATS =====

async function updateStats() {
  try {
    if (!window.sbClient) return;

    const { data: all } = await window.sbClient.from('bookings').select('status');
    if (!all) return;

    const total = all.length;
    const pending = all.filter(b => b.status === 'pending').length;
    const approved = all.filter(b => b.status === 'approved').length;
    const declined = all.filter(b => b.status === 'declined').length;

    animateCounter('statTotal', total);
    animateCounter('statPending', pending);
    animateCounter('statApproved', approved);
    animateCounter('statDeclined', declined);
  } catch (err) {
    console.error('Stats error:', err);
  }
}

function animateCounter(id, target) {
  const el = document.getElementById(id);
  if (!el) return;

  const current = parseInt(el.textContent) || 0;
  if (current === target) return;

  const duration = 500;
  const step = (target - current) / (duration / 16);
  let value = current;

  const timer = setInterval(() => {
    value += step;
    if ((step > 0 && value >= target) || (step < 0 && value <= target)) {
      value = target;
      clearInterval(timer);
    }
    el.textContent = Math.round(value);
  }, 16);
}

// ===== BOOKING ACTIONS =====

function viewBooking(id) {
  const booking = currentBookings.find(b => b.id === id);
  if (!booking) return;

  const body = document.getElementById('modalBody');
  const actions = document.getElementById('modalActions');

  body.innerHTML = `
    <div class="detail-row"><span class="detail-label">Name</span><span class="detail-value">${escapeHtml(booking.name)}</span></div>
    <div class="detail-row"><span class="detail-label">Email</span><span class="detail-value">${escapeHtml(booking.email)}</span></div>
    <div class="detail-row"><span class="detail-label">Phone</span><span class="detail-value">${escapeHtml(booking.phone)}</span></div>
    <div class="detail-row"><span class="detail-label">Service</span><span class="detail-value">${escapeHtml(booking.service)}</span></div>
    <div class="detail-row"><span class="detail-label">Date</span><span class="detail-value">${booking.booked_date ? formatDate(booking.booked_date) : '—'}</span></div>
    <div class="detail-row"><span class="detail-label">Time</span><span class="detail-value">${booking.booked_time ? formatTime(booking.booked_time) : '—'}</span></div>
    <div class="detail-row"><span class="detail-label">Status</span><span class="detail-value"><span class="badge badge-${booking.status}">${booking.status}</span></span></div>
    ${booking.message ? `<div class="detail-row" style="flex-direction:column; gap:var(--space-sm);"><span class="detail-label">Message</span><span class="detail-value" style="text-align:left;max-width:100%;">${escapeHtml(booking.message)}</span></div>` : ''}
  `;

  if (booking.status === 'pending') {
    actions.innerHTML = `
      <button class="btn btn-success" onclick="approveBooking(${booking.id}); closeModal();">Approve</button>
      <button class="btn btn-danger" onclick="declineBooking(${booking.id}); closeModal();">Decline</button>
    `;
  } else {
    actions.innerHTML = `<button class="btn btn-outline" onclick="closeModal()" style="flex:1;">Close</button>`;
  }

  openModal();
}

async function approveBooking(id) {
  try {
    if (!window.sbClient) return;

    const { error } = await window.sbClient
      .from('bookings')
      .update({ status: 'approved', updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;

    const booking = currentBookings.find(b => b.id === id);
    if (booking) {
      await sendApprovalEmail(booking);
    }

    showToast('success', 'Booking Approved', 'The visitor has been notified via email.');
    loadBookings();
  } catch (err) {
    console.error('Approve error:', err);
    showToast('error', 'Action Failed', 'Could not approve the booking. Please try again.');
  }
}

async function declineBooking(id) {
  try {
    if (!window.sbClient) return;

    const { error } = await window.sbClient
      .from('bookings')
      .update({ status: 'declined', updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;

    const booking = currentBookings.find(b => b.id === id);
    if (booking) {
      await sendDeclineEmail(booking);
    }

    showToast('success', 'Booking Declined', 'The visitor has been notified.');
    loadBookings();
  } catch (err) {
    console.error('Decline error:', err);
    showToast('error', 'Action Failed', 'Could not decline the booking. Please try again.');
  }
}

// ===== CLEAR DATA =====

function initClearButtons() {
  const clearBookingsBtn = document.getElementById('clearBookingsBtn');
  const clearContactsBtn = document.getElementById('clearContactsBtn');

  if (clearBookingsBtn) {
    clearBookingsBtn.addEventListener('click', () => clearAllBookings());
  }
  if (clearContactsBtn) {
    clearContactsBtn.addEventListener('click', () => clearAllContacts());
  }
}

async function clearAllBookings() {
  if (!confirm('⚠️ Are you sure you want to delete ALL bookings?\n\nThis will permanently remove every pending, approved, and declined booking. This action cannot be undone.')) {
    return;
  }

  try {
    if (!window.sbClient) {
      showToast('error', 'Error', 'Supabase not connected.');
      return;
    }

    const { error } = await window.sbClient
      .from('bookings')
      .delete()
      .neq('id', 0); // deletes all rows

    if (error) throw error;

    currentBookings = [];
    showToast('success', 'Bookings Cleared', 'All bookings have been permanently deleted.');
    loadBookings();
  } catch (err) {
    console.error('Clear bookings error:', err);
    showToast('error', 'Clear Failed', 'Could not clear bookings: ' + err.message);
  }
}

async function clearAllContacts() {
  if (!confirm('⚠️ Are you sure you want to delete ALL contact messages?\n\nThis will permanently remove every contact submission. This action cannot be undone.')) {
    return;
  }

  try {
    if (!window.sbClient) {
      showToast('error', 'Error', 'Supabase not connected.');
      return;
    }

    const { error } = await window.sbClient
      .from('contact_submissions')
      .delete()
      .neq('id', 0); // deletes all rows

    if (error) throw error;

    currentContacts = [];
    showToast('success', 'Messages Cleared', 'All contact messages have been permanently deleted.');
    loadContacts();
  } catch (err) {
    console.error('Clear contacts error:', err);
    showToast('error', 'Clear Failed', 'Could not clear messages: ' + err.message);
  }
}

// ===== MODAL =====

function openModal() {
  document.getElementById('modalBackdrop').classList.add('active');
  document.getElementById('bookingModal').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modalBackdrop').classList.remove('active');
  document.getElementById('bookingModal').classList.remove('active');
  document.body.style.overflow = '';
}

function initModalClose() {
  const closeBtn = document.getElementById('modalClose');
  const backdrop = document.getElementById('modalBackdrop');

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (backdrop) backdrop.addEventListener('click', closeModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
}

// ===== HELPERS =====

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
