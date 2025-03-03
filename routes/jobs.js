const express = require('express');
const router = express.Router();
const {
  getJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  getJobsByDateRange
} = require('../controllers/jobController');
const { protect } = require('../middleware/auth');

// Get jobs by date range for calendar
router.get('/calendar', protect, getJobsByDateRange);

// Main routes
router.route('/')
  .get(protect, getJobs)
  .post(protect, createJob);

router.route('/:id')
  .get(protect, getJob)
  .put(protect, updateJob)
  .delete(protect, deleteJob);

module.exports = router;
