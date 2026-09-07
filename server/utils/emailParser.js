const { simpleParser } = require('mailparser');
const crypto = require('crypto');

exports.parseEmail = async (buffer) => {
  const parsed = await simpleParser(buffer);
  const headersObj = {};
  if (parsed.headers) {
    parsed.headers.forEach((value, key) => { headersObj[key] = String(value); });
  }
  return {
    subject: parsed.subject || '',
    sender: parsed.from?.text || '',
    recipients: parsed.to?.value?.map(r => r.address) || [],
    replyTo: parsed.replyTo?.text || '',
    messageId: parsed.messageId || '',
    date: parsed.date || new Date(),
    body: parsed.text || '',
    htmlBody: parsed.html || '',
    bodyHash: crypto.createHash('md5').update(parsed.text || '').digest('hex'),
    headers: headersObj,
    attachments: (parsed.attachments || []).map(a => ({
      filename: a.filename,
      size: a.size,
      mimeType: a.contentType,
      hash: crypto.createHash('sha256').update(a.content).digest('hex')
    }))
  };
};

exports.extractIOCs = (text) => {
  const iocs = { domains: [], ips: [], urls: [], emails: [], hashes: [] };
  const urlRegex = /https?:\/\/[^\s<>"]+/gi;
  const ipRegex = /\b(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\b/g;
  const hashRegex = /\b[a-fA-F0-9]{32}\b|\b[a-fA-F0-9]{40}\b|\b[a-fA-F0-9]{64}\b/g;
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

  iocs.urls = [...new Set((text.match(urlRegex) || []))];
  iocs.ips = [...new Set((text.match(ipRegex) || []).filter(ip =>
    !ip.startsWith('192.168') && !ip.startsWith('10.') && !ip.startsWith('127.')
  ))];
  iocs.emails = [...new Set((text.match(emailRegex) || []))];
  iocs.hashes = [...new Set((text.match(hashRegex) || []))];

  const urlDomains = iocs.urls.map(u => {
    try { return new URL(u).hostname; } catch { return null; }
  }).filter(Boolean);
  iocs.domains = [...new Set(urlDomains)];

  return iocs;
};

exports.checkSuspiciousPatterns = (text) => {
  const patterns = [
    'urgent', 'immediate action required', 'verify now', 'account suspended',
    'click here', 'confirm your password', 'password expired', 'unusual activity',
    'verify your account', 'login immediately', 'security alert', 'update your information'
  ];
  return patterns.filter(p => text.toLowerCase().includes(p));
};
