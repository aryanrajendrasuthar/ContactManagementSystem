const express = require('express');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getContacts,
  getContact,
  createContact,
  updateContact,
  deleteContact,
  toggleFavorite,
  exportContacts
} = require('../controllers/contactController');

const router = express.Router();

router.get('/export', protect, exportContacts);
router.post('/import', protect, (req, res) => res.json({ success: true, message: 'Phase 4 will implement CSV import' }));

router.route('/')
  .get(protect, getContacts)
  .post(protect, upload.single('avatar'), createContact);

router.route('/:id')
  .get(protect, getContact)
  .put(protect, upload.single('avatar'), updateContact)
  .delete(protect, deleteContact);

router.patch('/:id/favorite', protect, toggleFavorite);

module.exports = router;
