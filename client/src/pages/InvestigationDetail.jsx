import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText, Bot, CheckCircle, Clock, Fingerprint, Mail, Network, BarChart2, GitBranch, StickyNote, Globe } from 'lucide-react';
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps';
import { useCaseStore } from '../stores/caseStore';
import RiskBadge from '../components/RiskBadge';
import ThreatScoreRing from '../components/ThreatScoreRing';
import IOCBadge from '../components/IOCBadge';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import api from '../services/api';
import toast from 'react-hot-toast';
import { timeAgo, getRiskColor, formatDate } from '../utils/riskUtils';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';
const TABS = [
  { id: 'overview',    icon: BarChart2,  label: 'Overview' },
  { id: 'emails',      icon: Mail,       label: 'Emails' },
  { id: 'iocs',        icon: Fingerprint,label: 'IOCs' },
  { id: 'map',         icon: Globe,      label: 'Infrastructure' },
  { id: 'timeline',    icon: Clock,      label: 'Timeline' },
  { id: 'related',     icon: GitBranch,  label: 'Related' },
  { id: 'notes',       icon: StickyNote, label: 'Notes' },
];

export default function InvestigationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentCase, fetchCase, updateCase } = useCaseStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [tabData, setTabData] = useState({});
  const [tabLoading, setTabLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchCase(id); }, [id]);
  useEffect(() => { if (currentCase) setNotes(currentCase.notes || ''); }, [currentCase]);

  useEffect(() => {
    if (!currentCase) return;
    const fetchTab = async () => {
      if (tabData[activeTab]) return;
      setTabLoading(true);
      try {
        let res;
        if (activeTab === 'emails') res = await api.get(`/cases/${id}/emails`);
        else if (activeTab === 'iocs') res = await api.get(`/cases/${id}/iocs`);
        else if (activeTab === 'map') res = await api.get(`/cases/${id}/map`);
        else if (activeTab === 'timeline') res = await api.get(`/cases/${id}/timeline`);
        else if (activeTab === 'related') res = await api.get(`/cases/${id}/related`);
        if (res) setTabData(prev => ({ ...prev, [activeTab]: res.data.data }));
      } catch { setTabData(prev => ({ ...prev, [activeTab]: [] })); }
      finally { setTabLoading(false); }
    };
    fetchTab();
  }, [activeTab, currentCase]);

  const handleCloseCase = async () => {
    try {
      await updateCase(id, { status: currentCase.status === 'closed' ? 'open' : 'closed' });
      toast.success(currentCase.status === 'closed' ? 'Case reopened' : 'Case closed');
    } catch { toast.error('Failed to update case'); }
  };

  const handleGenerateReport = async () => {
    try {
      const res = await api.post('/reports', { caseId: id });
      toast.success('Report generated');
      navigate(`/reports/${res.data.data._id}`);
    } catch { toast.error('Failed to generate report'); }
  };

  const handleSaveNotes = async () => {
    setSaving(true);
    try {
      await updateCase(id, { notes });
      toast.success('Notes saved');
    } catch { toast.error('Failed to save notes'); }
    finally { setSaving(false); }
  };

  if (!currentCase) return <div className="p-6"><LoadingSkeleton rows={8} /></div>;

  const c = currentCase;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <button onClick={() => navigate('/investigations')} className="p-2 hover:bg-border rounded-lg transition-colors mt-1">
          <ArrowLeft size={18} className="text-muted" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <span className="text-xs text-muted font-mono bg-border px-2 py-1 rounded">{c.caseId}</span>
            <RiskBadge level={c.severity} size="lg" />
            <span className={`text-xs px-3 py-1 rounded-full border ${
              c.status === 'open' ? 'border-red-500/30 text-red-400 bg-red-500/10' :
              c.status === 'monitoring' ? 'border-amber-500/30 text-amber-400 bg-amber-500/10' :
              'border-green-500/30 text-green-400 bg-green-500/10'
            }`}>{c.status}</span>
          </div>
          <h1 className="text-xl font-bold text-white">{c.title}</h1>
          <p className="text-muted text-sm mt-1">{c.description}</p>
          <div className="flex gap-4 mt-2 text-xs text-muted">
            <span>Analyst: {c.analyst?.name || 'Unassigned'}</span>
            <span>Updated: {timeAgo(c.updatedAt)}</span>
            <span>IOCs: {c.iocCount}</span>
            {c.campaign && <span>Campaign: {c.campaign.name}</span>}
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <ThreatScoreRing score={c.threatScore} size={80} />
          <div className="flex flex-col gap-2">
            <button onClick={handleGenerateReport}
              className="flex items-center gap-1.5 px-3 py-2 bg-accent text-white rounded-lg text-xs font-semibold hover:bg-accent/90 transition-colors">
              <FileText size={13} />Report
            </button>
            <Link to={`/ai-assistant?caseId=${id}`}
              className="flex items-center gap-1.5 px-3 py-2 bg-border text-muted hover:text-white rounded-lg text-xs transition-colors">
              <Bot size={13} />AI Assist
            </Link>
            <button onClick={handleCloseCase}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs transition-colors ${
                c.status === 'closed' ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' : 'bg-border text-muted hover:text-white'
              }`}>
              <CheckCircle size={13} />{c.status === 'closed' ? 'Reopen' : 'Close'}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex gap-1 overflow-x-auto">
          {TABS.map(({ id: tid, icon: Icon, label }) => (
            <button key={tid} onClick={() => setActiveTab(tid)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tid ? 'border-accent text-accent font-semibold' : 'border-transparent text-muted hover:text-white'
              }`}>
              <Icon size={14} />{label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="text-white font-semibold mb-3">Case Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {[
                    ['Attack Type', c.attackType || 'Unknown'],
                    ['Threat Actor', c.threatActor || 'Unknown'],
                    ['Confidence', `${c.confidence || 0}%`],
                    ['IOC Count', c.iocCount || 0],
                    ['First Seen', formatDate(c.firstSeen)],
                    ['Last Activity', formatDate(c.lastActivity)],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <p className="text-muted text-xs uppercase tracking-wider mb-1">{k}</p>
                      <p className="text-white font-medium">{v}</p>
                    </div>
                  ))}
                </div>
                {c.tags?.length > 0 && (
                  <div className="mt-4">
                    <p className="text-muted text-xs uppercase tracking-wider mb-2">Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {c.tags.map(tag => (
                        <span key={tag} className="px-2 py-0.5 bg-border text-muted text-xs rounded-lg">{tag}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {c.campaign && (
                <div className="bg-card border border-border rounded-xl p-5">
                  <h3 className="text-white font-semibold mb-3">Campaign Association</h3>
                  <Link to={`/campaigns/${c.campaign._id}`} className="flex items-center gap-3 hover:bg-border p-3 rounded-lg transition-colors">
                    <Fingerprint size={20} className="text-warning" />
                    <div>
                      <p className="text-white font-semibold">{c.campaign.name}</p>
                      <p className="text-muted text-xs">{c.campaign.severity} severity · {c.campaign.status}</p>
                    </div>
                  </Link>
                </div>
              )}
            </div>
            <div className="space-y-4">
              <div className="bg-card border border-border rounded-xl p-5 text-center">
                <p className="text-muted text-xs uppercase tracking-wider mb-3">Threat Score</p>
                <div className="flex justify-center">
                  <ThreatScoreRing score={c.threatScore} size={120} />
                </div>
                <p className="text-muted text-xs mt-3">Confidence: {c.confidence}%</p>
              </div>
              {c.relatedCases?.length > 0 && (
                <div className="bg-card border border-border rounded-xl p-5">
                  <h3 className="text-white font-semibold mb-3 text-sm">Related Cases</h3>
                  {c.relatedCases.map(rc => (
                    <Link key={rc._id} to={`/investigations/${rc._id}`}
                      className="flex items-center justify-between p-2 hover:bg-border rounded-lg transition-colors">
                      <div>
                        <p className="text-muted text-xs font-mono">{rc.caseId}</p>
                        <p className="text-white text-xs truncate max-w-32">{rc.title}</p>
                      </div>
                      <RiskBadge level={rc.severity} />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {tabLoading && <LoadingSkeleton rows={5} />}

        {activeTab === 'emails' && !tabLoading && (
          <div className="space-y-3">
            {(tabData.emails || []).length === 0 ? <EmptyState icon={Mail} title="No emails" message="No emails linked to this case." /> :
              (tabData.emails || []).map(email => (
                <div key={email._id} className="bg-card border border-border rounded-xl p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-white font-semibold">{email.subject || 'No Subject'}</p>
                      <p className="text-muted text-xs mt-1">From: {email.sender}</p>
                      <div className="flex gap-2 mt-2">
                        {[['SPF', email.spf], ['DKIM', email.dkim], ['DMARC', email.dmarc]].map(([k, v]) => (
                          <span key={k} className={`text-xs px-2 py-0.5 rounded border ${v === 'pass' ? 'border-green-500/30 text-green-400 bg-green-500/10' : 'border-red-500/30 text-red-400 bg-red-500/10'}`}>
                            {k}: {v}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold" style={{ color: getRiskColor(email.riskScore >= 90 ? 'critical' : email.riskScore >= 70 ? 'high' : 'medium') }}>{email.riskScore}</p>
                      <p className="text-muted text-xs">Risk Score</p>
                      <Link to={`/email-analysis/${email._id}`} className="text-xs text-accent hover:underline mt-2 block">View details →</Link>
                    </div>
                  </div>
                </div>
              ))
            }
          </div>
        )}

        {activeTab === 'iocs' && !tabLoading && (
          <div className="space-y-2">
            {(tabData.iocs || []).length === 0 ? <EmptyState icon={Fingerprint} title="No IOCs" message="No indicators linked to this case." /> :
              (tabData.iocs || []).map(ioc => (
                <div key={ioc._id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4 hover:border-accent/30 transition-colors">
                  <IOCBadge type={ioc.type} />
                  <code className="text-white text-sm flex-1 truncate font-mono">{ioc.value}</code>
                  <RiskBadge level={ioc.riskLevel} />
                  {ioc.geo?.country && <span className="text-muted text-xs hidden md:block">{ioc.geo.country}</span>}
                  <span className="text-warning text-sm font-bold">{ioc.reputationScore}</span>
                  <Link to={`/iocs/${ioc._id}`} className="text-accent text-xs hover:underline flex-shrink-0">Details</Link>
                </div>
              ))
            }
          </div>
        )}

        {activeTab === 'map' && !tabLoading && (
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-white font-semibold mb-4">Attack Infrastructure Map</h3>
            <div className="rounded-xl overflow-hidden bg-bg border border-border" style={{ height: 400 }}>
              <ComposableMap projectionConfig={{ scale: 140 }} style={{ width: '100%', height: '100%' }}>
                <ZoomableGroup>
                  <Geographies geography={GEO_URL}>
                    {({ geographies }) => geographies.map(geo => (
                      <Geography key={geo.rsmKey} geography={geo} fill="#1E2433" stroke="#0A0E1A" strokeWidth={0.5}
                        style={{ hover: { fill: '#252B3D' }, pressed: { fill: '#1E2433' } }} />
                    ))}
                  </Geographies>
                  {(tabData.map || []).map((m, i) => (
                    <Marker key={i} coordinates={[m.lon, m.lat]}>
                      <circle r={7} fill={getRiskColor(m.riskLevel)} fillOpacity={0.85} stroke={getRiskColor(m.riskLevel)} strokeWidth={3} strokeOpacity={0.3} />
                      <title>{m.value} — {m.country} [{m.riskLevel}]</title>
                    </Marker>
                  ))}
                </ZoomableGroup>
              </ComposableMap>
            </div>
            {(tabData.map || []).length === 0 && <p className="text-muted text-sm text-center mt-4">No geolocated IPs for this case</p>}
          </div>
        )}

        {activeTab === 'timeline' && !tabLoading && (
          <div className="space-y-3">
            {(tabData.timeline || []).length === 0 ? <EmptyState icon={Clock} title="No timeline events" message="No events recorded yet." /> :
              (tabData.timeline || []).map((event, i) => (
                <div key={event._id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: getRiskColor(event.severity) }} />
                    {i < (tabData.timeline || []).length - 1 && <div className="w-0.5 flex-1 bg-border mt-1" />}
                  </div>
                  <div className="bg-card border border-border rounded-xl p-4 flex-1 mb-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-white text-sm font-medium">{event.event}</p>
                      <span className="text-muted text-xs flex-shrink-0">{formatDate(event.timestamp)}</span>
                    </div>
                    {event.details && <p className="text-muted text-xs mt-1">{event.details}</p>}
                    {event.actor && <p className="text-accent text-xs mt-1">By: {event.actor}</p>}
                  </div>
                </div>
              ))
            }
          </div>
        )}

        {activeTab === 'related' && !tabLoading && (
          <div className="space-y-3">
            {(tabData.related || []).length === 0 ? <EmptyState icon={GitBranch} title="No related cases" message="No related investigations found." /> :
              (tabData.related || []).map(rc => (
                <Link key={rc._id} to={`/investigations/${rc._id}`}
                  className="flex items-center justify-between bg-card border border-border rounded-xl p-4 hover:border-accent/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <span className="text-muted font-mono text-xs">{rc.caseId}</span>
                    <span className="text-white">{rc.title}</span>
                    <RiskBadge level={rc.severity} />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold" style={{ color: getRiskColor(rc.severity) }}>{rc.threatScore}</span>
                    <span className="text-muted text-xs capitalize">{rc.status}</span>
                  </div>
                </Link>
              ))
            }
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-white font-semibold mb-3">Analyst Notes</h3>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={12}
              placeholder="Add investigation notes, findings, hypotheses..."
              className="w-full bg-bg border border-border text-white rounded-xl p-4 text-sm placeholder:text-muted focus:outline-none focus:border-accent resize-none font-mono" />
            <div className="flex justify-end mt-3">
              <button onClick={handleSaveNotes} disabled={saving}
                className="px-4 py-2 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent/90 transition-colors disabled:opacity-60">
                {saving ? 'Saving...' : 'Save Notes'}
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
