const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  status: { type: String, enum: ['scheduled', 'active', 'completed'], default: 'scheduled' },
  startTime: { type: Date },
  endTime: { type: Date },
  assignedCameras: [{ type: String }], // Array of camera IDs
  invigilatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Session', sessionSchema);
