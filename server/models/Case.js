const mongoose = require('mongoose');

const CaseSchema = new mongoose.Schema({
  caseId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: String,
  threatScore: { type: Number, default: 0, min: 0, max: 100 },
  confidence: { type: Number, default: 0, min: 0, max: 100 },
  attackType: { type: String, default: 'Unknown' },
  severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  status: { type: String, enum: ['open', 'monitoring', 'closed'], default: 'open' },
  analyst: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  campaign: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign' },
  iocCount: { type: Number, default: 0 },
  relatedCases: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Case' }],
  threatActor: String,
  tags: [String],
  notes: String,
  firstSeen: { type: Date, default: Date.now },
  lastActivity: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Case', CaseSchema);
