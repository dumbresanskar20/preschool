require('dotenv').config();
const express  = require('express');
const cors     = require('cors');
const path     = require('path');
const connectDB = require('./config/db');

// Connect to MongoDB
connectDB();

const app = express();

// ─── Middleware ───────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ─── Serve Frontend Static Files ─────────────────────────────
app.use(express.static(path.join(__dirname, '../frontend')));

// ─── API Routes ───────────────────────────────────────────────
app.use('/api/auth',         require('./routes/auth'));
app.use('/api/registration', require('./routes/registration'));
app.use('/api/review',       require('./routes/review'));
app.use('/api/program',      require('./routes/program'));
app.use('/api/announcement', require('./routes/announcement'));
app.use('/api/content',      require('./routes/content'));

// ─── Admin Panel Route ────────────────────────────────────────
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/admin.html'));
});

// ─── Catch-all: serve frontend index ─────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// ─── Error Handler ────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal Server Error.' });
});

// ─── Start Server ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔑 Admin panel  → http://localhost:${PORT}/admin`);
});
