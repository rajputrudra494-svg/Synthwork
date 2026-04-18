/* ============================================
   SynthWork — Contact Page Logic
   Form validation, date picker, booking, Supabase
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  initDatePicker();
  initTimeSlots();
  initContactForm();
  initBookingForm();

  // Scroll to booking if hash present
  if (window.location.hash === '#booking') {
    setTimeout(() => {
      const el = document.getElementById('booking');
      if (el) {
        const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 72;
        window.scrollTo({ top: el.offsetTop - navH - 20, behavior: 'smooth' });
      }
    }, 300);
  }
});

// ===== DATE PICKER =====
let currentYear, currentMonth, selectedDate = null;

function initDatePicker() {
  const now = new Date();
  currentYear = now.getFullYear();
  currentMonth = now.getMonth();

  renderCalendar();

  document.getElementById('prevMonth').addEventListener('click', () => {
    currentMonth--;
    if (currentMonth < 0) { currentMonth = 11; currentYear--; }
    // Don't go before current month
    const now = new Date();
    if (currentYear < now.getFullYear() || (currentYear === now.getFullYear() && currentMonth < now.getMonth())) {
      currentMonth = now.getMonth();
      currentYear = now.getFullYear();
      return;
    }
    renderCalendar();
  });

  document.getElementById('nextMonth').addEventListener('click', () => {
    currentMonth++;
    if (currentMonth > 11) { currentMonth = 0; currentYear++; }
    // Max 3 months ahead
    const now = new Date();
    const maxDate = new Date(now.getFullYear(), now.getMonth() + 3, 1);
    if (new Date(currentYear, currentMonth) > maxDate) return;
    renderCalendar();
  });
}

function renderCalendar() {
  const grid = document.getElementById('dateGrid');
  const monthLabel = document.getElementById('currentMonth');
  if (!grid || !monthLabel) return;

  const months = ['January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December'];
  monthLabel.textContent = `${months[currentMonth]} ${currentYear}`;

  grid.innerHTML = '';

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Empty cells for days before the 1st
  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement('div');
    empty.className = 'date-cell empty';
    grid.appendChild(empty);
  }

  // Day cells
  for (let day = 1; day <= daysInMonth; day++) {
    const cell = document.createElement('div');
    cell.className = 'date-cell';
    cell.textContent = day;

    const date = new Date(currentYear, currentMonth, day);
    const dayOfWeek = date.getDay();
    const isPast = date < today;
    const isWednesday = dayOfWeek === 3;
    const isFriday = dayOfWeek === 5;
    const isToday = date.getTime() === today.getTime();

    if (isPast) {
      cell.classList.add('disabled');
    } else if (isWednesday || isFriday) {
      cell.classList.add('blocked');
    } else {
      cell.addEventListener('click', () => selectDate(date, cell));
    }

    if (isToday) {
      cell.classList.add('today');
    }

    // Check if this date is the selected one
    if (selectedDate && date.getTime() === selectedDate.getTime()) {
      cell.classList.add('selected');
    }

    grid.appendChild(cell);
  }
}

function selectDate(date, cell) {
  selectedDate = date;

  // Update hidden input
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  document.getElementById('bookDate').value = `${y}-${m}-${d}`;

  // Update visual
  document.querySelectorAll('.date-cell.selected').forEach(c => c.classList.remove('selected'));
  cell.classList.add('selected');

  // Clear error
  document.getElementById('bookDateGroup').classList.remove('error');
}

// ===== TIME SLOTS =====
function initTimeSlots() {
  const container = document.getElementById('timeSlots');
  if (!container) return;

  container.querySelectorAll('.time-slot').forEach(slot => {
    slot.addEventListener('click', () => {
      container.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
      slot.classList.add('selected');
      document.getElementById('bookTime').value = slot.dataset.time;
      document.getElementById('bookTimeGroup').classList.remove('error');
    });
  });
}

// ===== CONTACT FORM =====
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('contactName').value.trim();
    const email = document.getElementById('contactEmail').value.trim();
    const message = document.getElementById('contactMessage').value.trim();

    let valid = true;

    if (!name) { setError('contactNameGroup'); valid = false; } else { clearError('contactNameGroup'); }
    if (!email || !isValidEmail(email)) { setError('contactEmailGroup'); valid = false; } else { clearError('contactEmailGroup'); }
    if (!message) { setError('contactMessageGroup'); valid = false; } else { clearError('contactMessageGroup'); }

    if (!valid) return;

    const btn = document.getElementById('contactSubmitBtn');
    setLoading(btn, true);

    try {
      // Insert into Supabase
      if (window.sbClient) {
        const { error } = await window.sbClient.from('contact_submissions').insert({
          name, email, message
        });

        if (error) {
          console.error('Supabase error:', error);
          showToast('warning', 'Saved Locally', 'Message recorded. We may follow up via email.');
        } else {
          // Try to send confirmation email
          await sendContactConfirmation({ name, email, message });
          showToast('success', 'Message Sent!', 'Thank you for reaching out. We\'ll get back to you within 24 hours.');
        }
      } else {
        showToast('success', 'Message Received!', 'Thank you! We\'ll get back to you soon.');
      }

      form.reset();
    } catch (err) {
      console.error('Submit error:', err);
      showToast('error', 'Something went wrong', 'Please try again or email us directly.');
    } finally {
      setLoading(btn, false);
    }
  });
}

// ===== BOOKING FORM =====
function initBookingForm() {
  const form = document.getElementById('bookingForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('bookName').value.trim();
    const email = document.getElementById('bookEmail').value.trim();
    const phone = document.getElementById('bookPhone').value.trim();
    const service = document.getElementById('bookService').value;
    const message = document.getElementById('bookMessage').value.trim();
    const bookedDate = document.getElementById('bookDate').value;
    const bookedTime = document.getElementById('bookTime').value;

    let valid = true;

    if (!name) { setError('bookNameGroup'); valid = false; } else { clearError('bookNameGroup'); }
    if (!email || !isValidEmail(email)) { setError('bookEmailGroup'); valid = false; } else { clearError('bookEmailGroup'); }
    if (!phone || !isValidPhone(phone)) { setError('bookPhoneGroup'); valid = false; } else { clearError('bookPhoneGroup'); }
    if (!service) { setError('bookServiceGroup'); valid = false; } else { clearError('bookServiceGroup'); }
    if (!bookedDate) { setError('bookDateGroup'); valid = false; } else { clearError('bookDateGroup'); }
    if (!bookedTime) { setError('bookTimeGroup'); valid = false; } else { clearError('bookTimeGroup'); }

    // Extra validation: check date isn't Wed/Fri
    if (bookedDate) {
      const d = new Date(bookedDate);
      const day = d.getDay();
      if (day === 3 || day === 5) {
        setError('bookDateGroup');
        showToast('error', 'Invalid Date', 'Wednesdays and Fridays are not available. Please choose another day.');
        valid = false;
      }
    }

    if (!valid) {
      showToast('warning', 'Missing Information', 'Please fill in all required fields.');
      // Scroll to the first field with an error so the user can see it
      const firstError = document.querySelector('.form-group.error');
      if (firstError) {
        const navHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 72;
        const topPos = firstError.getBoundingClientRect().top + window.scrollY - navHeight - 20;
        window.scrollTo({ top: topPos, behavior: 'smooth' });
      }
      return;
    }

    const btn = document.getElementById('bookingSubmitBtn');
    setLoading(btn, true);

    const bookingData = {
      name, email, phone, service, message,
      booked_date: bookedDate,
      booked_time: bookedTime,
      status: 'pending'
    };

    try {
      if (window.sbClient) {
        const { error } = await window.sbClient.from('bookings').insert(bookingData);

        if (error) {
          console.error('Supabase error:', error);
          showToast('error', 'Database Error', `Failed to save booking: ${error.message}`);
        } else {
          // Send emails
          await sendBookingConfirmation(bookingData);
          await sendAdminBookingAlert(bookingData);

          showToast('success', 'Booking Confirmed!', `Your meeting is scheduled for ${formatDate(bookedDate)} at ${formatTime(bookedTime)}. You'll receive a confirmation email.`);
        }
      } else {
        showToast('success', 'Booking Received!', 'We\'ll confirm your meeting shortly.');
      }

      form.reset();
      selectedDate = null;
      document.getElementById('bookDate').value = '';
      document.getElementById('bookTime').value = '';
      document.querySelectorAll('.time-slot.selected').forEach(s => s.classList.remove('selected'));
      renderCalendar();
    } catch (err) {
      console.error('Booking error:', err);
      showToast('error', 'Booking Failed', 'Please try again or contact us directly.');
    } finally {
      setLoading(btn, false);
    }
  });
}

// ===== HELPERS =====

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
  // Allow various formats: +91 98765 43210, 9876543210, +1-234-567-8900
  return /^[\+]?[\d\s\-\(\)]{7,20}$/.test(phone);
}

function setError(groupId) {
  const group = document.getElementById(groupId);
  if (group) group.classList.add('error');
}

function clearError(groupId) {
  const group = document.getElementById(groupId);
  if (group) group.classList.remove('error');
}

function setLoading(btn, loading) {
  if (!btn) return;
  const text = btn.querySelector('.btn-text');
  const loader = btn.querySelector('.btn-loading');
  if (loading) {
    btn.disabled = true;
    if (text) text.style.display = 'none';
    if (loader) loader.style.display = 'inline-flex';
  } else {
    btn.disabled = false;
    if (text) text.style.display = 'inline';
    if (loader) loader.style.display = 'none';
  }
}

// Clear errors on input
document.addEventListener('input', (e) => {
  const group = e.target.closest('.form-group');
  if (group) group.classList.remove('error');
});
