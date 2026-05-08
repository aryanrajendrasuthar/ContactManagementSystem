const express = require('express');
const { protect } = require('../middleware/auth');
const { getGroups, createGroup, updateGroup, deleteGroup } = require('../controllers/groupController');

const router = express.Router();

router.route('/')
  .get(protect, getGroups)
  .post(protect, createGroup);

router.route('/:id')
  .put(protect, updateGroup)
  .delete(protect, deleteGroup);

module.exports = router;
