const express = require('express');
const router = express.Router();
const {
  getMechanics,
  getMechanic,
  createMechanic,
  updateMechanic,
  deleteMechanic,
  getAvailableMechanics
} = require('../controllers/mechanicController');
const { protect } = require('../middleware/auth');

// Get available mechanics by time slot
router.get('/available', protect, getAvailableMechanics);

// Main routes
router.route('/')
  .get(protect, getMechanics)
  .post(protect, createMechanic);

router.route('/:id')
  .get(protect, getMechanic)
  .put(protect, updateMechanic)
  .delete(protect, deleteMechanic);

module.exports = router;
