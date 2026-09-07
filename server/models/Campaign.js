const mongoose = require('mongoose');

const CampaignSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  status: { type: String, enum: ['active', 'monitoring', 'archived'], default: 'active' },
  cases: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Case' }],
  iocs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'IOC' }],
  threatActors: [String],
  countries: [String],
  domainCount: { type: Number, default: 0 },
  ipCount: { type: Number, default: 0 },
  emailCount: { type: Number, default: 0 },
  firstSeen: { type: Date, default: Date.now },
  lastSeen: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Campaign', CampaignSchema);
