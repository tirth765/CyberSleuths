const mongoose = require('mongoose');

const IOCSchema = new mongoose.Schema({
  case: { type: mongoose.Schema.Types.ObjectId, ref: 'Case' },
  type: { type: String, enum: ['domain', 'ip', 'url', 'hash', 'asn', 'email'], required: true },
  value: { type: String, required: true },
  riskLevel: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  reputationScore: { type: Number, default: 0 },
  geo: {
    country: String,
    countryCode: String,
    city: String,
    lat: Number,
    lon: Number,
    isp: String,
    org: String
  },
  whois: {
    registrar: String,
    registeredDate: Date,
    expiryDate: Date,
    registrant: String
  },
  dns: [{ type: String, value: String }],
  relatedCases: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Case' }],
  tags: [String],
  notes: String,
  firstSeen: { type: Date, default: Date.now },
  lastSeen: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('IOC', IOCSchema);
