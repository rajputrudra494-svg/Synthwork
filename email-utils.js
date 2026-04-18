/* ============================================
   SynthWork — Email Utilities
   Sends emails via Supabase RPC → Resend API
   ============================================ */

const ADMIN_EMAIL = 'synthworks1303@gmail.com';

// EmailJS Configuration
const EMAILJS_SERVICE_ID = 'service_945la3i';
const EMAILJS_TEMPLATE_ID = 'template_i2c9klx';
const EMAILJS_PUBLIC_KEY = 'wYmcI-vU3JFHFv1H5';

// Initialize EmailJS
if (typeof emailjs !== 'undefined') {
  emailjs.init(EMAILJS_PUBLIC_KEY);
}

// --- Send Booking Confirmation to Visitor ---
async function sendBookingConfirmation(bookingData) {
  try {
    if (typeof emailjs === 'undefined') return;
    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
      to_email: bookingData.email,
      subject: 'Booking Confirmed — SynthWork',
      html_body: buildBookingConfirmationHTML(bookingData)
    });
  } catch (err) {
    console.warn('Email send failed (booking confirmation):', err);
  }
}

// --- Send Admin Alert for New Booking ---
async function sendAdminBookingAlert(bookingData) {
  try {
    if (typeof emailjs === 'undefined') return;
    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
      to_email: ADMIN_EMAIL,
      subject: `New Booking: ${bookingData.name} — ${bookingData.service}`,
      html_body: buildAdminAlertHTML(bookingData)
    });
  } catch (err) {
    console.warn('Email send failed (admin alert):', err);
  }
}

// --- Send Approval Email ---
async function sendApprovalEmail(bookingData) {
  try {
    if (typeof emailjs === 'undefined') return;
    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
      to_email: bookingData.email,
      subject: 'Your Booking is Approved — SynthWork',
      html_body: buildApprovalHTML(bookingData)
    });
  } catch (err) {
    console.warn('Email send failed (approval):', err);
  }
}

// --- Send Decline Email ---
async function sendDeclineEmail(bookingData) {
  try {
    if (typeof emailjs === 'undefined') return;
    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
      to_email: bookingData.email,
      subject: 'Booking Update — SynthWork',
      html_body: buildDeclineHTML(bookingData)
    });
  } catch (err) {
    console.warn('Email send failed (decline):', err);
  }
}

// --- Send Contact Confirmation ---
async function sendContactConfirmation(contactData) {
  try {
    if (typeof emailjs === 'undefined') return;
    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
      to_email: contactData.email,
      subject: 'We Received Your Message — SynthWork',
      html_body: buildContactConfirmationHTML(contactData)
    });
  } catch (err) {
    console.warn('Email send failed (contact confirmation):', err);
  }
}

// ===== HTML Email Templates =====

function emailWrapper(content) {
  return `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 560px; margin: 0 auto; background: #0f0f1e; color: #e8e8f0; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.06);">
    <div style="padding: 24px 32px; border-bottom: 1px solid rgba(255,255,255,0.06);">
      <span style="font-family: Georgia, serif; font-size: 18px; font-weight: 700; color: #ffffff; letter-spacing: 2px;">SYNTHWORKS</span>
      <span style="font-size: 9px; letter-spacing: 3px; color: #d4a843; margin-left: 8px; text-transform: uppercase;">Digital Agency</span>
    </div>
    <div style="padding: 32px;">
      ${content}
    </div>
    <div style="padding: 20px 32px; border-top: 1px solid rgba(255,255,255,0.06); font-size: 12px; color: #6b6b80; text-align: center;">
      &copy; ${new Date().getFullYear()} SynthWork Digital Agency &middot; All rights reserved.
    </div>
  </div>`;
}

function buildBookingConfirmationHTML(data) {
  return emailWrapper(`
    <h2 style="margin: 0 0 8px; font-size: 22px; color: #ffffff;">Booking Received!</h2>
    <p style="color: #a0a0b8; margin: 0 0 24px; line-height: 1.6;">Thank you, ${data.name}. We've received your booking request. Here are the details:</p>
    <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; padding: 20px; margin-bottom: 24px;">
      <p style="margin: 0 0 12px; color: #a0a0b8;"><strong style="color: #e8e8f0;">Service:</strong> ${data.service}</p>
      <p style="margin: 0 0 12px; color: #a0a0b8;"><strong style="color: #e8e8f0;">Date:</strong> ${data.booked_date}</p>
      <p style="margin: 0 0 12px; color: #a0a0b8;"><strong style="color: #e8e8f0;">Time:</strong> ${data.booked_time}</p>
      ${data.message ? `<p style="margin: 0; color: #a0a0b8;"><strong style="color: #e8e8f0;">Notes:</strong> ${data.message}</p>` : ''}
    </div>
    <p style="color: #a0a0b8; line-height: 1.6;">Your booking is currently <span style="color: #f59e0b; font-weight: 600;">pending</span>. We'll confirm it shortly and send you an update.</p>
  `);
}

