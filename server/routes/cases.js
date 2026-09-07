const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Case = require('../models/Case');
const IOC = require('../models/IOC');
const Email = require('../models/Email');
const TimelineEvent = require('../models/TimelineEvent');
const GraphEdge = require('../models/GraphEdge');
const Alert = require('../models/Alert');

// GET /api/cases
router.get('/', protect, async (req, res) => {
  try {
    const { status, severity, search, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status && status !== 'all') filter.status = status;
    if (severity && severity !== 'all') filter.severity = severity;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { caseId: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { attackType: { $regex: search, $options: 'i' } }
      ];
    }
    const cases = await Case.find(filter)
      .populate('analyst', 'name email')
      .populate('campaign', 'name severity')
      .sort({ updatedAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));
    const total = await Case.countDocuments(filter);
    res.json({ success: true, data: cases, total, pages: Math.ceil(total / limit) });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// POST /api/cases
router.post('/', protect, async (req, res) => {
  try {
    const count = await Case.countDocuments();
    const year = new Date().getFullYear();
    const caseId = `CASE-${year}-${String(count + 1).padStart(3, '0')}`;
    const newCase = await Case.create({ ...req.body, caseId, analyst: req.user._id });
    res.status(201).json({ success: true, data: newCase });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/cases/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const c = await Case.findById(req.params.id)
      .populate('analyst', 'name email')
      .populate('campaign')
      .populate('relatedCases', 'caseId title severity threatScore status');
    if (!c) return res.status(404).json({ success: false, message: 'Case not found' });
    res.json({ success: true, data: c });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// PUT /api/cases/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const c = await Case.findByIdAndUpdate(
      req.params.id,
      { ...req.body, lastActivity: new Date() },
      { new: true, runValidators: true }
    );
    if (!c) return res.status(404).json({ success: false, message: 'Case not found' });
    res.json({ success: true, data: c });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// DELETE /api/cases/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    await Case.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Case deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/cases/:id/graph
router.get('/:id/graph', protect, async (req, res) => {
  try {
    const edges = await GraphEdge.find({ case: req.params.id });
    const nodeMap = {};
    edges.forEach(e => {
      nodeMap[e.sourceId] = { id: e.sourceId, label: e.sourceLabel, type: e.sourceType };
      nodeMap[e.targetId] = { id: e.targetId, label: e.targetLabel, type: e.targetType };
    });
    res.json({
      success: true,
      data: {
        nodes: Object.values(nodeMap),
        edges: edges.map(e => ({ source: e.sourceId, target: e.targetId, label: e.relationship }))
      }
    });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/cases/:id/map
router.get('/:id/map', protect, async (req, res) => {
  try {
    const iocs = await IOC.find({ case: req.params.id, type: 'ip' });
    const markers = iocs
      .filter(i => i.geo && i.geo.lat)
      .map(ioc => ({
        value: ioc.value, lat: ioc.geo.lat, lon: ioc.geo.lon,
        country: ioc.geo.country, city: ioc.geo.city, riskLevel: ioc.riskLevel
      }));
    res.json({ success: true, data: markers });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/cases/:id/timeline
router.get('/:id/timeline', protect, async (req, res) => {
  try {
    const events = await TimelineEvent.find({ case: req.params.id }).sort({ timestamp: 1 });
    res.json({ success: true, data: events });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/cases/:id/related
router.get('/:id/related', protect, async (req, res) => {
  try {
    const thisCase = await Case.findById(req.params.id);
    if (!thisCase) return res.status(404).json({ success: false, message: 'Case not found' });
    const related = await Case.find({ _id: { $in: thisCase.relatedCases } })
      .select('caseId title severity threatScore status attackType');
    res.json({ success: true, data: related });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/cases/:id/emails
router.get('/:id/emails', protect, async (req, res) => {
  try {
    const emails = await Email.find({ case: req.params.id }).populate('extractedIOCs');
    res.json({ success: true, data: emails });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/cases/:id/iocs
router.get('/:id/iocs', protect, async (req, res) => {
  try {
    const iocs = await IOC.find({ case: req.params.id }).sort({ reputationScore: -1 });
    res.json({ success: true, data: iocs });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/cases/stats/overview
router.get('/stats/overview', protect, async (req, res) => {
  try {
    const totalCases = await Case.countDocuments();
    const openCases = await Case.countDocuments({ status: 'open' });
    const criticalCases = await Case.countDocuments({ severity: 'critical' });
    const totalIOCs = await IOC.countDocuments();
    res.json({ success: true, data: { totalCases, openCases, criticalCases, totalIOCs } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
