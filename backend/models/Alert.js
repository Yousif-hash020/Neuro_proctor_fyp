const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  type:      { type: String, required: true },
  severity:  { type: String, enum: ['Red', 'Orange', 'Yellow'], default: 'Orange' },
  cameraId:  { type: String, required: true },
  cameraName:{ type: String, default: '' },
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', default: null },
  status:    { type: String, enum: ['active', 'acknowledged', 'resolved'], default: 'active' },
  acknowledgedAt: { type: Date, default: null },
  acknowledgedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  resolvedAt:{ type: Date, default: null },
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  resolutionNote: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Alert', alertSchema);