function buildAdminAlertHTML(data) {
  return emailWrapper(`
    <h2 style="margin: 0 0 8px; font-size: 22px; color: #ffffff;">New Booking Request</h2>
    <p style="color: #a0a0b8; margin: 0 0 24px;">A new meeting has been requested:</p>
    <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; padding: 20px; margin-bottom: 24px;">
      <p style="margin: 0 0 12px; color: #a0a0b8;"><strong style="color: #e8e8f0;">Name:</strong> ${data.name}</p>
      <p style="margin: 0 0 12px; color: #a0a0b8;"><strong style="color: #e8e8f0;">Email:</strong> ${data.email}</p>
      <p style="margin: 0 0 12px; color: #a0a0b8;"><strong style="color: #e8e8f0;">Phone:</strong> ${data.phone}</p>
      <p style="margin: 0 0 12px; color: #a0a0b8;"><strong style="color: #e8e8f0;">Service:</strong> ${data.service}</p>
      <p style="margin: 0 0 12px; color: #a0a0b8;"><strong style="color: #e8e8f0;">Date:</strong> ${data.booked_date}</p>
      <p style="margin: 0 0 12px; color: #a0a0b8;"><strong style="color: #e8e8f0;">Time:</strong> ${data.booked_time}</p>
      ${data.message ? `<p style="margin: 0; color: #a0a0b8;"><strong style="color: #e8e8f0;">Message:</strong> ${data.message}</p>` : ''}
    </div>
    <p style="color: #a0a0b8;">Review and respond from the <a href="#" style="color: #d4a843;">Admin Dashboard</a>.</p>
  `);
}

function buildApprovalHTML(data) {
  return emailWrapper(`
    <h2 style="margin: 0 0 8px; font-size: 22px; color: #ffffff;">Booking Approved! ✓</h2>
    <p style="color: #a0a0b8; margin: 0 0 24px; line-height: 1.6;">Great news, ${data.name}! Your meeting has been approved.</p>
    <div style="background: rgba(34,197,94,0.08); border: 1px solid rgba(34,197,94,0.2); border-radius: 8px; padding: 20px; margin-bottom: 24px;">
      <p style="margin: 0 0 12px; color: #a0a0b8;"><strong style="color: #e8e8f0;">Service:</strong> ${data.service}</p>
      <p style="margin: 0 0 12px; color: #a0a0b8;"><strong style="color: #e8e8f0;">Date:</strong> ${data.booked_date}</p>
      <p style="margin: 0; color: #a0a0b8;"><strong style="color: #e8e8f0;">Time:</strong> ${data.booked_time}</p>
    </div>
    <p style="color: #a0a0b8; line-height: 1.6;">We look forward to meeting with you. If you need to reschedule, please reach out to us at synthworks1303@gmail.com.</p>
  `);
}

function buildDeclineHTML(data) {
  return emailWrapper(`
    <h2 style="margin: 0 0 8px; font-size: 22px; color: #ffffff;">Booking Update</h2>
    <p style="color: #a0a0b8; margin: 0 0 24px; line-height: 1.6;">Hi ${data.name}, unfortunately we're unable to confirm your booking for the requested time slot.</p>
    <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; padding: 20px; margin-bottom: 24px;">
      <p style="margin: 0 0 6px; color: #e8e8f0; font-weight: 600;">Available Time Slots:</p>
      <p style="margin: 0; color: #a0a0b8; line-height: 1.7;">Monday, Tuesday, Thursday, Saturday &amp; Sunday<br>3:30 PM – 8:00 PM</p>
    </div>
    <p style="color: #a0a0b8; line-height: 1.6;">Please book another slot at your convenience, or contact us at synthworks1303@gmail.com.</p>
  `);
}

function buildContactConfirmationHTML(data) {
  return emailWrapper(`
    <h2 style="margin: 0 0 8px; font-size: 22px; color: #ffffff;">Message Received</h2>
    <p style="color: #a0a0b8; margin: 0 0 24px; line-height: 1.6;">Thank you for reaching out, ${data.name}. We've received your message and will get back to you soon.</p>
    <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; padding: 20px; margin-bottom: 24px;">
      <p style="margin: 0; color: #a0a0b8; font-style: italic; line-height: 1.6;">"${data.message}"</p>
    </div>
    <p style="color: #a0a0b8; line-height: 1.6;">We typically respond within 24 hours.</p>
  `);
}
