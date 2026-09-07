import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { AlertTriangle, Shield, Fingerprint, Radar, Search, Bell, TrendingUp, Activity, Globe } from 'lucide-react';
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps';
import { useAuthStore } from '../stores/authStore';
import { useAlertStore } from '../stores/alertStore';
import StatCard from '../components/StatCard';
import RiskBadge from '../components/RiskBadge';
import ThreatScoreRing from '../components/ThreatScoreRing';
import LoadingSkeleton from '../components/LoadingSkeleton';
import api from '../services/api';
import { timeAgo, getRiskColor } from '../utils/riskUtils';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

const DEMO_MARKERS = [
  { ip: '185.10.20.4',    lat: 55.7558,  lon: 37.6173,  country: 'Russia',        riskLevel: 'critical' },
  { ip: '45.142.212.100', lat: 52.3702,  lon: 4.8952,   country: 'Netherlands',   riskLevel: 'high' },
  { ip: '194.165.16.78',  lat: 35.6892,  lon: 51.3890,  country: 'Iran',          riskLevel: 'critical' },
  { ip: '193.106.191.25', lat: 39.9042,  lon: 116.4074, country: 'China',         riskLevel: 'critical' },
  { ip: '213.109.202.26', lat: 50.4501,  lon: 30.5234,  country: 'Ukraine',       riskLevel: 'high' },
  { ip: '46.17.43.10',    lat: 50.1109,  lon: 8.6821,   country: 'Germany',       riskLevel: 'medium' },
  { ip: '5.188.206.14',   lat: 59.9311,  lon: 30.3609,  country: 'Russia',        riskLevel: 'critical' },
];

