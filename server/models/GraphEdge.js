const mongoose = require('mongoose');

const GraphEdgeSchema = new mongoose.Schema({
  case: { type: mongoose.Schema.Types.ObjectId, ref: 'Case' },
  sourceType: String,
  sourceId: String,
  sourceLabel: String,
  targetType: String,
  targetId: String,
  targetLabel: String,
  relationship: String,
  weight: { type: Number, default: 1 }
}, { timestamps: true });

module.exports = mongoose.model('GraphEdge', GraphEdgeSchema);
