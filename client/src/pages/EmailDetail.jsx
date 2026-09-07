import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Shield, AlertTriangle } from 'lucide-react';
import api from '../services/api';
import IOCBadge from '../components/IOCBadge';
import RiskBadge from '../components/RiskBadge';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { formatDate, getRiskColor } from '../utils/riskUtils';

const TABS = ['Overview', 'Headers', 'Body', 'IOCs', 'Authentication', 'Attachments'];

export default function EmailDetail() {
  const { id } = useParams();
  const [email, setEmail] = useState(null);
  const [tab, setTab] = useState('Overview');

  useEffect(() => {
    api.get(`/emails/${id}`).then(r => setEmail(r.data.data)).catch(() => {});
  }, [id]);

  if (!email) return <div className="p-6"><LoadingSkeleton rows={8} /></div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/email-analysis" className="p-2 hover:bg-border rounded-lg transition-colors">
          <ArrowLeft size={18} className="text-muted" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-white">{email.subject || 'Email Analysis'}</h1>
          <p className="text-muted text-xs mt-0.5">From: {email.sender} · {formatDate(email.receivedAt)}</p>
        </div>
        <div className="text-center">
          <p className="text-4xl font-bold" style={{ color: getRiskColor(email.riskScore >= 90 ? 'critical' : email.riskScore >= 70 ? 'high' : 'medium') }}>
            {email.riskScore}
          </p>
          <p className="text-muted text-xs">Risk Score</p>
        </div>
      </div>

      {/* Auth row */}
      <div className="flex gap-2 flex-wrap">
        {[['SPF', email.spf], ['DKIM', email.dkim], ['DMARC', email.dmarc]].map(([k, v]) => (
          <div key={k} className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${v === 'pass' ? 'border-green-500/30 bg-green-500/10' : 'border-red-500/30 bg-red-500/10'}`}>
            {v === 'pass' ? <Shield size={14} className="text-green-400" /> : <AlertTriangle size={14} className="text-red-400" />}
            <span className={`text-sm font-semibold ${v === 'pass' ? 'text-green-400' : 'text-red-400'}`}>{k}: {v?.toUpperCase()}</span>
          </div>
        ))}
        {email.case && (
          <Link to={`/investigations/${email.case._id}`} className="flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/20 rounded-xl text-sm text-accent hover:bg-accent/20 transition-colors">
            Case: {email.case.caseId}
          </Link>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-border flex gap-1 overflow-x-auto">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm border-b-2 transition-colors whitespace-nowrap ${tab === t ? 'border-accent text-accent font-semibold' : 'border-transparent text-muted hover:text-white'}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'Overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-xl p-5 space-y-3 text-sm">
            {[
              ['From', email.sender], ['To', email.recipients?.join(', ')],
              ['Reply-To', email.replyTo || 'N/A'], ['Message-ID', email.messageId || 'N/A'],
            ].map(([k, v]) => (
              <div key={k} className="flex gap-3"><p className="text-muted w-24 flex-shrink-0">{k}</p><p className="text-white break-all">{v || 'N/A'}</p></div>
            ))}
          </div>
          {email.warnings?.length > 0 && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-5">
              <h3 className="text-red-400 font-semibold mb-3 flex items-center gap-2"><AlertTriangle size={16} />Warnings</h3>
              <ul className="space-y-2">
                {email.warnings.map((w, i) => <li key={i} className="text-muted text-sm flex gap-2"><span className="text-red-400">•</span>{w}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}

      {tab === 'Headers' && (
        <div className="bg-card border border-border rounded-xl p-5">
          <pre className="text-xs text-muted font-mono whitespace-pre-wrap overflow-auto max-h-96">
            {email.headers ? JSON.stringify(Object.fromEntries(email.headers), null, 2) : 'No headers available'}
          </pre>
        </div>
      )}

      {tab === 'Body' && (
        <div className="bg-card border border-border rounded-xl p-5">
          <pre className="text-sm text-muted font-mono whitespace-pre-wrap overflow-auto max-h-96">
            {email.body || 'No body content'}
          </pre>
          {email.flaggedPhrases?.length > 0 && (
            <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <p className="text-amber-400 text-sm font-semibold mb-2">Flagged Phrases:</p>
              <div className="flex flex-wrap gap-2">
                {email.flaggedPhrases.map(p => <span key={p} className="px-2 py-1 bg-amber-500/20 text-amber-400 text-xs rounded-lg">{p}</span>)}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'IOCs' && (
        <div className="space-y-2">
          {(email.extractedIOCs || []).map(ioc => (
            <div key={ioc._id} className="bg-card border border-border rounded-xl p-3 flex items-center gap-3">
              <IOCBadge type={ioc.type} />
              <code className="text-white text-xs font-mono flex-1 truncate">{ioc.value}</code>
              <RiskBadge level={ioc.riskLevel} />
              <Link to={`/iocs/${ioc._id}`} className="text-accent text-xs hover:underline">View</Link>
            </div>
          ))}
          {(!email.extractedIOCs || email.extractedIOCs.length === 0) && <p className="text-muted text-sm text-center py-8">No IOCs extracted</p>}
        </div>
      )}

      {tab === 'Authentication' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[['SPF', email.spf, 'Sender Policy Framework — verifies sending server is authorized'], ['DKIM', email.dkim, 'DomainKeys Identified Mail — verifies email was not tampered'], ['DMARC', email.dmarc, 'Domain-based Message Authentication — policy enforcement']].map(([k, v, desc]) => (
            <div key={k} className={`bg-card border rounded-xl p-5 ${v === 'pass' ? 'border-green-500/30' : 'border-red-500/30'}`}>
              <div className="flex items-center gap-2 mb-2">
                {v === 'pass' ? <Shield size={18} className="text-green-400" /> : <AlertTriangle size={18} className="text-red-400" />}
                <span className="font-bold text-white">{k}</span>
                <span className={`ml-auto text-sm font-bold ${v === 'pass' ? 'text-green-400' : 'text-red-400'}`}>{v?.toUpperCase()}</span>
              </div>
              <p className="text-muted text-xs">{desc}</p>
            </div>
          ))}
        </div>
      )}

      {tab === 'Attachments' && (
        <div>
          {(email.attachments || []).map((a, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
              <div className="p-2 bg-border rounded-lg"><Mail size={16} className="text-muted" /></div>
              <div><p className="text-white text-sm">{a.filename || 'Unknown'}</p><p className="text-muted text-xs">{a.mimeType} · {(a.size / 1024).toFixed(1)}KB</p></div>
              {a.hash && <code className="text-muted text-xs font-mono ml-auto">{a.hash.slice(0, 16)}...</code>}
            </div>
          ))}
          {(!email.attachments || email.attachments.length === 0) && <p className="text-muted text-sm text-center py-8">No attachments</p>}
        </div>
      )}
    </motion.div>
  );
}
