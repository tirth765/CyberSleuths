import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Fingerprint, Search } from 'lucide-react';
import api from '../services/api';
import IOCBadge from '../components/IOCBadge';
import RiskBadge from '../components/RiskBadge';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import PageHeader from '../components/PageHeader';
import { getRiskColor, timeAgo } from '../utils/riskUtils';

const TYPES = ['all', 'domain', 'ip', 'url', 'hash', 'asn', 'email'];
const RISKS = ['all', 'critical', 'high', 'medium', 'low'];

export default function IOCDashboard() {
  const [iocs, setIOCs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState('all');
  const [risk, setRisk] = useState('all');
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/iocs', { params: { type, riskLevel: risk, search } });
      setIOCs(res.data.data || []);
      setStats(res.data.stats);
    } catch { setIOCs([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [type, risk]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 space-y-6">
      <PageHeader badge="Threat Intelligence" title="IOC Database" subtitle={`${stats?.total || 0} indicators of compromise`} />

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            ['Critical', stats.critical, '#FF3B30'],
            ['High', stats.high, '#EF4444'],
            ['Medium', stats.medium, '#F59E0B'],
            ['Domains', stats.domains, '#3B82F6'],
            ['IPs', stats.ips, '#A855F7'],
          ].map(([label, val, color]) => (
            <div key={label} className="bg-card border border-border rounded-xl p-4 text-center">
              <p className="text-2xl font-bold" style={{ color }}>{val || 0}</p>
              <p className="text-muted text-xs mt-1">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <form onSubmit={e => { e.preventDefault(); load(); }} className="flex gap-2 flex-1 min-w-48">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search IOCs..."
              className="w-full bg-card border border-border text-white rounded-xl pl-9 pr-4 py-2 text-sm placeholder:text-muted focus:outline-none focus:border-accent" />
          </div>
          <button type="submit" className="px-3 py-2 bg-accent text-white rounded-xl text-sm">Search</button>
        </form>
        <div className="flex gap-1 flex-wrap">
          {TYPES.map(t => (
            <button key={t} onClick={() => setType(t)}
              className={`px-2.5 py-1.5 rounded-lg text-xs capitalize transition-colors ${type === t ? 'bg-accent text-white' : 'bg-card border border-border text-muted hover:text-white'}`}>
              {t}
            </button>
          ))}
        </div>
        <div className="flex gap-1 flex-wrap">
          {RISKS.map(r => (
            <button key={r} onClick={() => setRisk(r)}
              className={`px-2.5 py-1.5 rounded-lg text-xs capitalize transition-colors ${risk === r ? 'bg-accent text-white' : 'bg-card border border-border text-muted hover:text-white'}`}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? <LoadingSkeleton rows={8} /> : iocs.length === 0 ?
        <EmptyState icon={Fingerprint} title="No IOCs found" message="Try adjusting filters." /> :
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-border">
              <tr className="text-muted text-xs uppercase tracking-wider">
                <th className="text-left px-4 py-3">Type</th>
                <th className="text-left px-4 py-3">Value</th>
                <th className="text-left px-4 py-3">Risk</th>
                <th className="text-left px-4 py-3">Score</th>
                <th className="text-left px-4 py-3 hidden md:table-cell">Country</th>
                <th className="text-left px-4 py-3 hidden lg:table-cell">Case</th>
                <th className="text-left px-4 py-3 hidden lg:table-cell">Seen</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {iocs.map(ioc => (
                <tr key={ioc._id} className="border-b border-border/50 hover:bg-border/20 transition-colors">
                  <td className="px-4 py-3"><IOCBadge type={ioc.type} /></td>
                  <td className="px-4 py-3 max-w-xs">
                    <code className="text-white text-xs font-mono truncate block">{ioc.value}</code>
                  </td>
                  <td className="px-4 py-3"><RiskBadge level={ioc.riskLevel} /></td>
                  <td className="px-4 py-3">
                    <span className="font-bold font-mono" style={{ color: getRiskColor(ioc.riskLevel) }}>{ioc.reputationScore}</span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-muted text-xs">{ioc.geo?.country || '—'}</td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    {ioc.case ? (
                      <Link to={`/investigations/${ioc.case._id}`} className="text-accent text-xs hover:underline font-mono">{ioc.case.caseId}</Link>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-muted text-xs">{timeAgo(ioc.firstSeen)}</td>
                  <td className="px-4 py-3">
                    <Link to={`/iocs/${ioc._id}`} className="text-accent text-xs hover:underline">View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      }
    </motion.div>
  );
}
