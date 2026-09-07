require('dotenv').config();
const mongoose = require('mongoose');

const User = require('../models/User');
const Campaign = require('../models/Campaign');
const Case = require('../models/Case');
const Email = require('../models/Email');
const IOC = require('../models/IOC');
const Alert = require('../models/Alert');
const Report = require('../models/Report');
const TimelineEvent = require('../models/TimelineEvent');
const GraphEdge = require('../models/GraphEdge');
const AIConversation = require('../models/AIConversation');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/cybersleuthes';

const geoData = {
  '185.10.20.4':    { country: 'Russia',        countryCode: 'RU', city: 'Moscow',        lat: 55.7558,  lon: 37.6173 },
  '45.142.212.100': { country: 'Netherlands',   countryCode: 'NL', city: 'Amsterdam',     lat: 52.3702,  lon: 4.8952 },
  '91.108.4.1':     { country: 'Netherlands',   countryCode: 'NL', city: 'Amsterdam',     lat: 52.3676,  lon: 4.9041 },
  '194.165.16.78':  { country: 'Iran',          countryCode: 'IR', city: 'Tehran',        lat: 35.6892,  lon: 51.3890 },
  '104.21.44.102':  { country: 'United States', countryCode: 'US', city: 'San Francisco', lat: 37.7749,  lon: -122.4194 },
  '172.67.68.21':   { country: 'United States', countryCode: 'US', city: 'Los Angeles',   lat: 34.0522,  lon: -118.2437 },
  '5.188.206.14':   { country: 'Russia',        countryCode: 'RU', city: 'St. Petersburg',lat: 59.9311,  lon: 30.3609 },
  '213.109.202.26': { country: 'Ukraine',       countryCode: 'UA', city: 'Kyiv',          lat: 50.4501,  lon: 30.5234 },
  '193.106.191.25': { country: 'China',         countryCode: 'CN', city: 'Beijing',       lat: 39.9042,  lon: 116.4074 },
  '46.17.43.10':    { country: 'Germany',       countryCode: 'DE', city: 'Frankfurt',     lat: 50.1109,  lon: 8.6821 },
};

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ MongoDB connected');

  // Clear all collections
  await Promise.all([
    User.deleteMany({}), Campaign.deleteMany({}), Case.deleteMany({}),
    Email.deleteMany({}), IOC.deleteMany({}), Alert.deleteMany({}),
    Report.deleteMany({}), TimelineEvent.deleteMany({}),
    GraphEdge.deleteMany({}), AIConversation.deleteMany({})
  ]);
  console.log('🗑️  Cleared all collections');

  // --- USERS ---
  // NOTE: pass the plain password — the User model's pre('save') hook hashes it.
  // Pre-hashing here would double-hash and break login (401 Invalid credentials).
  const adminUser = await User.create({ name: 'Alex Mercer', email: 'admin@cybersleuthes.com', password: 'Demo@2026', role: 'admin' });
  const analystUser = await User.create({ name: 'Sarah Chen', email: 'analyst@cybersleuthes.com', password: 'Demo@2026', role: 'analyst' });
  console.log('👤 Created 2 users');

  // --- CAMPAIGNS ---
  const [camp1, camp2, camp3, camp4, camp5] = await Campaign.insertMany([
    {
      name: 'NIGHTFALL',
      description: 'Coordinated credential harvesting campaign targeting Fortune 500 companies. Uses fast-flux DNS and bulletproof hosting.',
      severity: 'critical', status: 'active',
      threatActors: ['TA2847', 'UNC3890'],
      countries: ['Russia', 'Netherlands', 'Ukraine'],
      domainCount: 18, ipCount: 12, emailCount: 340,
      firstSeen: new Date('2026-07-15'), lastSeen: new Date()
    },
    {
      name: 'SHADOWNET',
      description: 'Business email compromise network targeting CFOs and finance teams. Sophisticated impersonation of executives.',
      severity: 'critical', status: 'active',
      threatActors: ['TA0423'],
      countries: ['China', 'Iran'],
      domainCount: 9, ipCount: 6, emailCount: 89,
      firstSeen: new Date('2026-08-01'), lastSeen: new Date()
    },
    {
      name: 'GHOSTPHISH',
      description: 'Large-scale phishing operation using DocuSign and Microsoft 365 lures to steal credentials.',
      severity: 'high', status: 'monitoring',
      threatActors: ['TA1156'],
      countries: ['Germany', 'Netherlands'],
      domainCount: 24, ipCount: 8, emailCount: 1200,
      firstSeen: new Date('2026-06-20'), lastSeen: new Date()
    },
    {
      name: 'IRONVEIL',
      description: 'Multi-stage malware distribution leveraging compromised legitimate sites as C2 infrastructure.',
      severity: 'critical', status: 'active',
      threatActors: ['APT41-Subgroup'],
      countries: ['China', 'United States'],
      domainCount: 5, ipCount: 15, emailCount: 45,
      firstSeen: new Date('2026-08-10'), lastSeen: new Date()
    },
    {
      name: 'REDSTORM',
      description: 'VPN credential phishing targeting remote workers. Spoofs popular VPN providers.',
      severity: 'high', status: 'monitoring',
      threatActors: ['TA0928'],
      countries: ['Russia', 'Germany'],
      domainCount: 11, ipCount: 7, emailCount: 220,
      firstSeen: new Date('2026-08-20'), lastSeen: new Date()
    }
  ]);
  console.log('📋 Created 5 campaigns');

  // --- CASES ---
  const caseData = [
    { caseId: 'CASE-2026-001', title: 'Credential Harvesting Campaign',    severity: 'critical', threatScore: 96, confidence: 97, attackType: 'Credential Harvesting',  campaign: camp1._id, analyst: adminUser._id,   status: 'open',       threatActor: 'TA2847',        tags: ['phishing','credential-theft','urgent'] },
    { caseId: 'CASE-2026-002', title: 'Business Email Compromise',          severity: 'critical', threatScore: 92, confidence: 94, attackType: 'BEC',                    campaign: camp2._id, analyst: analystUser._id, status: 'open',       threatActor: 'TA0423',        tags: ['bec','executive-fraud'] },
    { caseId: 'CASE-2026-003', title: 'Malicious OAuth Phishing',           severity: 'high',     threatScore: 84, confidence: 88, attackType: 'OAuth Phishing',         campaign: camp1._id, analyst: adminUser._id,   status: 'monitoring', threatActor: 'TA2847',        tags: ['oauth','phishing'] },
    { caseId: 'CASE-2026-004', title: 'Ransomware Infrastructure',          severity: 'critical', threatScore: 98, confidence: 99, attackType: 'Ransomware',             campaign: camp4._id, analyst: analystUser._id, status: 'open',       threatActor: 'APT41-Subgroup',tags: ['ransomware','malware','critical'] },
    { caseId: 'CASE-2026-005', title: 'Fake Microsoft Login Campaign',      severity: 'high',     threatScore: 78, confidence: 83, attackType: 'Brand Impersonation',    campaign: camp3._id, analyst: adminUser._id,   status: 'monitoring', threatActor: 'TA1156',        tags: ['microsoft','phishing','brand-abuse'] },
    { caseId: 'CASE-2026-006', title: 'CEO Fraud Attempt',                  severity: 'high',     threatScore: 81, confidence: 85, attackType: 'CEO Fraud',              campaign: camp2._id, analyst: analystUser._id, status: 'open',       threatActor: 'TA0423',        tags: ['ceo-fraud','bec','social-engineering'] },
    { caseId: 'CASE-2026-007', title: 'Supply Chain Email Attack',          severity: 'medium',   threatScore: 68, confidence: 72, attackType: 'Supply Chain',           campaign: camp3._id, analyst: adminUser._id,   status: 'monitoring', threatActor: 'TA1156',        tags: ['supply-chain','third-party'] },
    { caseId: 'CASE-2026-008', title: 'DocuSign Impersonation Campaign',    severity: 'high',     threatScore: 75, confidence: 79, attackType: 'Brand Impersonation',    campaign: camp3._id, analyst: analystUser._id, status: 'open',       threatActor: 'TA1156',        tags: ['docusign','phishing','brand-abuse'] },
    { caseId: 'CASE-2026-009', title: 'Multi-stage Malware Dropper',        severity: 'critical', threatScore: 95, confidence: 96, attackType: 'Malware Distribution',   campaign: camp4._id, analyst: adminUser._id,   status: 'open',       threatActor: 'APT41-Subgroup',tags: ['malware','dropper','apt'] },
    { caseId: 'CASE-2026-010', title: 'VPN Credential Phishing',            severity: 'medium',   threatScore: 62, confidence: 68, attackType: 'Credential Harvesting',  campaign: camp5._id, analyst: analystUser._id, status: 'monitoring', threatActor: 'TA0928',        tags: ['vpn','phishing','remote-access'] },
  ];

  const cases = await Case.insertMany(caseData.map(c => ({
    ...c,
    description: `Investigation into ${c.attackType} targeting corporate accounts. High confidence indicators detected.`,
    iocCount: Math.floor(Math.random() * 20) + 5,
    firstSeen: new Date(Date.now() - Math.random() * 14 * 86400000),
    lastActivity: new Date()
  })));

  // Set related cases
  await Case.findByIdAndUpdate(cases[0]._id, { relatedCases: [cases[1]._id, cases[2]._id, cases[5]._id] });
  await Case.findByIdAndUpdate(cases[1]._id, { relatedCases: [cases[0]._id, cases[5]._id] });
  await Case.findByIdAndUpdate(cases[3]._id, { relatedCases: [cases[8]._id] });
  await Case.findByIdAndUpdate(cases[8]._id, { relatedCases: [cases[3]._id] });
  console.log('📁 Created 10 cases');

  // Update campaigns with case refs
  await Campaign.findByIdAndUpdate(camp1._id, { cases: [cases[0]._id, cases[2]._id] });
  await Campaign.findByIdAndUpdate(camp2._id, { cases: [cases[1]._id, cases[5]._id] });
  await Campaign.findByIdAndUpdate(camp3._id, { cases: [cases[4]._id, cases[6]._id, cases[7]._id] });
  await Campaign.findByIdAndUpdate(camp4._id, { cases: [cases[3]._id, cases[8]._id] });
  await Campaign.findByIdAndUpdate(camp5._id, { cases: [cases[9]._id] });

  // --- IOCs ---
  const iocDefs = [
    // Case 0 — CASE-2026-001
    { case: cases[0]._id, type: 'domain',  value: 'secure-login-verify.net',        riskLevel: 'critical', reputationScore: 96 },
    { case: cases[0]._id, type: 'domain',  value: 'microsoft-auth-portal.com',      riskLevel: 'critical', reputationScore: 94 },
    { case: cases[0]._id, type: 'ip',      value: '185.10.20.4',                    riskLevel: 'critical', reputationScore: 97, geo: geoData['185.10.20.4'] },
    { case: cases[0]._id, type: 'ip',      value: '45.142.212.100',                 riskLevel: 'high',     reputationScore: 88, geo: geoData['45.142.212.100'] },
    { case: cases[0]._id, type: 'url',     value: 'https://secure-login-verify.net/verify/account', riskLevel: 'critical', reputationScore: 96 },
    { case: cases[0]._id, type: 'hash',    value: 'a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8', riskLevel: 'high',     reputationScore: 82 },
    { case: cases[0]._id, type: 'asn',     value: 'AS47583',                        riskLevel: 'high',     reputationScore: 85 },
    // Case 1 — CASE-2026-002
    { case: cases[1]._id, type: 'domain',  value: 'cfo-wire-transfer-portal.com',   riskLevel: 'critical', reputationScore: 98 },
    { case: cases[1]._id, type: 'ip',      value: '193.106.191.25',                 riskLevel: 'critical', reputationScore: 95, geo: geoData['193.106.191.25'] },
    { case: cases[1]._id, type: 'email',   value: 'ceo@acme-corp.security.net',     riskLevel: 'critical', reputationScore: 99 },
    { case: cases[1]._id, type: 'domain',  value: 'acme-corp.security.net',         riskLevel: 'critical', reputationScore: 97 },
    // Case 2 — CASE-2026-003
    { case: cases[2]._id, type: 'url',     value: 'https://oauth-google-secure.net/auth?redirect=steal', riskLevel: 'critical', reputationScore: 93 },
    { case: cases[2]._id, type: 'domain',  value: 'oauth-google-secure.net',        riskLevel: 'critical', reputationScore: 93 },
    { case: cases[2]._id, type: 'ip',      value: '91.108.4.1',                     riskLevel: 'high',     reputationScore: 87, geo: geoData['91.108.4.1'] },
    // Case 3 — CASE-2026-004
    { case: cases[3]._id, type: 'ip',      value: '5.188.206.14',                   riskLevel: 'critical', reputationScore: 99, geo: geoData['5.188.206.14'] },
    { case: cases[3]._id, type: 'domain',  value: 'ransomware-c2-node.onion.to',    riskLevel: 'critical', reputationScore: 100 },
    { case: cases[3]._id, type: 'hash',    value: 'b1e2f3a4c5d6e7f8b9a0c1d2e3f4a5b6', riskLevel: 'critical', reputationScore: 100 },
    { case: cases[3]._id, type: 'hash',    value: 'deadbeef12345678abcdef9876543210', riskLevel: 'critical', reputationScore: 98 },
    { case: cases[3]._id, type: 'ip',      value: '194.165.16.78',                  riskLevel: 'critical', reputationScore: 96, geo: geoData['194.165.16.78'] },
    // Case 4 — CASE-2026-005
    { case: cases[4]._id, type: 'domain',  value: 'microsoftonline-login.net',      riskLevel: 'high',     reputationScore: 85 },
    { case: cases[4]._id, type: 'url',     value: 'https://microsoftonline-login.net/signin', riskLevel: 'high', reputationScore: 85 },
    { case: cases[4]._id, type: 'ip',      value: '46.17.43.10',                    riskLevel: 'high',     reputationScore: 80, geo: geoData['46.17.43.10'] },
    // Case 5 — CASE-2026-006
    { case: cases[5]._id, type: 'email',   value: 'ceo@companysecure.io',           riskLevel: 'critical', reputationScore: 97 },
    { case: cases[5]._id, type: 'domain',  value: 'companysecure.io',               riskLevel: 'high',     reputationScore: 84 },
    { case: cases[5]._id, type: 'ip',      value: '213.109.202.26',                 riskLevel: 'high',     reputationScore: 83, geo: geoData['213.109.202.26'] },
    // Case 6 — CASE-2026-007
    { case: cases[6]._id, type: 'domain',  value: 'vendor-billing-portal.com',      riskLevel: 'medium',   reputationScore: 68 },
    { case: cases[6]._id, type: 'ip',      value: '104.21.44.102',                  riskLevel: 'medium',   reputationScore: 65, geo: geoData['104.21.44.102'] },
    // Case 7 — CASE-2026-008
    { case: cases[7]._id, type: 'domain',  value: 'docusign-verify.io',             riskLevel: 'high',     reputationScore: 82 },
    { case: cases[7]._id, type: 'url',     value: 'https://docusign-verify.io/sign/document', riskLevel: 'high', reputationScore: 82 },
    { case: cases[7]._id, type: 'ip',      value: '172.67.68.21',                   riskLevel: 'medium',   reputationScore: 70, geo: geoData['172.67.68.21'] },
    // Case 8 — CASE-2026-009
    { case: cases[8]._id, type: 'hash',    value: 'f1e2d3c4b5a6978869504132badc0ffe', riskLevel: 'critical', reputationScore: 100 },
    { case: cases[8]._id, type: 'domain',  value: 'dropper-stage2-delivery.net',    riskLevel: 'critical', reputationScore: 99 },
    { case: cases[8]._id, type: 'ip',      value: '5.188.206.14',                   riskLevel: 'critical', reputationScore: 99, geo: geoData['5.188.206.14'] },
    // Case 9 — CASE-2026-010
    { case: cases[9]._id, type: 'domain',  value: 'vpn-access-portal.org',          riskLevel: 'medium',   reputationScore: 65 },
    { case: cases[9]._id, type: 'url',     value: 'https://vpn-access-portal.org/login', riskLevel: 'medium', reputationScore: 65 },
    { case: cases[9]._id, type: 'ip',      value: '45.142.212.100',                 riskLevel: 'medium',   reputationScore: 62, geo: geoData['45.142.212.100'] },
  ];

  const iocs = await IOC.insertMany(iocDefs.map(i => ({
    ...i,
    tags: [i.type, i.riskLevel],
    firstSeen: new Date(Date.now() - Math.random() * 7 * 86400000),
    lastSeen: new Date()
  })));
  console.log(`🎯 Created ${iocs.length} IOCs`);

  // Update campaign ioc refs
  await Campaign.findByIdAndUpdate(camp1._id, { iocs: iocs.slice(0, 7).map(i => i._id) });
  await Campaign.findByIdAndUpdate(camp2._id, { iocs: iocs.slice(7, 11).map(i => i._id) });

  // --- ALERTS ---
  const alertDefs = [
    { case: cases[0]._id, severity: 'critical', message: 'CRITICAL: Credential harvesting site active — secure-login-verify.net', threatScore: 96 },
    { case: cases[3]._id, severity: 'critical', message: 'CRITICAL: Ransomware C2 communication detected — 5.188.206.14', threatScore: 98 },
    { case: cases[8]._id, severity: 'critical', message: 'CRITICAL: Multi-stage malware dropper hash matched — f1e2d3c4...', threatScore: 95 },
    { case: cases[1]._id, severity: 'critical', message: 'CRITICAL: CEO fraud attempt intercepted — wire transfer requested', threatScore: 92 },
    { case: cases[0]._id, severity: 'high',     message: 'New IOC linked to NIGHTFALL campaign — AS47583 IP detected', threatScore: 85, acknowledged: true },
    { case: cases[2]._id, severity: 'high',     message: 'OAuth phishing kit deployed — oauth-google-secure.net active', threatScore: 84 },
    { case: cases[4]._id, severity: 'high',     message: 'Microsoft login page spoofed — microsoftonline-login.net', threatScore: 78 },
    { case: cases[5]._id, severity: 'high',     message: 'Executive impersonation email detected — CFO target', threatScore: 81 },
    { case: cases[7]._id, severity: 'high',     message: 'DocuSign phishing campaign expanded — 3 new domains registered', threatScore: 75 },
    { case: cases[6]._id, severity: 'medium',   message: 'Supply chain email redirect detected — vendor-billing-portal.com', threatScore: 68, acknowledged: true },
    { case: cases[9]._id, severity: 'medium',   message: 'VPN credential harvester detected — vpn-access-portal.org', threatScore: 62 },
    { case: cases[0]._id, severity: 'critical', message: 'Campaign NIGHTFALL: 3 new C2 IPs added to infrastructure', threatScore: 94 },
    { case: cases[3]._id, severity: 'critical', message: 'Ransomware beacon observed — possible lateral movement in progress', threatScore: 97 },
    { case: cases[1]._id, severity: 'high',     message: 'SHADOWNET campaign: New BEC domain registered today', threatScore: 88, acknowledged: true },
    { case: cases[9]._id, severity: 'info',     message: 'VPN phishing campaign REDSTORM: Activity decreased 40%', threatScore: 45, acknowledged: true },
    { case: cases[8]._id, severity: 'critical', message: 'Stage-2 malware payload downloaded — IRONVEIL campaign active', threatScore: 95 },
    { case: cases[2]._id, severity: 'high',     message: 'Google OAuth phishing page SSL certificate renewed', threatScore: 80 },
    { case: cases[4]._id, severity: 'medium',   message: 'GHOSTPHISH campaign: 15 new phishing emails intercepted', threatScore: 72, acknowledged: true },
    { case: cases[5]._id, severity: 'critical', message: 'CEO fraud email bypassed spam filter — user may have seen it', threatScore: 90 },
    { case: cases[7]._id, severity: 'medium',   message: 'DocuSign lure: New PDF attachment hash detected', threatScore: 70 },
  ];

  await Alert.insertMany(alertDefs.map(a => ({ ...a, acknowledged: a.acknowledged || false, type: 'threat_detected' })));
  console.log('🚨 Created 20 alerts');

  // --- EMAILS ---
  const emailDefs = [
    { case: cases[0]._id, subject: '[URGENT] Verify Your Microsoft Account — Action Required', sender: 'security@microsoft-verify.secure-login-verify.net', recipients: ['target@victim-corp.com'], riskScore: 96, spf: 'fail', dkim: 'fail', dmarc: 'fail', body: 'Dear User, We have detected unusual activity on your account. Please verify immediately by clicking the link. URGENT ACTION REQUIRED.', flaggedPhrases: ['urgent', 'verify immediately', 'action required'], warnings: ['SPF failed', 'DKIM invalid', 'DMARC failed', 'Suspicious phrases detected'] },
    { case: cases[1]._id, subject: 'Wire Transfer Authorization — Confidential', sender: 'ceo@acme-corp.security.net', recipients: ['cfo@victim-corp.com'], riskScore: 92, spf: 'fail', dkim: 'fail', dmarc: 'fail', body: 'Please process the attached wire transfer of $285,000 immediately. This is time-sensitive. Do not discuss with anyone.', flaggedPhrases: ['immediately', 'confidential', 'do not discuss'], warnings: ['CEO impersonation detected', 'SPF failed', 'Reply-to domain mismatch'] },
    { case: cases[2]._id, subject: 'Google requires you to re-authorize your application', sender: 'no-reply@oauth-google-secure.net', recipients: ['user@targetorg.com'], riskScore: 84, spf: 'fail', dkim: 'fail', dmarc: 'fail', body: 'Your Google OAuth token has expired. Click here to reauthorize: https://oauth-google-secure.net/auth', flaggedPhrases: ['click here', 'expired'], warnings: ['OAuth phishing pattern', 'Domain impersonates Google'] },
    { case: cases[4]._id, subject: 'Your Microsoft 365 account will be suspended', sender: 'admin@microsoftonline-login.net', recipients: ['admin@targetcompany.com'], riskScore: 78, spf: 'fail', dkim: 'fail', dmarc: 'fail', body: 'Your account will be suspended in 24 hours unless you login and verify. Account suspended. Immediate action required.', flaggedPhrases: ['account suspended', 'immediate action required', 'verify now'], warnings: ['Brand impersonation: Microsoft', 'SPF failed'] },
    { case: cases[7]._id, subject: 'Please DocuSign: CONTRACT_2026_FINAL.pdf', sender: 'dse@docusign-verify.io', recipients: ['legal@targetfirm.com'], riskScore: 75, spf: 'fail', dkim: 'fail', dmarc: 'fail', body: 'You have received a document to review and sign. Click Review Document to proceed: https://docusign-verify.io/sign/document', flaggedPhrases: ['click review'], warnings: ['DocuSign impersonation', 'Domain not official DocuSign'] },
  ];

  await Email.insertMany(emailDefs.map(e => ({
    ...e, originatingIP: '185.10.20.4',
    receivedAt: new Date(Date.now() - Math.random() * 5 * 86400000)
  })));
  console.log('📧 Created 5 seed emails');

  // --- GRAPH EDGES ---
  const graphEdges = [];
  for (const c of cases.slice(0, 5)) {
    const cIOCs = iocs.filter(i => i.case.toString() === c._id.toString());
    for (let i = 0; i < cIOCs.length - 1; i++) {
      graphEdges.push({
        case: c._id,
        sourceType: 'case', sourceId: c._id.toString(), sourceLabel: c.caseId,
        targetType: cIOCs[i].type, targetId: cIOCs[i]._id.toString(), targetLabel: cIOCs[i].value.slice(0, 30),
        relationship: 'contains', weight: 2
      });
      if (i < cIOCs.length - 2) {
        graphEdges.push({
          case: c._id,
          sourceType: cIOCs[i].type, sourceId: cIOCs[i]._id.toString(), sourceLabel: cIOCs[i].value.slice(0, 30),
          targetType: cIOCs[i + 1].type, targetId: cIOCs[i + 1]._id.toString(), targetLabel: cIOCs[i + 1].value.slice(0, 30),
          relationship: 'resolves_to', weight: 1
        });
      }
    }
  }
  await GraphEdge.insertMany(graphEdges);
  console.log(`🕸️  Created ${graphEdges.length} graph edges`);

  // --- TIMELINE EVENTS ---
  const timelineEvents = [];
  for (const c of cases) {
    const base = new Date(c.firstSeen);
    timelineEvents.push(
      { case: c._id, timestamp: new Date(base.getTime() + 0), event: 'Case opened — suspicious email detected', type: 'email', severity: c.severity, details: 'Initial email flagged by automated filter' },
      { case: c._id, timestamp: new Date(base.getTime() + 3600000), event: 'IOC extraction completed', type: 'ioc', severity: 'info', details: `${c.iocCount} indicators extracted` },
      { case: c._id, timestamp: new Date(base.getTime() + 7200000), event: `Threat score calculated: ${c.threatScore}/100`, type: 'score', severity: c.severity, details: 'Automated scoring engine completed analysis' },
      { case: c._id, timestamp: new Date(base.getTime() + 14400000), event: 'Campaign correlation complete', type: 'campaign', severity: 'info', details: 'Linked to active campaign in database' },
      { case: c._id, timestamp: new Date(base.getTime() + 86400000), event: 'Analyst review initiated', type: 'analysis', severity: 'info', actor: 'Alex Mercer', details: 'Senior analyst assigned to investigation' }
    );
  }
  await TimelineEvent.insertMany(timelineEvents);
  console.log(`📅 Created ${timelineEvents.length} timeline events`);

  // --- REPORTS ---
  await Report.insertMany([
    {
      case: cases[0]._id, type: 'full', generatedBy: adminUser._id, status: 'final',
      title: 'Threat Intelligence Report — CASE-2026-001',
      sections: {
        executiveSummary: 'A CRITICAL severity credential harvesting campaign (CASE-2026-001) was identified targeting corporate accounts. Threat score: 96/100. Immediate containment required.',
        technicalAnalysis: 'The attack infrastructure leverages bulletproof hosting on AS47583. SPF/DKIM/DMARC all fail. Fast-flux DNS detected.',
        iocSummary: 'Domain: secure-login-verify.net [CRITICAL]\nIP: 185.10.20.4 [CRITICAL] — Russia\nURL: https://secure-login-verify.net/verify/account [CRITICAL]',
        riskAssessment: 'Risk: CRITICAL. Score 96/100. Confidence 97%.',
        recommendations: '1. Block all IOCs at perimeter\n2. Reset targeted account credentials\n3. Enable MFA\n4. Submit IOCs to threat intel platforms'
      }
    },
    {
      case: cases[3]._id, type: 'full', generatedBy: adminUser._id, status: 'final',
      title: 'Threat Intelligence Report — CASE-2026-004',
      sections: {
        executiveSummary: 'CRITICAL ransomware infrastructure detected (CASE-2026-004). Score: 98/100. Part of IRONVEIL APT campaign.',
        technicalAnalysis: 'Multi-stage delivery chain. C2 at 5.188.206.14 (Russia). Two unique malware hashes identified.',
        iocSummary: 'IP: 5.188.206.14 [CRITICAL] — Russia\nDomain: ransomware-c2-node.onion.to [CRITICAL]\nHash: b1e2f3a4... [CRITICAL]',
        riskAssessment: 'Risk: CRITICAL. Score 98/100. APT-level threat actor.',
        recommendations: '1. Isolate affected endpoints immediately\n2. Block C2 IPs and domains\n3. Engage incident response team\n4. Notify legal/compliance'
      }
    }
  ]);
  console.log('📄 Created 2 reports');

  console.log('\n✅ ============================');
  console.log('   SEED COMPLETE');
  console.log('============================');
  console.log('👤 Users:');
  console.log('   admin@cybersleuthes.com / Demo@2026 (Admin)');
  console.log('   analyst@cybersleuthes.com / Demo@2026 (Analyst)');
  console.log(`📁 Cases: 10 | 🎯 IOCs: ${iocs.length} | 🚨 Alerts: 20`);
  console.log('📋 Campaigns: 5 | 📄 Reports: 2');
  console.log('============================\n');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
