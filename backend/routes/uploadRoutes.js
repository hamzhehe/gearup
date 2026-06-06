const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const prefix = req.query.type === 'proof' ? 'proof-' : 'gearup-';
        cb(null, prefix + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 50000000 }, // 50MB
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|pdf|mp4|webm|gif/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only images, PDFs, and videos are allowed'));
    }
});

// @route   POST /api/upload
// @desc    Upload a single file
// @access  Private
router.post('/', protect, upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, error: 'No file uploaded' });
    }
    res.status(200).json({
        success: true,
        filePath: `/uploads/${req.file.filename}`
    });
});

module.exports = router;
