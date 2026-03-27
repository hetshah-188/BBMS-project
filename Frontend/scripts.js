/**
 * Life4U - BBMS Frontend ↔ Backend Integration
 * Base API URL — change this if your server runs on a different port
 */
const API_BASE = 'http://localhost:5000/api';

// ─── Token Helpers ─────────────────────────────────────────────────────────
function getToken() {
  return localStorage.getItem('bbms_token');
}

function setToken(token) {
  localStorage.setItem('bbms_token', token);
}

function setUser(user) {
  localStorage.setItem('bbms_user', JSON.stringify(user));
}

function getUser() {
  const u = localStorage.getItem('bbms_user');
  return u ? JSON.parse(u) : null;
}

function clearSession() {
  localStorage.removeItem('bbms_token');
  localStorage.removeItem('bbms_user');
}

// ─── Core API Fetch Helper ──────────────────────────────────────────────────
async function apiFetch(endpoint, method = 'GET', body = null, requireAuth = true) {
  const headers = { 'Content-Type': 'application/json' };
  if (requireAuth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, options);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Something went wrong');
    return data;
  } catch (err) {
    throw err;
  }
}

// ─── Show toast notification ────────────────────────────────────────────────
function showToast(message, type = 'success') {
  // Remove existing toast
  const existing = document.getElementById('bbms-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'bbms-toast';
  toast.textContent = message;
  Object.assign(toast.style, {
    position: 'fixed',
    bottom: '30px',
    right: '30px',
    padding: '14px 24px',
    borderRadius: '50px',
    background: type === 'success' ? 'linear-gradient(135deg,#00B894,#00CEC9)' : 'linear-gradient(135deg,#D63031,#FF7675)',
    color: 'white',
    fontWeight: '600',
    fontSize: '0.95rem',
    zIndex: '9999',
    boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
    animation: 'slideUp 0.4s ease',
    fontFamily: 'Inter, sans-serif',
  });

  // Add animation keyframe once
  if (!document.getElementById('toast-style')) {
    const style = document.createElement('style');
    style.id = 'toast-style';
    style.textContent = `@keyframes slideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }`;
    document.head.appendChild(style);
  }

  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

// ═══════════════════════════════════════════════════════════════════════════════
//  AUTH — Login Form Handler (login.html)
// ═══════════════════════════════════════════════════════════════════════════════
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;

    if (!email || !password || !role) {
      showToast('Please fill in all fields.', 'error');
      return;
    }

    const btn = loginForm.querySelector('button[type="submit"]');
    btn.textContent = 'Signing in...';
    btn.disabled = true;

    try {
      const data = await apiFetch('/auth/login', 'POST', { email, password, role }, false);
      setToken(data.token);
      setUser(data.user);

      showToast(`Welcome back, ${data.user.fullname}! 🎉`);

      setTimeout(() => {
        const redirectMap = {
          donor: 'donor-dashboard.html',
          patient: 'patient-dashboard.html',
          hospital: 'hospital-dashboard.html',
          admin: 'admin-dashboard.html',
        };
        window.location.href = redirectMap[data.user.role] || 'index.html';
      }, 800);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      btn.textContent = 'Sign In';
      btn.disabled = false;
    }
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
//  AUTH — Signup Form Handler (signup.html)
// ═══════════════════════════════════════════════════════════════════════════════
const signupForm = document.getElementById('signupForm');
if (signupForm) {
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (password !== confirmPassword) {
      showToast('Passwords do not match!', 'error');
      return;
    }

    const payload = {
      fullname: document.getElementById('fullname').value.trim(),
      email: document.getElementById('email').value.trim(),
      phone: document.getElementById('phone').value.trim(),
      dob: document.getElementById('dob').value,
      address: document.getElementById('address').value.trim(),
      bloodType: document.getElementById('bloodtype').value,
      idProof: document.getElementById('idproof').value.trim(),
      medicalDetails: document.getElementById('medical') ? document.getElementById('medical').value : '',
      password,
      role: 'donor', // default; can be extended with a dropdown
    };

    // Check if there's a role selector on the signup page
    const roleEl = document.getElementById('role');
    if (roleEl) payload.role = roleEl.value;

    const btn = signupForm.querySelector('button[type="submit"]');
    btn.textContent = 'Registering...';
    btn.disabled = true;

    try {
      const data = await apiFetch('/auth/register', 'POST', payload, false);
      setToken(data.token);
      setUser(data.user);

      showToast('Account created successfully! 🎉');

      setTimeout(() => {
        const redirectMap = {
          donor: 'donor-dashboard.html',
          patient: 'patient-dashboard.html',
        };
        window.location.href = redirectMap[data.user.role] || 'index.html';
      }, 1000);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      btn.textContent = 'Register Now';
      btn.disabled = false;
    }
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
//  DONOR DASHBOARD — Schedule Donation
// ═══════════════════════════════════════════════════════════════════════════════
const donateForm = document.getElementById('donateForm');
if (donateForm) {
  donateForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const payload = {
      bloodType: document.getElementById('donateBloodType')?.value || getUser()?.bloodType,
      units: document.getElementById('donateUnits')?.value || 1,
      donationDate: document.getElementById('donationDate')?.value || new Date().toISOString(),
      hospital: document.getElementById('donateHospital')?.value || '',
      weight: document.getElementById('donorWeight')?.value || null,
      notes: document.getElementById('donateNotes')?.value || '',
    };

    try {
      await apiFetch('/donations', 'POST', payload);
      showToast('Donation scheduled successfully! 🩸');
      donateForm.reset();
      loadMyDonations();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
//  PATIENT DASHBOARD — Submit Blood Request
// ═══════════════════════════════════════════════════════════════════════════════
const requestForm = document.getElementById('bloodRequestForm');
if (requestForm) {
  requestForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const payload = {
      bloodType: document.getElementById('reqBloodType')?.value,
      units: document.getElementById('reqUnits')?.value || 1,
      urgency: document.getElementById('reqUrgency')?.value || 'normal',
      hospital: document.getElementById('reqHospital')?.value,
      requiredByDate: document.getElementById('reqDate')?.value,
      purpose: document.getElementById('reqPurpose')?.value || '',
      doctorName: document.getElementById('reqDoctor')?.value || '',
      contactNumber: document.getElementById('reqContact')?.value || '',
    };

    try {
      const data = await apiFetch('/requests', 'POST', payload);
      showToast(`Request submitted! ID: ${data.request.requestId} 📋`);
      requestForm.reset();
      loadMyRequests();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
//  LOAD FUNCTIONS — fetch & render dynamic data into dashboard tables
// ═══════════════════════════════════════════════════════════════════════════════

// Load donor's own donations
async function loadMyDonations() {
  const tbody = document.getElementById('myDonationsBody');
  if (!tbody) return;
  try {
    const data = await apiFetch('/donations/my');
    tbody.innerHTML = data.donations.map((d) => `
      <tr>
        <td>${new Date(d.donationDate).toLocaleDateString('en-IN')}</td>
        <td>${d.bloodType}</td>
        <td>${d.units} unit(s)</td>
        <td>${d.hospital}</td>
        <td><span class="status-badge status-${d.status}">${d.status}</span></td>
        <td>${d.pointsEarned}</td>
      </tr>`).join('') || '<tr><td colspan="6">No donations yet.</td></tr>';
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" style="color:red;">${err.message}</td></tr>`;
  }
}

// Load patient's own requests
async function loadMyRequests() {
  const tbody = document.getElementById('myRequestsBody');
  if (!tbody) return;
  try {
    const data = await apiFetch('/requests/my');
    tbody.innerHTML = data.requests.map((r) => `
      <tr class="request-row">
        <td>${r.requestId}</td>
        <td>${r.bloodType}</td>
        <td>${r.units}</td>
        <td><span class="status-badge status-${r.urgency}">${r.urgency}</span></td>
        <td><span class="status-badge status-${r.status}">${r.status}</span></td>
        <td>${new Date(r.requiredByDate).toLocaleDateString('en-IN')}</td>
        <td>
          ${r.status !== 'cancelled' && r.status !== 'completed'
        ? `<button onclick="cancelRequest('${r._id}')" class="btn-secondary" style="padding:6px 14px;font-size:0.8rem;">Cancel</button>`
        : '—'}
        </td>
      </tr>`).join('') || '<tr><td colspan="7">No requests yet.</td></tr>';
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" style="color:red;">${err.message}</td></tr>`;
  }
}

// Cancel a blood request (patient)
async function cancelRequest(id) {
  if (!confirm('Are you sure you want to cancel this request?')) return;
  try {
    await apiFetch(`/requests/${id}/cancel`, 'PUT');
    showToast('Request cancelled.');
    loadMyRequests();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// Load blood inventory (public — used in index / admin pages)
async function loadInventory() {
  try {
    const data = await apiFetch('/inventory', 'GET', null, false);
    // Update stat cards if they exist
    data.inventory.forEach((item) => {
      const el = document.getElementById(`inv-${item.bloodType.replace('+', 'pos').replace('-', 'neg')}`);
      if (el) el.textContent = item.units;
    });
    return data.inventory;
  } catch (err) {
    console.error('Inventory load failed:', err.message);
  }
}

// Load admin dashboard stats
async function loadAdminStats() {
  try {
    const data = await apiFetch('/admin/stats');
    const map = {
      'stat-total-units': data.stats.totalBloodUnits,
      'stat-pending': data.stats.pendingRequests,
      'stat-donors': data.stats.totalDonors,
      'stat-hospitals': data.stats.totalHospitals,
    };
    Object.entries(map).forEach(([id, val]) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    });
  } catch (err) {
    console.error('Admin stats load failed:', err.message);
  }
}

// Load admin blood requests table
async function loadAdminRequests() {
  const tbody = document.getElementById('adminRequestsBody');
  if (!tbody) return;
  try {
    const data = await apiFetch('/requests');
    tbody.innerHTML = data.requests.map((r) => `
      <tr>
        <td>${r.requestId}</td>
        <td>${r.patientName}</td>
        <td>${r.bloodType}</td>
        <td><span class="status-badge status-${r.urgency}">${r.urgency}</span></td>
        <td>
          <select onchange="updateRequestStatus('${r._id}', this.value)" style="padding:4px 8px;border-radius:8px;border:1px solid #ddd;">
            ${['submitted', 'processing', 'approved', 'in-transit', 'completed', 'cancelled']
        .map((s) => `<option value="${s}" ${r.status === s ? 'selected' : ''}>${s}</option>`)
        .join('')}
          </select>
        </td>
        <td><button onclick="viewRequestDetails('${r._id}')" class="action-btn">View</button></td>
      </tr>`).join('') || '<tr><td colspan="6">No requests found.</td></tr>';
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" style="color:red;">${err.message}</td></tr>`;
  }
}

// Update request status (admin/hospital)
async function updateRequestStatus(id, status) {
  try {
    await apiFetch(`/requests/${id}/status`, 'PUT', { status });
    showToast(`Status updated to "${status}"`);
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// View request details modal (admin)
async function viewRequestDetails(id) {
  try {
    const data = await apiFetch(`/requests/${id}`);
    const r = data.request;
    alert(`Request: ${r.requestId}\nPatient: ${r.patientName}\nBlood: ${r.bloodType} × ${r.units}\nUrgency: ${r.urgency}\nHospital: ${r.hospital}\nStatus: ${r.status}`);
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
//  LOGOUT
// ═══════════════════════════════════════════════════════════════════════════════
function logout() {
  clearSession();
  window.location.href = 'index.html';
}

// ═══════════════════════════════════════════════════════════════════════════════
//  TOGGLE PASSWORD VISIBILITY
// ═══════════════════════════════════════════════════════════════════════════════
function togglePassword() {
  const pwInput = document.getElementById('password');
  const icon = document.querySelector('.toggle-password');
  if (!pwInput) return;
  if (pwInput.type === 'password') {
    pwInput.type = 'text';
    if (icon) icon.classList.replace('fa-eye', 'fa-eye-slash');
  } else {
    pwInput.type = 'password';
    if (icon) icon.classList.replace('fa-eye-slash', 'fa-eye');
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
//  FAQ Accordion (about.html)
// ═══════════════════════════════════════════════════════════════════════════════
document.querySelectorAll('.faq-question').forEach((question) => {
  question.addEventListener('click', () => {
    const faqItem = question.parentElement;
    faqItem.classList.toggle('active');
    document.querySelectorAll('.faq-item').forEach((item) => {
      if (item !== faqItem) item.classList.remove('active');
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  ANIMATED STATS (index.html)
// ═══════════════════════════════════════════════════════════════════════════════
function animateStats() {
  const stats = document.querySelectorAll('.stat-banner-item h3');
  stats.forEach((stat) => {
    const value = stat.textContent;
    if (value.includes('+')) {
      const num = parseInt(value.replace(/[^0-9]/g, ''));
      animateValue(stat, 0, num, 2000, 'K+');
    } else if (value.includes('min')) {
      const num = parseInt(value);
      animateValue(stat, 0, num, 2000, 'min');
    }
  });
}

function animateValue(element, start, end, duration, suffix = '') {
  const range = end - start;
  const increment = range / (duration / 16);
  let current = start;
  const timer = setInterval(() => {
    current += increment;
    if (current >= end) {
      current = end;
      clearInterval(timer);
    }
    element.textContent = Math.floor(current) + suffix;
  }, 16);
}

// ═══════════════════════════════════════════════════════════════════════════════
//  SMOOTH SCROLL FOR TIMELINE (about.html)
// ═══════════════════════════════════════════════════════════════════════════════
const timelineItems = document.querySelectorAll('.timeline-item');
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  },
  { threshold: 0.3 }
);
timelineItems.forEach((item) => {
  item.style.opacity = '0';
  item.style.transform = 'translateY(20px)';
  item.style.transition = 'all 0.5s ease';
  observer.observe(item);
});

// ═══════════════════════════════════════════════════════════════════════════════
//  HAMBURGER MENU navigation
// ═══════════════════════════════════════════════════════════════════════════════
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');
if (hamburger && navMenu) {
  hamburger.addEventListener('click', () => navMenu.classList.toggle('active'));
}

// ═══════════════════════════════════════════════════════════════════════════════
//  ADMIN TAB SWITCHER (shared across dashboards)
// ═══════════════════════════════════════════════════════════════════════════════
function switchTab(tabName) {
  document.querySelectorAll('.tab-content').forEach((t) => t.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));

  const targetTab = document.getElementById(`${tabName}Tab`);
  if (targetTab) targetTab.classList.add('active');

  document.querySelectorAll('.tab-btn').forEach((btn) => {
    if (btn.getAttribute('onclick')?.includes(tabName)) btn.classList.add('active');
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
//  PAGE INIT — auto-load data based on current page
// ═══════════════════════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  animateStats();

  const page = window.location.pathname.split('/').pop();

  // Redirect to login if not authenticated on protected pages
  const protectedPages = [
    'donor-dashboard.html',
    'patient-dashboard.html',
    'hospital-dashboard.html',
    'admin-dashboard.html',
    'request-blood.html',
  ];
  if (protectedPages.includes(page) && !getToken()) {
    showToast('Please log in first.', 'error');
    setTimeout(() => { window.location.href = 'login.html'; }, 1000);
    return;
  }

  // Auto-fill user welcome name
  const user = getUser();
  if (user) {
    document.querySelectorAll('[data-user-name]').forEach((el) => {
      el.textContent = user.fullname;
    });
    document.querySelectorAll('[data-user-blood]').forEach((el) => {
      el.textContent = user.bloodType || '—';
    });
  }

  // Page-specific data loading
  if (page === 'donor-dashboard.html') {
    loadMyDonations();
  }
  if (page === 'patient-dashboard.html' || page === 'request-blood.html') {
    loadMyRequests();
    loadInventory();
  }
  if (page === 'admin-dashboard.html') {
    loadAdminStats();
    loadAdminRequests();
    loadInventory();
  }
  if (page === 'hospital-dashboard.html') {
    loadAdminRequests();
    loadInventory();
  }
  if (page === 'index.html' || page === '') {
    loadInventory();
  }
});