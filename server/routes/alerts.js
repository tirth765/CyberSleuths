const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Alert = require('../models/Alert');

// GET /api/alerts
router.get('/', protect, async (req, res) => {
  try {
    const { acknowledged } = req.query;
    const filter = {};
    if (acknowledged === 'false') filter.acknowledged = false;
    if (acknowledged === 'true') filter.acknowledged = true;

    const alerts = await Alert.find(filter)
      .populate('case', 'caseId title')
      .sort({ createdAt: -1 })
      .limit(100);
    const unacknowledged = await Alert.countDocuments({ acknowledged: false });

    res.json({ success: true, data: alerts, unacknowledged });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// PUT /api/alerts/:id/acknowledge
router.put('/:id/acknowledge', protect, async (req, res) => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      { acknowledged: true, acknowledgedBy: req.user._id, acknowledgedAt: new Date() },
      { new: true }
    );
    if (!alert) return res.status(404).json({ success: false, message: 'Alert not found' });
    res.json({ success: true, data: alert });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// PUT /api/alerts/acknowledge-all
router.put('/acknowledge-all', protect, async (req, res) => {
  try {
    await Alert.updateMany(
      { acknowledged: false },
      { acknowledged: true, acknowledgedBy: req.user._id, acknowledgedAt: new Date() }
    );
    res.json({ success: true, message: 'All alerts acknowledged' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
