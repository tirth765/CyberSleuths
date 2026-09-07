const responses = {
  threat: (ctx) => `## 🚨 Threat Analysis: ${ctx.caseId || 'Active Investigation'}

Based on my analysis, I've identified a **${(ctx.severity || 'critical').toUpperCase()} Threat** with a score of **${ctx.threatScore || 96}/100**.

### Key Findings:
- **SPF and DKIM authentication** failures detected — sender is not legitimate
- **Malicious infrastructure** hosted in Eastern Europe with bulletproof hosting
- **Domain age**: Registered only ${Math.floor(Math.random() * 7) + 1} days before the attack
- **${ctx.iocCount || 24} IOCs** identified across ${Math.floor(Math.random() * 3) + 2} related campaigns

### Threat Classification:
**${ctx.attackType || 'Credential Harvesting'}** campaign leveraging urgency-based social engineering. The sending infrastructure shares ASN with 3 other known phishing campaigns in our database.

### Recommended Actions:
1. Block all identified domains and IPs at perimeter
2. Reset credentials for targeted accounts
3. Enable MFA immediately
4. Submit IOCs to threat intelligence platforms`,

  related: (ctx) => `## 🔗 Related Investigations Found

I found **${Math.floor(Math.random() * 3) + 3} related investigations** sharing common infrastructure:

### CASE-2026-004 — 89% Similarity
- Shared domain: \`secure-login-verify.net\`
- Same ASN: AS47583 (Bulletproof Hosting)
- Attack type: Credential Harvesting

### CASE-2026-009 — 82% Similarity
- Identical email template structure
- Overlapping IP range: \`185.10.20.x/24\`
- Campaign: **NIGHTFALL**

### CASE-2026-011 — 76% Similarity
- Same threat actor TTPs
- Shared C2 infrastructure
- Campaign: **SHADOWNET**

> **Recommendation:** Block the entire /24 subnet and all associated domains immediately. These attacks are coordinated.`,

  summary: (ctx) => `## 📋 Investigation Summary

**${ctx.title || 'Credential Harvesting Campaign'}** (${ctx.caseId || 'CASE-2026-001'}) is a **${(ctx.severity || 'critical').toUpperCase()}** severity incident.

| Field | Value |
|---|---|
| Threat Score | ${ctx.threatScore || 96}/100 |
| Attack Type | ${ctx.attackType || 'Phishing'} |
| IOCs Found | ${ctx.iocCount || 24} |
| Confidence | ${ctx.confidence || 96}% |

### Attack Vector:
Spear-phishing email with credential harvesting payload targeting executive accounts.

### Infrastructure:
${ctx.iocCount || 24} IOCs spanning Russia, Netherlands, and China.

### Timeline:
Attack began approximately 72 hours ago with initial email delivery.

### Recommended Actions:
1. Block all identified domains and IPs
2. Reset credentials for affected accounts
3. Enable MFA across all authentication systems
4. Submit IOCs to threat intelligence sharing platforms`,

  ioc: (ctx) => `## 🔍 IOC Analysis: \`${ctx.value || 'secure-login-verify.net'}\`

**Type:** ${(ctx.type || 'domain').toUpperCase()}
**Reputation Score:** ${ctx.reputationScore || 94}/100 — **CRITICAL**

### Threat Intelligence:
- First observed: **3 days ago**
- Associated with **${Math.floor(Math.random() * 3) + 2} active campaigns**
- Hosting: Bulletproof hosting provider (AS47583)
- DNS: Rapid IP cycling detected (fast-flux technique)

### Related Infrastructure:
- 4 sibling domains with identical registration pattern
- Shared hosting with 12 other malicious domains
- TLS certificate issued 2 days before first observed attack

### Recommendation:
Block immediately at DNS and firewall level. Add to threat intelligence feeds.`,

  hunt: (ctx) => `## 🏹 Threat Hunting Recommendations

Based on the current investigation, I recommend hunting for:

### Infrastructure to Investigate:
1. **IP Range:** \`185.10.20.0/24\` — Known bulletproof hosting bloc
2. **ASN:** AS47583 — Associated with multiple campaigns
3. **Domain Pattern:** \`*-login-verify.net\` — Registrant fingerprint match
4. **Certificate:** CN=Let's Encrypt, issued in last 7 days to similar domains

### TTPs to Hunt:
- Phishing emails with urgency keywords in subject line
- SPF/DKIM failures from spoofed corporate domains
- HTTP redirects to credential harvesting pages
- POST requests to \`/submit\` or \`/verify\` endpoints

### Threat Actor Profile:
This infrastructure matches **TA2847** — a financially motivated group operating since 2024, primarily targeting financial and tech sectors.`,

  report: () => `## 📄 Executive Report Summary

**CYBERSLEUTHES THREAT INTELLIGENCE REPORT**

This investigation confirms a sophisticated credential harvesting operation targeting enterprise accounts. The threat actor leveraged compromised infrastructure across 3 countries to evade detection.

### Risk Level: CRITICAL
### Recommended Response: Immediate containment required

### Business Impact:
- Potential credential compromise for targeted accounts
- Risk of lateral movement if credentials were entered
- Regulatory notification may be required (GDPR Article 33)

Would you like me to generate the full technical report with all IOCs, infrastructure details, and remediation steps?`,

  default: () => `## 🤖 CyberSleuth AI Analysis

I'm ready to help with your threat investigation. Here's what I can do:

- **Analyze threats** — explain why a score is high
- **Find related attacks** — identify campaigns sharing infrastructure  
- **Summarize investigations** — generate executive summaries
- **Hunt threats** — suggest infrastructure to investigate
- **Generate reports** — create detailed incident reports
- **IOC analysis** — deep-dive into specific indicators

Try asking:
- *"Why is this threat critical?"*
- *"Find related attacks to this domain"*
- *"Summarize this investigation"*
- *"What should I hunt next?"*`
};

exports.getDemoResponse = (message, context = {}) => {
  const msg = message.toLowerCase();
  if (msg.includes('why') || msg.includes('critical') || msg.includes('score') || msg.includes('threat')) return responses.threat(context);
  if (msg.includes('related') || msg.includes('similar') || msg.includes('find') || msg.includes('attacks')) return responses.related(context);
  if (msg.includes('summary') || msg.includes('summarize') || msg.includes('overview') || msg.includes('report')) return responses.summary(context);
  if (msg.includes('ioc') || msg.includes('domain') || msg.includes('ip') || msg.includes('know about')) return responses.ioc(context);
  if (msg.includes('hunt') || msg.includes('investigate') || msg.includes('infrastructure')) return responses.hunt(context);
  if (msg.includes('generate') || msg.includes('executive')) return responses.report();
  return responses.default();
};
