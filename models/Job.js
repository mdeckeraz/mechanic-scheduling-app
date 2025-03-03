const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  customer: {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    }
  },
  vehicle: {
    make: {
      type: String,
      required: true
    },
    model: {
      type: String,
      required: true
    },
    year: {
      type: Number,
      required: true
    },
    vin: {
      type: String
    }
  },
  serviceType: {
    type: String,
    enum: ['Engine Upgrade', 'Transmission Upgrade', 'Suspension Upgrade', 'Brake Upgrade', 
           'Exhaust Upgrade', 'Interior Upgrade', 'Exterior Upgrade', 'Performance Tuning', 
           'Tire Upgrade', 'Other'],
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Scheduled', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Scheduled'
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  mechanic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mechanic',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String
  }
});

// Validation to ensure jobs are only scheduled between 8 AM and 7 PM
JobSchema.pre('save', function(next) {
  const startHour = new Date(this.startTime).getHours();
  const endHour = new Date(this.endTime).getHours();
  const endMinutes = new Date(this.endTime).getMinutes();
  
  if (startHour < 8 || (endHour > 19 || (endHour === 19 && endMinutes > 0))) {
    return next(new Error('Jobs can only be scheduled between 8 AM and 7 PM'));
  }
  
  if (this.startTime >= this.endTime) {
    return next(new Error('End time must be after start time'));
  }
  
  next();
});

module.exports = mongoose.model('Job', JobSchema);
