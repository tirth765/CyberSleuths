import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Radar, AlertTriangle, Activity } from 'lucide-react';
import api from '../services/api';
import RiskBadge from '../components/RiskBadge';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import PageHeader from '../components/PageHeader';
import { timeAgo } from '../utils/riskUtils';

export default function CampaignList() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get('/campaigns', { params: { status: filter } });
        setCampaigns(res.data.data || []);
      } catch { setCampaigns([]); }
      finally { setLoading(false); }
    };
    load();
  }, [filter]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6">
      <PageHeader badge="Threat Intelligence" title="Campaigns" subtitle={`${campaigns.length} tracked campaigns`} />

      <div className="flex gap-2 mb-6">
        {['all', 'active', 'monitoring', 'archived'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-2 rounded-lg text-xs font-medium capitalize transition-colors ${filter === s ? 'bg-accent text-white' : 'bg-card border border-border text-muted hover:text-white'}`}>
            {s}
          </button>
        ))}
      </div>

      {loading ? <LoadingSkeleton rows={5} /> : campaigns.length === 0 ?
        <EmptyState icon={Radar} title="No campaigns" message="No threat campaigns found." /> :
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {campaigns.map(camp => (
            <motion.div key={camp._id} whileHover={{ scale: 1.01 }}
              className="bg-card border border-border rounded-xl p-5 hover:border-accent/30 transition-colors">
              <Link to={`/campaigns/${camp._id}`} className="block">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg font-bold text-white font-mono">{camp.name}</span>
                      <RiskBadge level={camp.severity} />
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${
                      camp.status === 'active' ? 'border-red-500/30 text-red-400 bg-red-500/10' :
                      camp.status === 'monitoring' ? 'border-amber-500/30 text-amber-400 bg-amber-500/10' :
                      'border-gray-500/30 text-gray-400 bg-gray-500/10'
                    }`}>{camp.status}</span>
                  </div>
                  <div className="p-2.5 bg-warning/10 rounded-xl">
                    <Radar size={20} className="text-warning" />
                  </div>
                </div>
                <p className="text-muted text-sm mb-4 line-clamp-2">{camp.description}</p>
                <div className="grid grid-cols-3 gap-3 text-center">
                  {[
                    ['Cases', camp.cases?.length || 0],
                    ['Domains', camp.domainCount || 0],
                    ['IPs', camp.ipCount || 0],
                  ].map(([label, val]) => (
                    <div key={label} className="bg-bg rounded-lg p-2">
                      <p className="text-xl font-bold text-white">{val}</p>
                      <p className="text-muted text-xs">{label}</p>
                    </div>
                  ))}
                </div>
                {camp.threatActors?.length > 0 && (
                  <div className="mt-3 flex gap-2 flex-wrap">
                    {camp.threatActors.map(ta => (
                      <span key={ta} className="text-xs px-2 py-0.5 bg-accent/10 text-accent border border-accent/20 rounded-full">{ta}</span>
                    ))}
                  </div>
                )}
                <p className="text-muted text-xs mt-3">Last seen: {timeAgo(camp.lastSeen)}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      }
    </motion.div>
  );
}
