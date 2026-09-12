require('dotenv').config();

const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const mysql = require('mysql2/promise');

const app = express();

const PORT = process.env.PORT || 5000;

const uploadDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(uploadDir));

const storage = multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage });

const db = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

app.get('/api/health', async (req, res) => {
    let database = 'down';

    try {
        await db.query('SELECT 1');
        database = 'up';
    } catch (error) {
        console.log('Database check failed:', error.message);
    }

    res.json({
        status: 'ok',
        message: 'Backend is running',
        database: database
    });
});

app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            error: 'No file uploaded'
        });
    }

    res.json({
        message: 'File uploaded successfully',
        file: req.file.filename
    });
});

app.get('/api/files', (req, res) => {
    fs.readdir(uploadDir, (err, files) => {
        if (err) {
            return res.status(500).json({
                error: 'Unable to read files'
            });
        }

        res.json(files);
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Backend running on port ${PORT}`);
});