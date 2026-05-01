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
app.use('/uploads', express.static(path.join(__dirname, '../frontend/uploads')));

// ─── API Routes ───────────────────────────────────────────────
app.use('/api/auth',         require('./routes/auth'));
app.use('/api/registration', require('./routes/registration'));
app.use('/api/review',       require('./routes/review'));
app.use('/api/program',      require('./routes/program'));
app.use('/api/announcement', require('./routes/announcement'));
app.use('/api/content',      require('./routes/content'));
app.use('/api/contact',      require('./routes/contact'));
app.use('/api/gallery',      require('./routes/gallery'));
app.use('/api/upload',       require('./routes/upload'));

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
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔑 Admin panel  → http://localhost:${PORT}/admin`);
  
  // Check for email credentials
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('⚠️ WARNING: EMAIL_USER or EMAIL_PASS is not defined in environment variables!');
  } else {
    console.log('📧 Email service is configured and ready.');
  }
});
