const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ── Ensure both upload directories exist ──────────────────────
const uploadDir      = path.join(__dirname, '../../frontend/uploads');
const assetsUploadDir = path.join(__dirname, '../../frontend/assets/uploads');

[uploadDir, assetsUploadDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

// ── Storage configuration ─────────────────────────────────────
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Primary save location: frontend/uploads/
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) return cb(null, true);
    cb(new Error('Only images are allowed (jpeg, jpg, png, gif, webp)'));
  }
});

// POST /api/upload
router.post('/', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded.' });
  }

  const filename = req.file.filename;

  // ── Also copy file to assets/uploads/ for the assets folder structure ──
  try {
    const srcPath  = path.join(uploadDir, filename);
    const destPath = path.join(assetsUploadDir, filename);
    fs.copyFileSync(srcPath, destPath);
    console.log(`Image also copied to assets/uploads/${filename}`);
  } catch (copyErr) {
    // Non-fatal: log warning but still return success
    console.warn(`Warning: Could not copy to assets/uploads: ${copyErr.message}`);
  }

  // Return the relative path for the frontend (served via /uploads/ static route)
  const filePath = `/uploads/${filename}`;
  res.json({
    success: true,
    url: filePath,
    assetsUrl: `/assets/uploads/${filename}`,
    filename: filename
  });
});

module.exports = router;
