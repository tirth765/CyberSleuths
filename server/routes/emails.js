const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middleware/auth');
const { parseEmail, extractIOCs, checkSuspiciousPatterns } = require('../utils/emailParser');
const { calculateThreatScore } = require('../utils/threatScore');
const { geoLookup } = require('../utils/geoIP');
const Case = require('../models/Case');
const Email = require('../models/Email');
const IOC = require('../models/IOC');
const Alert = require('../models/Alert');
const TimelineEvent = require('../models/TimelineEvent');
const GraphEdge = require('../models/GraphEdge');

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.originalname.endsWith('.eml') || file.mimetype === 'message/rfc822') cb(null, true);
    else cb(new Error('Only .eml files are allowed'));
  }
});

// POST /api/emails/upload
router.post('/upload', protect, upload.single('email'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No .eml file uploaded' });

    const parsed = await parseEmail(req.file.buffer);
    const fullText = parsed.body + ' ' + JSON.stringify(parsed.headers);
    const iocData = extractIOCs(fullText);
    const flaggedPhrases = checkSuspiciousPatterns(parsed.body);

    const authHeader = parsed.headers['authentication-results'] || '';
    const spf = authHeader.includes('spf=pass') ? 'pass' : 'fail';
    const dkim = authHeader.includes('dkim=pass') ? 'pass' : 'fail';
    const dmarc = authHeader.includes('dmarc=pass') ? 'pass' : 'fail';

    const { score, severity } = calculateThreatScore({
      spfFail: spf === 'fail',
      dkimFail: dkim === 'fail',
      dmarcFail: dmarc === 'fail',
      suspiciousURL: iocData.urls.length > 0,
      urgentLanguage: flaggedPhrases.length > 0,
      maliciousDomain: iocData.domains.length > 0,
      suspiciousSender: true
    });

    const count = await Case.countDocuments();
    const caseId = `CASE-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;

    const newCase = await Case.create({
      caseId,
      title: parsed.subject || 'Email Investigation',
      description: `Uploaded email from ${parsed.sender}`,
      threatScore: score,
      severity,
      attackType: 'Email Phishing',
      analyst: req.user._id,
      iocCount: 0,
      confidence: Math.min(score + 5, 100)
    });

    const iocDocs = [];

    for (const domain of iocData.domains.slice(0, 8)) {
      const ioc = await IOC.create({
        case: newCase._id, type: 'domain', value: domain,
        riskLevel: severity, reputationScore: score,
        firstSeen: new Date(), lastSeen: new Date()
      });
      iocDocs.push(ioc._id);
      await GraphEdge.create({ case: newCase._id, sourceType: 'email', sourceId: newCase._id.toString(), sourceLabel: parsed.subject?.slice(0, 30) || 'Email', targetType: 'domain', targetId: ioc._id.toString(), targetLabel: domain, relationship: 'contains' });
    }

    for (const ip of iocData.ips.slice(0, 5)) {
      const geo = await geoLookup(ip);
      const ioc = await IOC.create({
        case: newCase._id, type: 'ip', value: ip,
        riskLevel: severity, reputationScore: score, geo,
        firstSeen: new Date(), lastSeen: new Date()
      });
      iocDocs.push(ioc._id);
    }

    for (const url of iocData.urls.slice(0, 5)) {
      const ioc = await IOC.create({ case: newCase._id, type: 'url', value: url, riskLevel: severity, reputationScore: score });
      iocDocs.push(ioc._id);
    }

    const warnings = [
      ...(spf === 'fail' ? ['SPF authentication failed — sender domain not authorized'] : []),
      ...(dkim === 'fail' ? ['DKIM signature invalid — email may be tampered'] : []),
      ...(dmarc === 'fail' ? ['DMARC policy failed'] : []),
      ...(flaggedPhrases.length > 0 ? [`Suspicious phrases detected: ${flaggedPhrases.join(', ')}`] : []),
      ...(iocData.urls.length > 0 ? [`${iocData.urls.length} suspicious URL(s) extracted`] : [])
    ];

    const emailDoc = await Email.create({
      case: newCase._id, subject: parsed.subject, sender: parsed.sender,
      recipients: parsed.recipients, replyTo: parsed.replyTo, messageId: parsed.messageId,
      body: parsed.body, bodyHash: parsed.bodyHash, htmlBody: parsed.htmlBody,
      riskScore: score, spf, dkim, dmarc, flaggedPhrases,
      extractedIOCs: iocDocs, attachments: parsed.attachments,
      receivedAt: parsed.date, warnings
    });

    await Case.findByIdAndUpdate(newCase._id, { iocCount: iocDocs.length, lastActivity: new Date() });

    if (score >= 70) {
      const alert = await Alert.create({
        case: newCase._id,
        severity: score >= 90 ? 'critical' : 'high',
        message: `Suspicious email detected: "${parsed.subject}"`,
        threatScore: score
      });
      const io = req.app.get('live');
      if (io) io.emit('new-alert', alert);
    }

    await TimelineEvent.create({ case: newCase._id, timestamp: new Date(), event: 'Email uploaded and analyzed', type: 'email', severity, details: `Threat score: ${score}/100. ${iocDocs.length} IOCs extracted.` });

    res.status(201).json({ success: true, data: { case: newCase, email: emailDoc, iocCount: iocDocs.length } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/emails/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const email = await Email.findById(req.params.id).populate('extractedIOCs').populate('case', 'caseId title threatScore');
    if (!email) return res.status(404).json({ success: false, message: 'Email not found' });
    res.json({ success: true, data: email });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/emails
router.get('/', protect, async (req, res) => {
  try {
    const emails = await Email.find().populate('case', 'caseId title severity').sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, data: emails });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
