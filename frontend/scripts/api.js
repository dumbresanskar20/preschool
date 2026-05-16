// ── API Base URL ──────────────────────────────────────────────
// Three environments:
// 1. Production (cPanel): frontend on cPanel → backend on Render
// 2. Local dev via backend (port 5000): relative /api works fine
// 3. Local dev via Live Server (port 5500 etc): point to localhost:5000

const RENDER_API = 'https://preschool-k8ak.onrender.com/api';

let API_BASE;
const { hostname, port } = window.location;

if (hostname === 'localhost' || hostname === '127.0.0.1') {
  // Running locally: if served by Node (port 5000) use relative path, else point to backend
  API_BASE = port === '5000' ? '/api' : 'http://localhost:5000/api';
} else {
  // Production / cPanel: always use Render backend
  API_BASE = RENDER_API;
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
  const r = await fetch(`${API_BASE}/review?t=${Date.now()}`);
  return r.json();
}
async function submitReview(data) {
  const r = await fetch(`${API_BASE}/review`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...data, isApproved: true })
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
