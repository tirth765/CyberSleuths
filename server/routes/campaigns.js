const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Campaign = require('../models/Campaign');

// GET /api/campaigns
router.get('/', protect, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status && status !== 'all' ? { status } : {};
    const campaigns = await Campaign.find(filter)
      .populate('cases', 'caseId title severity threatScore status')
      .sort({ updatedAt: -1 });
    res.json({ success: true, data: campaigns });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// POST /api/campaigns
router.post('/', protect, async (req, res) => {
  try {
    const campaign = await Campaign.create(req.body);
    res.status(201).json({ success: true, data: campaign });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/campaigns/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id)
      .populate('cases')
      .populate('iocs');
    if (!campaign) return res.status(404).json({ success: false, message: 'Campaign not found' });
    res.json({ success: true, data: campaign });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
