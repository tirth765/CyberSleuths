import { AlertTriangle, CheckCircle, Bell, Info } from 'lucide-react';
import { getRiskBg, timeAgo } from '../utils/riskUtils';
import { useAlertStore } from '../stores/alertStore';

const icons = { critical: AlertTriangle, high: AlertTriangle, medium: Bell, low: Info, info: Info };

export default function AlertCard({ alert, onInvestigate }) {
  const { acknowledge } = useAlertStore();
  const Icon = icons[alert.severity] || Bell;

  return (
    <div className={`bg-card border rounded-xl p-4 flex gap-4 transition-all ${
      alert.acknowledged ? 'border-border opacity-60' : 'border-border hover:border-accent'
    }`}>
      <div className={`p-2 rounded-lg mt-1 flex-shrink-0 ${getRiskBg(alert.severity)}`}>
        <Icon size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="flex items-center gap-2">
            <span className={`text-xs uppercase tracking-widest font-bold ${
              alert.severity === 'critical' ? 'text-red-400' :
              alert.severity === 'high' ? 'text-orange-400' :
              alert.severity === 'medium' ? 'text-amber-400' : 'text-cyan-400'
            }`}>{alert.severity}</span>
            {!alert.acknowledged && (
              <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
            )}
          </div>
          <span className="text-xs text-muted flex-shrink-0">{timeAgo(alert.createdAt)}</span>
        </div>
        <p className="text-white text-sm font-medium mb-1">{alert.message}</p>
        {alert.threatScore != null && (
          <p className="text-xs text-muted">Threat Score: <span className="text-white font-medium">{alert.threatScore}/100</span></p>
        )}
        {!alert.acknowledged && (
          <div className="flex gap-2 mt-3">
            {onInvestigate && (
              <button
                onClick={() => onInvestigate(alert)}
                className="text-xs px-3 py-1.5 bg-accent/20 text-accent rounded-lg hover:bg-accent/30 transition-colors"
              >
                Investigate
              </button>
            )}
            <button
              onClick={() => acknowledge(alert._id)}
              className="text-xs px-3 py-1.5 bg-border text-muted rounded-lg hover:bg-border/80 transition-colors"
            >
              Acknowledge
            </button>
          </div>
        )}
        {alert.acknowledged && (
          <p className="text-xs text-green-400 mt-2 flex items-center gap-1">
            <CheckCircle size={12} /> Acknowledged
          </p>
        )}
      </div>
    </div>
  );
}
