const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  case: { type: mongoose.Schema.Types.ObjectId, ref: 'Case', required: true },
  title: String,
  type: { type: String, enum: ['executive', 'technical', 'ioc_summary', 'full'], default: 'full' },
  sections: {
    executiveSummary: String,
    technicalAnalysis: String,
    iocSummary: String,
    infrastructure: String,
    timeline: String,
    relatedCases: String,
    threatActor: String,
    riskAssessment: String,
    recommendations: String
  },
  generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['draft', 'final'], default: 'final' }
}, { timestamps: true });

module.exports = mongoose.model('Report', ReportSchema);
