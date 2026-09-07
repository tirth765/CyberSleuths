import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, CheckCheck } from 'lucide-react';
import { useAlertStore } from '../stores/alertStore';
import PageHeader from '../components/PageHeader';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import toast from 'react-hot-toast';
import { getRiskColor, timeAgo } from '../utils/riskUtils';
import { Link } from 'react-router-dom';

export default function AlertsPage() {
  const { alerts, loading, unacknowledged, fetchAlerts, acknowledge, acknowledgeAll } = useAlertStore();

  useEffect(() => { fetchAlerts(); }, []);

  const handleAckAll = async () => {
    await acknowledgeAll();
    toast.success('All alerts acknowledged');
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 space-y-6">
      <PageHeader
        badge="SOC Operations"
        title="Alerts Center"
        subtitle={`${unacknowledged} unacknowledged`}
        actions={
          unacknowledged > 0 && (
            <button onClick={handleAckAll}
              className="flex items-center gap-2 px-4 py-2.5 bg-border text-muted hover:text-white rounded-xl text-sm transition-colors">
              <CheckCheck size={15} />Acknowledge All
            </button>
          )
        }
      />

      {loading ? <LoadingSkeleton rows={6} /> : alerts.length === 0 ?
        <EmptyState icon={Bell} title="No alerts" message="All clear — no active alerts." /> :
        <div className="space-y-3">
          {alerts.map(alert => (
            <motion.div key={alert._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className={`bg-card border rounded-xl p-4 flex gap-4 transition-all ${alert.acknowledged ? 'border-border opacity-60' : 'border-border hover:border-accent/30'}`}>
              <div className="flex-shrink-0 mt-1">
                <span className={`w-2.5 h-2.5 rounded-full block mt-1 ${
                  !alert.acknowledged && alert.severity === 'critical' ? 'bg-red-400 animate-pulse' :
                  !alert.acknowledged && alert.severity === 'high' ? 'bg-orange-400' :
                  !alert.acknowledged ? 'bg-amber-400' : 'bg-border'
                }`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-bold uppercase tracking-wider ${
                    alert.severity === 'critical' ? 'text-red-400' :
                    alert.severity === 'high' ? 'text-orange-400' :
                    alert.severity === 'medium' ? 'text-amber-400' : 'text-cyan-400'
                  }`}>{alert.severity}</span>
                  {alert.case && (
                    <Link to={`/investigations/${alert.case._id}`} className="text-xs text-muted hover:text-accent font-mono">
                      {alert.case.caseId}
                    </Link>
                  )}
                </div>
                <p className="text-white text-sm">{alert.message}</p>
                {alert.threatScore && (
                  <p className="text-muted text-xs mt-1">
                    Threat Score: <span className="font-bold" style={{ color: getRiskColor(alert.severity) }}>{alert.threatScore}/100</span>
                  </p>
                )}
                <p className="text-muted text-xs mt-1">{timeAgo(alert.createdAt)}</p>
              </div>
              <div className="flex-shrink-0 flex flex-col gap-2">
                {!alert.acknowledged ? (
                  <button onClick={() => acknowledge(alert._id)}
                    className="text-xs px-3 py-1.5 bg-border text-muted hover:text-white rounded-lg transition-colors">
                    Acknowledge
                  </button>
                ) : (
                  <span className="text-xs text-green-400 flex items-center gap-1">
                    <CheckCheck size={12} />Done
                  </span>
                )}
                {alert.case && (
                  <Link to={`/investigations/${alert.case._id}`}
                    className="text-xs px-3 py-1.5 bg-accent/20 text-accent hover:bg-accent/30 rounded-lg transition-colors text-center">
                    Investigate
                  </Link>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      }
    </motion.div>
  );
}
