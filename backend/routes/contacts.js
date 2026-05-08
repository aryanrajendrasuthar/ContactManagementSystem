const express = require('express');
const { protect } = require('../middleware/auth');
const { upload, uploadCsv } = require('../middleware/upload');
const {
  getContacts,
  getContact,
  createContact,
  updateContact,
  deleteContact,
  toggleFavorite,
  exportContacts,
  importContacts
} = require('../controllers/contactController');

const router = express.Router();

router.get('/export', protect, exportContacts);
router.post('/import', protect, uploadCsv.single('csv'), importContacts);

router.route('/')
  .get(protect, getContacts)
  .post(protect, upload.single('avatar'), createContact);

router.route('/:id')
  .get(protect, getContact)
  .put(protect, upload.single('avatar'), updateContact)
  .delete(protect, deleteContact);

router.patch('/:id/favorite', protect, toggleFavorite);

module.exports = router;