export default function Dashboard() {
  const { user } = useAuthStore();
  const { alerts, unacknowledged } = useAlertStore();
  const [stats, setStats] = useState(null);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  useEffect(() => {
    const load = async () => {
      try {
        const [casesRes, iocsRes] = await Promise.all([
          api.get('/cases', { params: { limit: 5 } }),
          api.get('/iocs', { params: { limit: 1 } })
        ]);
        setCases(casesRes.data.data || []);
        setStats({
          cases: casesRes.data.total || 0,
          criticalCases: (casesRes.data.data || []).filter(c => c.severity === 'critical').length,
          iocs: iocsRes.data.stats?.total || 0,
          campaigns: 5
        });
      } catch {
        setCases([]);
        setStats({ cases: 10, criticalCases: 4, iocs: 36, campaigns: 5 });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const topCase = cases.find(c => c.severity === 'critical') || cases[0];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-muted text-sm font-mono">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <h1 className="text-2xl font-bold text-white">{greeting}, {user?.name?.split(' ')[0] || 'Analyst'} 👋</h1>
          <p className="text-muted text-sm mt-1">Your SOC command center — {unacknowledged} unacknowledged alert{unacknowledged !== 1 ? 's' : ''}</p>
        </div>
        <Link to="/email-analysis" className="flex items-center gap-2 px-4 py-2.5 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent/90 transition-colors">
          <Search size={15} />Upload Email
        </Link>
      </div>

      {/* Critical Alert Banner */}
      {topCase && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="border border-red-500/40 bg-red-500/10 rounded-xl p-4 pulse-border flex items-center gap-4"
        >
          <div className="p-2.5 bg-red-500/20 rounded-xl flex-shrink-0">
            <AlertTriangle size={20} className="text-red-400 animate-pulse" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-red-400 uppercase tracking-widest">⚠️ Active Critical Threat</span>
              <span className="text-xs text-muted font-mono">{topCase.caseId}</span>
            </div>
            <p className="text-white font-semibold text-sm truncate">{topCase.title}</p>
            <p className="text-muted text-xs mt-0.5">{topCase.iocCount} IOCs detected · Threat Score: {topCase.threatScore}/100</p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <ThreatScoreRing score={topCase.threatScore} size={64} />
            <Link to={`/investigations/${topCase._id}`}
              className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded-lg transition-colors">
              Investigate →
            </Link>
          </div>
        </motion.div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Search}      label="Active Cases"        value={stats?.cases ?? '—'}         color="#6366F1" change="+2 this week" changeType="up" />
        <StatCard icon={AlertTriangle} label="Critical Threats"  value={stats?.criticalCases ?? '—'} color="#EF4444" change="Requires attention" changeType="up" />
        <StatCard icon={Fingerprint} label="IOCs Detected"       value={stats?.iocs ?? '—'}          color="#22D3EE" change="Across all cases" changeType="neutral" />
        <StatCard icon={Radar}       label="Campaigns Tracked"   value={stats?.campaigns ?? '—'}     color="#F59E0B" change="3 active" changeType="neutral" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* World Map */}
        <div className="xl:col-span-2 bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Globe size={16} className="text-info" />
              <h2 className="text-white font-semibold">Global Threat Infrastructure</h2>
            </div>
            <span className="text-xs text-muted">{DEMO_MARKERS.length} active nodes</span>
          </div>
          <div className="rounded-xl overflow-hidden bg-bg border border-border" style={{ height: 300 }}>
            <ComposableMap projectionConfig={{ scale: 140 }} style={{ width: '100%', height: '100%' }}>
              <ZoomableGroup>
                <Geographies geography={GEO_URL}>
                  {({ geographies }) =>
                    geographies.map(geo => (
                      <Geography
                        key={geo.rsmKey} geography={geo}
                        fill="#1E2433" stroke="#0A0E1A" strokeWidth={0.5}
                        style={{ hover: { fill: '#252B3D' }, pressed: { fill: '#1E2433' } }}
                      />
                    ))
                  }
                </Geographies>
                {DEMO_MARKERS.map((m, i) => (
                  <Marker key={i} coordinates={[m.lon, m.lat]}>
                    <circle
                      r={m.riskLevel === 'critical' ? 6 : m.riskLevel === 'high' ? 5 : 4}
                      fill={getRiskColor(m.riskLevel)}
                      fillOpacity={0.85}
                      stroke={getRiskColor(m.riskLevel)}
                      strokeWidth={2}
                      strokeOpacity={0.3}
                    />
                    <title>{m.ip} — {m.country} [{m.riskLevel}]</title>
                  </Marker>
                ))}
              </ZoomableGroup>
            </ComposableMap>
          </div>
          <div className="flex gap-4 mt-3">
            {['critical', 'high', 'medium'].map(l => (
              <div key={l} className="flex items-center gap-1.5 text-xs text-muted">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getRiskColor(l) }} />
                {l.charAt(0).toUpperCase() + l.slice(1)}
              </div>
            ))}
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bell size={16} className="text-warning" />
              <h2 className="text-white font-semibold">Recent Alerts</h2>
            </div>
            <Link to="/alerts" className="text-xs text-accent hover:underline">View all →</Link>
          </div>
          <div className="space-y-2">
            {alerts.slice(0, 6).map(alert => (
              <div key={alert._id} className={`p-3 rounded-lg border flex items-start gap-3 ${
                alert.acknowledged ? 'border-border opacity-50' : 'border-border hover:border-accent/30'
              } transition-colors`}>
                <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                  alert.severity === 'critical' ? 'bg-red-400 animate-pulse' :
                  alert.severity === 'high' ? 'bg-orange-400' :
                  alert.severity === 'medium' ? 'bg-amber-400' : 'bg-cyan-400'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-medium line-clamp-2">{alert.message}</p>
                  <p className="text-muted text-xs mt-0.5">{timeAgo(alert.createdAt)}</p>
                </div>
              </div>
            ))}
            {alerts.length === 0 && (
              <p className="text-muted text-sm text-center py-8">No alerts yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Investigations */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-accent" />
            <h2 className="text-white font-semibold">Recent Investigations</h2>
          </div>
          <Link to="/investigations" className="text-xs text-accent hover:underline">View all →</Link>
        </div>
        {loading ? <LoadingSkeleton rows={4} /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted text-xs uppercase tracking-wider border-b border-border">
                  <th className="text-left py-2 pr-4">Case ID</th>
                  <th className="text-left py-2 pr-4">Title</th>
                  <th className="text-left py-2 pr-4">Severity</th>
                  <th className="text-left py-2 pr-4">Score</th>
                  <th className="text-left py-2 pr-4">Status</th>
                  <th className="text-left py-2">Updated</th>
                </tr>
              </thead>
              <tbody>
                {cases.map(c => (
                  <tr key={c._id} className="border-b border-border/50 hover:bg-border/20 transition-colors">
                    <td className="py-3 pr-4">
                      <Link to={`/investigations/${c._id}`} className="text-accent font-mono text-xs hover:underline">{c.caseId}</Link>
                    </td>
                    <td className="py-3 pr-4">
                      <Link to={`/investigations/${c._id}`} className="text-white hover:text-accent transition-colors truncate block max-w-xs">{c.title}</Link>
                    </td>
                    <td className="py-3 pr-4"><RiskBadge level={c.severity} /></td>
                    <td className="py-3 pr-4">
                      <span className="font-mono font-bold" style={{ color: getRiskColor(c.severity) }}>{c.threatScore}</span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${
                        c.status === 'open' ? 'border-red-500/30 text-red-400 bg-red-500/10' :
                        c.status === 'monitoring' ? 'border-amber-500/30 text-amber-400 bg-amber-500/10' :
                        'border-green-500/30 text-green-400 bg-green-500/10'
                      }`}>{c.status}</span>
                    </td>
                    <td className="py-3 text-muted text-xs">{timeAgo(c.updatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
}
