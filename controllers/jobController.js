const Job = require('../models/Job');
const Mechanic = require('../models/Mechanic');

// @desc    Get all jobs
// @route   GET /api/jobs
// @access  Private
exports.getJobs = async (req, res) => {
  try {
    // Allow filtering by date range, mechanic, or status
    const { startDate, endDate, mechanicId, status } = req.query;
    
    let query = {};
    
    // Filter by date range if provided
    if (startDate && endDate) {
      query.startTime = { $gte: new Date(startDate) };
      query.endTime = { $lte: new Date(endDate) };
    }
    
    // Filter by mechanic if provided
    if (mechanicId) {
      query.mechanic = mechanicId;
    }
    
    // Filter by status if provided
    if (status) {
      query.status = status;
    }
    
    const jobs = await Job.find(query)
      .populate('mechanic')
      .populate('createdBy', 'name email')
      .sort({ startTime: 1 });
    
    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get single job
// @route   GET /api/jobs/:id
// @access  Private
exports.getJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate({
        path: 'mechanic',
        populate: {
          path: 'user',
          select: 'name email'
        }
      })
      .populate('createdBy', 'name email');
    
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    
    res.status(200).json({
      success: true,
      data: job
    });
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Create new job
// @route   POST /api/jobs
// @access  Private
exports.createJob = async (req, res) => {
  try {
    const {
      customer,
      vehicle,
      serviceType,
      description,
      startTime,
      endTime,
      mechanicId,
      notes
    } = req.body;
    
    // Check if mechanic exists
    const mechanic = await Mechanic.findById(mechanicId);
    if (!mechanic) {
      return res.status(404).json({ success: false, message: 'Mechanic not found' });
    }
    
    // Convert to Date objects
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    // Check if mechanic is available during this time slot
    const overlappingJobs = await Job.find({
      mechanic: mechanicId,
      status: { $in: ['Scheduled', 'In Progress'] },
      $or: [
        // Job starts during the requested time slot
        { startTime: { $gte: start, $lt: end } },
        // Job ends during the requested time slot
        { endTime: { $gt: start, $lte: end } },
        // Job encompasses the entire requested time slot
        { startTime: { $lte: start }, endTime: { $gte: end } }
      ]
    });
    
    if (overlappingJobs.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Mechanic is already booked during this time slot' 
      });
    }
    
    // Create job
    const job = await Job.create({
      customer,
      vehicle,
      serviceType,
      description,
      startTime: start,
      endTime: end,
      mechanic: mechanicId,
      createdBy: req.user.id,
      notes
    });
    
    res.status(201).json({
      success: true,
      data: job
    });
  } catch (error) {
    console.error('Create job error:', error);
    
    // Handle validation errors
    if (error.message.includes('Jobs can only be scheduled between 8 AM and 7 PM')) {
      return res.status(400).json({ success: false, message: error.message });
    }
    
    if (error.message.includes('End time must be after start time')) {
      return res.status(400).json({ success: false, message: error.message });
    }
    
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update job
// @route   PUT /api/jobs/:id
// @access  Private
exports.updateJob = async (req, res) => {
  try {
    const {
      customer,
      vehicle,
      serviceType,
      description,
      status,
      startTime,
      endTime,
      mechanicId,
      notes
    } = req.body;
    
    let job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    
    // If changing mechanic, check if new mechanic exists
    if (mechanicId && mechanicId !== job.mechanic.toString()) {
      const mechanic = await Mechanic.findById(mechanicId);
      if (!mechanic) {
        return res.status(404).json({ success: false, message: 'Mechanic not found' });
      }
    }
    
    // If changing time slot, check for overlapping jobs
    if ((startTime && startTime !== job.startTime.toISOString()) || 
        (endTime && endTime !== job.endTime.toISOString()) ||
        (mechanicId && mechanicId !== job.mechanic.toString())) {
      
      const start = startTime ? new Date(startTime) : job.startTime;
      const end = endTime ? new Date(endTime) : job.endTime;
      const mechId = mechanicId || job.mechanic;
      
      const overlappingJobs = await Job.find({
        _id: { $ne: req.params.id }, // Exclude current job
        mechanic: mechId,
        status: { $in: ['Scheduled', 'In Progress'] },
        $or: [
          { startTime: { $gte: start, $lt: end } },
          { endTime: { $gt: start, $lte: end } },
          { startTime: { $lte: start }, endTime: { $gte: end } }
        ]
      });
      
      if (overlappingJobs.length > 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'Mechanic is already booked during this time slot' 
        });
      }
    }
    
    // Update job
    job = await Job.findByIdAndUpdate(
      req.params.id,
      {
        customer,
        vehicle,
        serviceType,
        description,
        status,
        startTime: startTime ? new Date(startTime) : job.startTime,
        endTime: endTime ? new Date(endTime) : job.endTime,
        mechanic: mechanicId || job.mechanic,
        notes
      },
      { new: true, runValidators: true }
    )
    .populate({
      path: 'mechanic',
      populate: {
        path: 'user',
        select: 'name email'
      }
    })
    .populate('createdBy', 'name email');
    
    res.status(200).json({
      success: true,
      data: job
    });
  } catch (error) {
    console.error('Update job error:', error);
    
    // Handle validation errors
    if (error.message.includes('Jobs can only be scheduled between 8 AM and 7 PM')) {
      return res.status(400).json({ success: false, message: error.message });
    }
    
    if (error.message.includes('End time must be after start time')) {
      return res.status(400).json({ success: false, message: error.message });
    }
    
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete job
// @route   DELETE /api/jobs/:id
// @access  Private
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    
    await job.deleteOne();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get jobs by date range
// @route   GET /api/jobs/calendar
// @access  Private
exports.getJobsByDateRange = async (req, res) => {
  try {
    const { start, end } = req.query;
    
    if (!start || !end) {
      return res.status(400).json({ success: false, message: 'Please provide start and end dates' });
    }
    
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    const jobs = await Job.find({
      $or: [
        { startTime: { $gte: startDate, $lte: endDate } },
        { endTime: { $gte: startDate, $lte: endDate } },
        { startTime: { $lte: startDate }, endTime: { $gte: endDate } }
      ]
    })
    .populate({
      path: 'mechanic',
      populate: {
        path: 'user',
        select: 'name email'
      }
    })
    .sort({ startTime: 1 });
    
    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs
    });
  } catch (error) {
    console.error('Get jobs by date range error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
