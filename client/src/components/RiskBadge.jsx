import { getRiskBg } from '../utils/riskUtils';

export default function RiskBadge({ level, size = 'sm' }) {
  const sizeClass = size === 'lg' ? 'px-3 py-1 text-sm' : 'px-2 py-0.5 text-xs';
  return (
    <span className={`${getRiskBg(level)} border ${sizeClass} rounded-full font-semibold uppercase tracking-wider inline-flex items-center gap-1`}>
      {(level === 'critical' || level === 'high') && (
        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse flex-shrink-0" />
      )}
      {level || 'unknown'}
    </span>
  );
}
