const express = require('express');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Placeholder routes — full implementation in Phase 2
router.get('/', protect, (req, res) => res.json({ success: true, contacts: [], total: 0 }));
router.post('/', protect, upload.single('avatar'), (req, res) => res.status(201).json({ success: true, message: 'Phase 2 will implement this' }));
router.get('/export', protect, (req, res) => res.json({ success: true, message: 'Phase 2 will implement CSV export' }));
router.post('/import', protect, (req, res) => res.json({ success: true, message: 'Phase 4 will implement CSV import' }));
router.get('/:id', protect, (req, res) => res.json({ success: true, message: 'Phase 2 will implement this' }));
router.put('/:id', protect, upload.single('avatar'), (req, res) => res.json({ success: true, message: 'Phase 2 will implement this' }));
router.delete('/:id', protect, (req, res) => res.json({ success: true, message: 'Phase 2 will implement this' }));

module.exports = router;
