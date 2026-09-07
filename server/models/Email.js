const mongoose = require('mongoose');

const EmailSchema = new mongoose.Schema({
  case: { type: mongoose.Schema.Types.ObjectId, ref: 'Case' },
  subject: String,
  sender: String,
  recipients: [String],
  replyTo: String,
  returnPath: String,
  messageId: String,
  headers: { type: Map, of: String },
  body: String,
  bodyHash: String,
  htmlBody: String,
  riskScore: { type: Number, default: 0 },
  spf: { type: String, enum: ['pass', 'fail', 'neutral', 'none'], default: 'none' },
  dkim: { type: String, enum: ['pass', 'fail', 'none'], default: 'none' },
  dmarc: { type: String, enum: ['pass', 'fail', 'none'], default: 'none' },
  originatingIP: String,
  flaggedPhrases: [String],
  extractedIOCs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'IOC' }],
  attachments: [{ filename: String, size: Number, mimeType: String, hash: String }],
  receivedAt: { type: Date, default: Date.now },
  warnings: [String]
}, { timestamps: true });

module.exports = mongoose.model('Email', EmailSchema);
