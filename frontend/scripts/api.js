/**
 * Rainbow Preschool – API Integration Layer
 * All backend calls go through this module.
 */

// Determine the API base URL depending on where the frontend is running
let API_BASE = '/api';

if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  // If running via Live Server (e.g., port 5500), point to local backend on port 5000
  if (window.location.port !== '5000') {
    API_BASE = 'http://localhost:5000/api';
  }
} else {
  // When deployed to production, use the remote Render API
  API_BASE = 'https://preschool-k8ak.onrender.com/api';
}

/* ── Registration ─────────────────────────────── */
async function submitRegistration(data) {
  const r = await fetch(`${API_BASE}/registration`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return r.json();
}

/* ── Contact ──────────────────────────────────── */
async function submitContact(data) {
  const r = await fetch(`${API_BASE}/contact`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return r.json();
}

/* ── Reviews (public) ────────────────────────── */
async function fetchApprovedReviews() {
  const r = await fetch(`${API_BASE}/review`);
  return r.json();
}
async function submitReview(data) {
  const r = await fetch(`${API_BASE}/review`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return r.json();
}

/* ── Programs (public) ───────────────────────── */
async function fetchPrograms() {
  const r = await fetch(`${API_BASE}/program`);
  return r.json();
}

/* ── Announcements (public) ──────────────────── */
async function fetchAnnouncements() {
  const r = await fetch(`${API_BASE}/announcement`);
  return r.json();
}

/* ── Website Content (public) ────────────────── */
async function fetchContent() {
  const r = await fetch(`${API_BASE}/content`);
  return r.json();
}

/* ── Gallery ─────────────────────────────────── */
async function fetchGallery() {
  const r = await fetch(`${API_BASE}/gallery`);
  return r.json();
}

/* ── Admin helpers ───────────────────────────── */
function getAdminToken() { return localStorage.getItem('adminToken') || ''; }

async function adminLogin(username, password) {
  const r = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  return r.json();
}

async function adminFetch(endpoint, options = {}) {
  const token = getAdminToken();
  options.headers = Object.assign({ 'Content-Type': 'application/json', 'x-admin-token': token }, options.headers || {});
  const r = await fetch(`${API_BASE}${endpoint}`, options);
  return r.json();
}
