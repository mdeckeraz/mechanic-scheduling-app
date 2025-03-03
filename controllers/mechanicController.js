const Mechanic = require('../models/Mechanic');
const User = require('../models/User');

// @desc    Get all mechanics
// @route   GET /api/mechanics
// @access  Private
exports.getMechanics = async (req, res) => {
  try {
    const mechanics = await Mechanic.find().populate('user', 'name email');
    
    res.status(200).json({
      success: true,
      count: mechanics.length,
      data: mechanics
    });
  } catch (error) {
    console.error('Get mechanics error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get single mechanic
// @route   GET /api/mechanics/:id
// @access  Private
exports.getMechanic = async (req, res) => {
  try {
    const mechanic = await Mechanic.findById(req.params.id).populate('user', 'name email');
    
    if (!mechanic) {
      return res.status(404).json({ success: false, message: 'Mechanic not found' });
    }
    
    res.status(200).json({
      success: true,
      data: mechanic
    });
  } catch (error) {
    console.error('Get mechanic error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Create new mechanic
// @route   POST /api/mechanics
// @access  Private/Admin
exports.createMechanic = async (req, res) => {
  try {
    const { userId, specialties, experience } = req.body;
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Check if mechanic already exists for this user
    const existingMechanic = await Mechanic.findOne({ user: userId });
    if (existingMechanic) {
      return res.status(400).json({ success: false, message: 'Mechanic profile already exists for this user' });
    }
    
    // Create mechanic
    const mechanic = await Mechanic.create({
      user: userId,
      specialties: specialties || ['General'],
      experience: experience || 0
    });
    
    res.status(201).json({
      success: true,
      data: mechanic
    });
  } catch (error) {
    console.error('Create mechanic error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update mechanic
// @route   PUT /api/mechanics/:id
// @access  Private/Admin
exports.updateMechanic = async (req, res) => {
  try {
    const { specialties, isAvailable, rating, experience } = req.body;
    
    let mechanic = await Mechanic.findById(req.params.id);
    
    if (!mechanic) {
      return res.status(404).json({ success: false, message: 'Mechanic not found' });
    }
    
    mechanic = await Mechanic.findByIdAndUpdate(
      req.params.id,
      { specialties, isAvailable, rating, experience },
      { new: true, runValidators: true }
    ).populate('user', 'name email');
    
    res.status(200).json({
      success: true,
      data: mechanic
    });
  } catch (error) {
    console.error('Update mechanic error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete mechanic
// @route   DELETE /api/mechanics/:id
// @access  Private/Admin
exports.deleteMechanic = async (req, res) => {
  try {
    const mechanic = await Mechanic.findById(req.params.id);
    
    if (!mechanic) {
      return res.status(404).json({ success: false, message: 'Mechanic not found' });
    }
    
    await mechanic.deleteOne();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Delete mechanic error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get available mechanics by time slot
// @route   GET /api/mechanics/available
// @access  Private
exports.getAvailableMechanics = async (req, res) => {
  try {
    const { startTime, endTime, specialty } = req.query;
    
    if (!startTime || !endTime) {
      return res.status(400).json({ success: false, message: 'Please provide start and end times' });
    }
    
    // Convert to Date objects
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    // Validate time range (8 AM to 7 PM)
    const startHour = start.getHours();
    const endHour = end.getHours();
    const endMinutes = end.getMinutes();
    
    if (startHour < 8 || (endHour > 19 || (endHour === 19 && endMinutes > 0))) {
      return res.status(400).json({ success: false, message: 'Jobs can only be scheduled between 8 AM and 7 PM' });
    }
    
    // Find mechanics with the given specialty if provided
    let mechanicsQuery = { isAvailable: true };
    if (specialty) {
      mechanicsQuery.specialties = specialty;
    }
    
    const mechanics = await Mechanic.find(mechanicsQuery).populate('user', 'name email');
    
    // Get all jobs that overlap with the requested time slot
    const Job = require('../models/Job');
    const overlappingJobs = await Job.find({
      status: { $in: ['Scheduled', 'In Progress'] },
      $or: [
        // Job starts during the requested time slot
        { startTime: { $gte: start, $lt: end } },
        // Job ends during the requested time slot
        { endTime: { $gt: start, $lte: end } },
        // Job encompasses the entire requested time slot
        { startTime: { $lte: start }, endTime: { $gte: end } }
      ]
    }).select('mechanic');
    
    // Get IDs of mechanics who are already booked
    const bookedMechanicIds = overlappingJobs.map(job => job.mechanic.toString());
    
    // Filter out mechanics who are already booked
    const availableMechanics = mechanics.filter(mechanic => 
      !bookedMechanicIds.includes(mechanic._id.toString())
    );
    
    res.status(200).json({
      success: true,
      count: availableMechanics.length,
      data: availableMechanics
    });
  } catch (error) {
    console.error('Get available mechanics error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
