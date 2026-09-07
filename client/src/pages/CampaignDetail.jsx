import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Radar } from 'lucide-react';
import api from '../services/api';
import RiskBadge from '../components/RiskBadge';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { timeAgo } from '../utils/riskUtils';

export default function CampaignDetail() {
  const { id } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/campaigns/${id}`)
      .then(res => setCampaign(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-6"><LoadingSkeleton rows={8} /></div>;
  if (!campaign) return <div className="p-6 text-muted">Campaign not found.</div>;
  const c = campaign;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/campaigns" className="p-2 hover:bg-border rounded-lg transition-colors">
          <ArrowLeft size={18} className="text-muted" />
        </Link>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold text-white font-mono">{c.name}</h1>
            <RiskBadge level={c.severity} size="lg" />
            <span className={`text-xs px-3 py-1 rounded-full border ${
              c.status === 'active' ? 'border-red-500/30 text-red-400 bg-red-500/10' : 'border-amber-500/30 text-amber-400 bg-amber-500/10'
            }`}>{c.status}</span>
          </div>
          <p className="text-muted text-sm">{c.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          ['Cases', c.cases?.length || 0, '#6366F1'],
          ['Domains', c.domainCount || 0, '#EF4444'],
          ['IP Addresses', c.ipCount || 0, '#F59E0B'],
          ['Emails', c.emailCount || 0, '#22D3EE'],
        ].map(([l, v, color]) => (
          <div key={l} className="bg-card border border-border rounded-xl p-4 text-center">
            <p className="text-3xl font-bold" style={{ color }}>{v}</p>
            <p className="text-muted text-xs mt-1">{l}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="text-white font-semibold mb-3">Threat Actors</h2>
          <div className="flex flex-wrap gap-2">
            {(c.threatActors || []).map(ta => (
              <span key={ta} className="px-3 py-1.5 bg-accent/10 text-accent border border-accent/20 rounded-full text-sm">{ta}</span>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div><p className="text-muted text-xs">Countries</p><p className="text-white">{(c.countries || []).join(', ') || 'Unknown'}</p></div>
            <div><p className="text-muted text-xs">Last Activity</p><p className="text-white">{timeAgo(c.lastSeen)}</p></div>
            <div><p className="text-muted text-xs">First Seen</p><p className="text-white">{timeAgo(c.firstSeen)}</p></div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="text-white font-semibold mb-3">Related Cases</h2>
          <div className="space-y-2">
            {(c.cases || []).slice(0, 6).map(cas => (
              <Link key={cas._id} to={`/investigations/${cas._id}`}
                className="flex items-center justify-between p-3 bg-bg rounded-xl hover:bg-border transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-muted font-mono text-xs">{cas.caseId}</span>
                  <span className="text-white text-sm truncate max-w-40">{cas.title}</span>
                </div>
                <RiskBadge level={cas.severity} />
              </Link>
            ))}
            {(!c.cases || c.cases.length === 0) && <p className="text-muted text-sm">No linked cases</p>}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
