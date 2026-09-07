exports.calculateThreatScore = (factors = {}) => {
  let score = 0;
  if (factors.suspiciousSender) score += 15;
  if (factors.spfFail) score += 10;
  if (factors.dkimFail) score += 10;
  if (factors.dmarcFail) score += 8;
  if (factors.maliciousDomain) score += 20;
  if (factors.maliciousIP) score += 20;
  if (factors.suspiciousURL) score += 10;
  if (factors.knownMaliciousHash) score += 15;
  if (factors.relatedCampaign) score += 20;
  if (factors.multipleFailedChecks) score += 10;
  if (factors.replyToDomainMismatch) score += 8;
  if (factors.urgentLanguage) score += 5;
  if (factors.suspiciousAttachment) score += 12;
  if (factors.encodedContent) score += 7;
  score = Math.min(score, 100);
  const severity = exports.getSeverity(score);
  return { score, severity };
};

exports.getSeverity = (score) => {
  if (score >= 90) return 'critical';
  if (score >= 70) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
};
