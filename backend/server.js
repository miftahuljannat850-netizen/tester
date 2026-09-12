const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Folder where uploaded files will be stored
const UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR);
}

// Allow the frontend (running on a different port/domain) to call this API
app.use(cors());
app.use(express.json());

// Serve uploaded files statically so they can be viewed/downloaded via URL
app.use('/uploads', express.static(UPLOAD_DIR));

// Configure multer storage: keep original name + timestamp to avoid collisions
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);
    cb(null, `${base}-${uniqueSuffix}${ext}`);
  }
});

// Optional: limit file size to 10MB and only allow certain types (edit as needed)
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

// Upload endpoint - field name must be "file" (matches frontend FormData key)
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  res.json({
    message: 'File uploaded successfully',
    file: {
      originalName: req.file.originalname,
      storedName: req.file.filename,
      size: req.file.size,
      url: `/uploads/${req.file.filename}`
    }
  });
});

// List all uploaded files
app.get('/api/files', (req, res) => {
  fs.readdir(UPLOAD_DIR, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Could not list files' });
    }
    const fileList = files.map((name) => ({
      name,
      url: `/uploads/${name}`
    }));
    res.json(fileList);
  });
});

// Basic error handler (e.g. file too large)
app.use((err, req, res, next) => {
  res.status(400).json({ error: err.message });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend server running on http://0.0.0.0:${PORT}`);
});
