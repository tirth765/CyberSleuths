const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getDemoResponse } = require('../utils/demoAI');
const AIConversation = require('../models/AIConversation');
const Case = require('../models/Case');

// POST /api/ai-assistant/query
router.post('/query', protect, async (req, res) => {
  try {
    const { message, caseId } = req.body;
    if (!message) return res.status(400).json({ success: false, message: 'Message is required' });

    let context = {};
    if (caseId) {
      const c = await Case.findById(caseId);
      if (c) context = {
        caseId: c.caseId, title: c.title, threatScore: c.threatScore,
        severity: c.severity, attackType: c.attackType, iocCount: c.iocCount,
        confidence: c.confidence
      };
    }

    // Use OpenAI if available, else demo mode
    let aiResponse;
    if (process.env.OPENAI_API_KEY) {
      // Real OpenAI integration would go here
      aiResponse = getDemoResponse(message, context);
    } else {
      aiResponse = getDemoResponse(message, context);
    }

    // Save conversation
    let conv = await AIConversation.findOne({ user: req.user._id, ...(caseId ? { case: caseId } : { case: null }) });
    if (!conv) {
      conv = await AIConversation.create({ user: req.user._id, case: caseId || null, messages: [] });
    }
    conv.messages.push({ role: 'user', content: message, timestamp: new Date() });
    conv.messages.push({ role: 'assistant', content: aiResponse, timestamp: new Date() });
    await conv.save();

    res.json({ success: true, data: { response: aiResponse, conversationId: conv._id } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/ai-assistant/history
router.get('/history', protect, async (req, res) => {
  try {
    const { caseId } = req.query;
    const conv = await AIConversation.findOne({
      user: req.user._id,
      ...(caseId ? { case: caseId } : { case: null })
    });
    res.json({ success: true, data: conv ? conv.messages : [] });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
