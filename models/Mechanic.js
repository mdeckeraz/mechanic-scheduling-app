const mongoose = require('mongoose');

const MechanicSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  specialties: {
    type: [String],
    enum: ['Engine', 'Transmission', 'Brakes', 'Suspension', 'Electrical', 'Body Work', 'Interior', 'Tires', 'General'],
    default: ['General']
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 5
  },
  experience: {
    type: Number, // Years of experience
    default: 0
  }
});

module.exports = mongoose.model('Mechanic', MechanicSchema);
