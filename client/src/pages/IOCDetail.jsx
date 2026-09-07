import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import api from '../services/api';
import IOCBadge from '../components/IOCBadge';
import RiskBadge from '../components/RiskBadge';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { formatDate, getRiskColor } from '../utils/riskUtils';

export default function IOCDetail() {
  const { id } = useParams();
  const [ioc, setIOC] = useState(null);
  const [related, setRelated] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get(`/iocs/${id}`),
      api.get(`/iocs/${id}/related`)
    ]).then(([r1, r2]) => {
      setIOC(r1.data.data);
      setRelated(r2.data.data || []);
    }).catch(() => {});
  }, [id]);

  if (!ioc) return <div className="p-6"><LoadingSkeleton rows={8} /></div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/iocs" className="p-2 hover:bg-border rounded-lg transition-colors">
          <ArrowLeft size={18} className="text-muted" />
        </Link>
        <div className="flex items-center gap-3 flex-wrap">
          <IOCBadge type={ioc.type} />
          <h1 className="text-xl font-bold text-white font-mono break-all">{ioc.value}</h1>
          <RiskBadge level={ioc.riskLevel} size="lg" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-card border border-border rounded-xl p-5">
            <h2 className="text-white font-semibold mb-4">Reputation Intelligence</h2>
            <div className="flex items-center gap-6 mb-4">
              <div className="text-center">
                <p className="text-5xl font-bold" style={{ color: getRiskColor(ioc.riskLevel) }}>{ioc.reputationScore}</p>
                <p className="text-muted text-sm mt-1">Reputation Score</p>
              </div>
              <div className="flex-1 grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-muted text-xs">Type</p><p className="text-white capitalize">{ioc.type}</p></div>
                <div><p className="text-muted text-xs">Risk Level</p><RiskBadge level={ioc.riskLevel} /></div>
                <div><p className="text-muted text-xs">First Seen</p><p className="text-white">{formatDate(ioc.firstSeen)}</p></div>
                <div><p className="text-muted text-xs">Last Seen</p><p className="text-white">{formatDate(ioc.lastSeen)}</p></div>
              </div>
            </div>
            {ioc.notes && <p className="text-muted text-sm border-t border-border pt-3">{ioc.notes}</p>}
          </div>

          {ioc.geo && ioc.geo.country && (
            <div className="bg-card border border-border rounded-xl p-5">
              <h2 className="text-white font-semibold mb-3">Geographic Intelligence</h2>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  ['Country', ioc.geo.country],
                  ['City', ioc.geo.city || 'Unknown'],
                  ['ISP', ioc.geo.isp || 'Unknown'],
                  ['Organization', ioc.geo.org || 'Unknown'],
                  ['Latitude', ioc.geo.lat],
                  ['Longitude', ioc.geo.lon],
                ].map(([k, v]) => (
                  <div key={k}><p className="text-muted text-xs">{k}</p><p className="text-white">{v || 'N/A'}</p></div>
                ))}
              </div>
            </div>
          )}

          {ioc.whois && ioc.whois.registrar && (
            <div className="bg-card border border-border rounded-xl p-5">
              <h2 className="text-white font-semibold mb-3">WHOIS Data</h2>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-muted text-xs">Registrar</p><p className="text-white">{ioc.whois.registrar}</p></div>
                <div><p className="text-muted text-xs">Registrant</p><p className="text-white">{ioc.whois.registrant || 'Hidden'}</p></div>
                <div><p className="text-muted text-xs">Registered</p><p className="text-white">{formatDate(ioc.whois.registeredDate)}</p></div>
                <div><p className="text-muted text-xs">Expires</p><p className="text-white">{formatDate(ioc.whois.expiryDate)}</p></div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {ioc.case && (
            <div className="bg-card border border-border rounded-xl p-5">
              <h2 className="text-white font-semibold mb-3 text-sm">Associated Case</h2>
              <Link to={`/investigations/${ioc.case._id}`} className="p-3 bg-bg rounded-xl hover:bg-border transition-colors block">
                <p className="text-accent font-mono text-xs">{ioc.case.caseId}</p>
                <p className="text-white text-sm">{ioc.case.title}</p>
                <RiskBadge level={ioc.case.severity} />
              </Link>
            </div>
          )}
          {related.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-5">
              <h2 className="text-white font-semibold mb-3 text-sm">Related IOCs</h2>
              <div className="space-y-2">
                {related.slice(0, 8).map(r => (
                  <Link key={r._id} to={`/iocs/${r._id}`}
                    className="flex items-center gap-2 p-2 hover:bg-border rounded-lg transition-colors">
                    <IOCBadge type={r.type} />
                    <code className="text-white text-xs flex-1 truncate font-mono">{r.value}</code>
                    <RiskBadge level={r.riskLevel} />
                  </Link>
                ))}
              </div>
            </div>
          )}
          {ioc.tags?.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-5">
              <h2 className="text-white font-semibold mb-3 text-sm">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {ioc.tags.map(t => (
                  <span key={t} className="px-2 py-1 bg-border text-muted text-xs rounded-lg">{t}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
