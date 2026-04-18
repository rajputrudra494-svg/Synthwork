/* ============================================
   SynthWork — Shared Application Logic
   Supabase init, Navigation, Footer, Toasts
   ============================================ */

// --- Supabase Configuration ---
const SUPABASE_URL = 'https://zbjmszryzlyymcspszfy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpiam1zenJ5emx5eW1jc3BzemZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxNDI0MjUsImV4cCI6MjA5MTcxODQyNX0.SDGyjX-Axtem5gux5C3dY7SrceGWh53n7V22pHOiKsg';

// Use window.sbClient instead of clashing with the library's global `supabase` variable
function initSupabase() {
  if (window.supabase && window.supabase.createClient) {
    window.sbClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('Supabase initialized');
  } else {
    console.warn('Supabase client library not loaded');
  }
}
// --- Navigation Component ---
function initNavBehavior() {
  const nav = document.getElementById('mainNav');
  const toggle = document.getElementById('mobileMenuBtn');
  const links = document.getElementById('navLinks');

  if (!nav) return;

  // Scroll effect
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    if (scrollY > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
    lastScroll = scrollY;
  }, { passive: true });

  // Mobile toggle
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
      links.classList.toggle('open');
      document.body.style.overflow = links.classList.contains('open') ? 'hidden' : '';
    });
  }

  // Close mobile menu on link click
  if (links) {
    const navLinks = links.querySelectorAll('.nav-link, .nav-cta');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (links.classList.contains('open') && toggle) {
          toggle.classList.remove('active');
          links.classList.remove('open');
          document.body.style.overflow = '';
        }
      });
    });
  }

  // Close on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && links && links.classList.contains('open')) {
      if (toggle) toggle.classList.remove('active');
      links.classList.remove('open');
      document.body.style.overflow = '';
    }
  });
}

// --- Toast Notification System ---
function initToastContainer() {
  if (!document.querySelector('.toast-container')) {
    const container = document.createElement('div');
    container.className = 'toast-container';
    container.id = 'toastContainer';
    document.body.appendChild(container);
  }
}

function showToast(type, title, message, duration = 4000) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const icons = {
    success: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
    error: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
    warning: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    info: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>'
  };

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || icons.info}</span>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-message">${message}</div>
    </div>
    <button class="toast-close" onclick="dismissToast(this.parentElement)" aria-label="Close notification">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </button>
  `;

  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));

  const autoHide = setTimeout(() => dismissToast(toast), duration);
  toast._autoHide = autoHide;
}

function dismissToast(toast) {
  if (!toast || toast._dismissing) return;
  toast._dismissing = true;
  clearTimeout(toast._autoHide);
  toast.classList.remove('show');
  toast.classList.add('hiding');
  setTimeout(() => toast.remove(), 400);
}

// --- Scroll Animation Observer ---
function initScrollAnimations() {
  const elements = document.querySelectorAll('.animate-on-scroll, .fade-up, .fade-left, .fade-right, .fade-scale');
  
  // Before observing, add the class that hides them
  elements.forEach(el => {
    el.classList.add('has-animation');
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  elements.forEach(el => {
    observer.observe(el);
  });
}

// --- Smooth scroll for anchor links ---
function initSmoothScroll() {
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href*="#"]');
    if (!link) return;

    const href = link.getAttribute('href');
    const hashIndex = href.indexOf('#');
    const hash = href.substring(hashIndex);
    const page = href.substring(0, hashIndex);
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    // Only smooth scroll if on same page
    if (!page || page === currentPage) {
      const target = document.querySelector(hash);
      if (target) {
        e.preventDefault();
        const navHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height'));
        const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 20;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    }
  });
}

// --- Ripple effect for buttons ---
function initRippleEffect() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-primary, .btn-outline');
    if (!btn) return;

    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = e.clientX - rect.left - size / 2 + 'px';
    ripple.style.top = e.clientY - rect.top - size / 2 + 'px';
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });
}

// --- Utility: debounce ---
function debounce(fn, ms = 100) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), ms);
  };
}

// --- Utility: format date ---
function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
}

// --- Utility: format time ---
function formatTime(timeStr) {
  const [h, m] = timeStr.split(':');
  const hour = parseInt(h);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${m} ${ampm}`;
}

// --- Init Everything ---
function initApp() {
  initToastContainer();
  initScrollAnimations();
  initSmoothScroll();
  initRippleEffect();
  initSupabase();
  initNavBehavior();

  // Failsafe: if after 1.5 seconds any element is still hidden, force it to be visible.
  setTimeout(() => {
    document.querySelectorAll('.animate-on-scroll:not(.visible)').forEach(el => {
      el.classList.add('visible');
    });
  }, 1500);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
