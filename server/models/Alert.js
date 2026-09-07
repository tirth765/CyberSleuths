const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
  case: { type: mongoose.Schema.Types.ObjectId, ref: 'Case' },
  severity: { type: String, enum: ['info', 'medium', 'high', 'critical'], default: 'medium' },
  type: { type: String, default: 'threat_detected' },
  message: { type: String, required: true },
  details: String,
  threatScore: Number,
  acknowledged: { type: Boolean, default: false },
  acknowledgedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  acknowledgedAt: Date
}, { timestamps: true });

module.exports = mongoose.model('Alert', AlertSchema);
