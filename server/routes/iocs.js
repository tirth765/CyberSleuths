const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const IOC = require('../models/IOC');

// GET /api/iocs
router.get('/', protect, async (req, res) => {
  try {
    const { type, riskLevel, search, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (type && type !== 'all') filter.type = type;
    if (riskLevel && riskLevel !== 'all') filter.riskLevel = riskLevel;
    if (search) filter.value = { $regex: search, $options: 'i' };

    const iocs = await IOC.find(filter)
      .populate('case', 'caseId title')
      .sort({ reputationScore: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await IOC.countDocuments(filter);
    const stats = {
      total: await IOC.countDocuments(),
      critical: await IOC.countDocuments({ riskLevel: 'critical' }),
      high: await IOC.countDocuments({ riskLevel: 'high' }),
      medium: await IOC.countDocuments({ riskLevel: 'medium' }),
      low: await IOC.countDocuments({ riskLevel: 'low' }),
      domains: await IOC.countDocuments({ type: 'domain' }),
      ips: await IOC.countDocuments({ type: 'ip' }),
      urls: await IOC.countDocuments({ type: 'url' }),
      hashes: await IOC.countDocuments({ type: 'hash' }),
      asns: await IOC.countDocuments({ type: 'asn' })
    };

    res.json({ success: true, data: iocs, total, stats });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/iocs/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const ioc = await IOC.findById(req.params.id)
      .populate('case', 'caseId title severity')
      .populate('relatedCases', 'caseId title severity');
    if (!ioc) return res.status(404).json({ success: false, message: 'IOC not found' });
    res.json({ success: true, data: ioc });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/iocs/:id/related
router.get('/:id/related', protect, async (req, res) => {
  try {
    const ioc = await IOC.findById(req.params.id);
    if (!ioc) return res.status(404).json({ success: false, message: 'IOC not found' });
    const related = await IOC.find({
      type: ioc.type,
      _id: { $ne: ioc._id },
      $or: [
        { 'geo.country': ioc.geo?.country },
        { riskLevel: ioc.riskLevel }
      ]
    }).limit(10).populate('case', 'caseId title');
    res.json({ success: true, data: related });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
