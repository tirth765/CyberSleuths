const mongoose = require('mongoose');

const TimelineEventSchema = new mongoose.Schema({
  case: { type: mongoose.Schema.Types.ObjectId, ref: 'Case', required: true },
  timestamp: { type: Date, default: Date.now },
  event: { type: String, required: true },
  details: String,
  actor: String,
  type: {
    type: String,
    enum: ['email', 'ioc', 'alert', 'score', 'campaign', 'analysis', 'report'],
    default: 'analysis'
  },
  severity: { type: String, enum: ['info', 'medium', 'high', 'critical'], default: 'info' }
}, { timestamps: true });

module.exports = mongoose.model('TimelineEvent', TimelineEventSchema);
