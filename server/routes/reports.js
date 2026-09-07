const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Report = require('../models/Report');
const Case = require('../models/Case');
const IOC = require('../models/IOC');

// GET /api/reports
router.get('/', protect, async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('case', 'caseId title severity threatScore attackType')
      .populate('generatedBy', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: reports });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// POST /api/reports
router.post('/', protect, async (req, res) => {
  try {
    const { caseId, type = 'full' } = req.body;
    const c = await Case.findById(caseId).populate('campaign').populate('analyst', 'name');
    if (!c) return res.status(404).json({ success: false, message: 'Case not found' });

    const iocs = await IOC.find({ case: caseId }).limit(30);
    const domains = iocs.filter(i => i.type === 'domain');
    const ips = iocs.filter(i => i.type === 'ip');
    const urls = iocs.filter(i => i.type === 'url');
    const hashes = iocs.filter(i => i.type === 'hash');

    const report = await Report.create({
      case: caseId,
      type,
      generatedBy: req.user._id,
      title: `Threat Intelligence Report — ${c.caseId}`,
      status: 'final',
      sections: {
        executiveSummary: `This report documents a **${c.severity?.toUpperCase()}** severity cyber threat investigation designated ${c.caseId}. The incident involves a sophisticated ${c.attackType} operation with a threat score of ${c.threatScore}/100 and ${c.confidence}% analyst confidence. Immediate containment and remediation actions are strongly recommended.`,

        technicalAnalysis: `Technical analysis identified ${iocs.length} indicators of compromise spanning ${domains.length} malicious domains, ${ips.length} threat actor IP addresses, ${urls.length} phishing URLs, and ${hashes.length} malicious file hashes.\n\nThe attack infrastructure demonstrates characteristics consistent with a organized threat actor group using bulletproof hosting, fast-flux DNS, and social engineering techniques to evade detection.\n\nAuthentication failures (SPF/DKIM/DMARC) indicate the sending domain was spoofed. The originating IP infrastructure is hosted in jurisdictions with limited cooperation for law enforcement takedown requests.`,

        iocSummary: `**Domains (${domains.length}):**\n${domains.map(i => `- \`${i.value}\` [${i.riskLevel?.toUpperCase()}]`).join('\n')}\n\n**IP Addresses (${ips.length}):**\n${ips.map(i => `- \`${i.value}\` — ${i.geo?.country || 'Unknown'} [${i.riskLevel?.toUpperCase()}]`).join('\n')}\n\n**URLs (${urls.length}):**\n${urls.map(i => `- \`${i.value?.slice(0, 80)}\` [${i.riskLevel?.toUpperCase()}]`).join('\n')}\n\n**File Hashes (${hashes.length}):**\n${hashes.map(i => `- \`${i.value}\` [${i.riskLevel?.toUpperCase()}]`).join('\n')}`,

        riskAssessment: `**Overall Risk Level: ${c.severity?.toUpperCase()}**\n\nThreat Score: ${c.threatScore}/100\nAnalyst Confidence: ${c.confidence}%\nAttack Type: ${c.attackType}\nFirst Seen: ${new Date(c.firstSeen).toLocaleDateString()}\n\nThis threat poses a significant risk to organizational security. The attack infrastructure is actively being used across multiple campaigns and requires immediate blocking at all security controls.`,

        recommendations: `1. **Immediate Containment:** Block all identified domains and IP addresses at DNS resolvers, web proxies, and perimeter firewalls.\n\n2. **Account Security:** Reset passwords for any accounts that may have received this phishing email. Enable MFA for all privileged accounts.\n\n3. **Email Filtering:** Add sender domains and IPs to email security blocklists. Quarantine similar emails currently in user inboxes.\n\n4. **Endpoint Scanning:** Scan all endpoints for the identified file hashes using EDR tools.\n\n5. **User Notification:** Issue a security awareness notification to all users about this phishing campaign.\n\n6. **Threat Intelligence Sharing:** Submit all IOCs to threat intelligence sharing platforms (ISACs, MISP) to protect the broader community.\n\n7. **Forensic Review:** Conduct forensic review of any endpoints that may have accessed the phishing URLs.\n\n8. **Monitoring:** Increase monitoring for authentication anomalies over the next 30 days.`
      }
    });

    const populated = await Report.findById(report._id)
      .populate('case', 'caseId title severity threatScore')
      .populate('generatedBy', 'name');

    res.status(201).json({ success: true, data: populated });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/reports/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('case')
      .populate('generatedBy', 'name');
    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });
    res.json({ success: true, data: report });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
