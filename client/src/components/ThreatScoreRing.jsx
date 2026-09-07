import { getRiskColor, getSeverityLabel } from '../utils/riskUtils';

export default function ThreatScoreRing({ score = 0, size = 120 }) {
  const level = getSeverityLabel(score);
  const color = getRiskColor(level);
  const r = 45;
  const circumference = 2 * Math.PI * r;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke="#1E2433" strokeWidth="8"
        />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease', filter: `drop-shadow(0 0 6px ${color})` }}
        />
      </svg>
      <div className="absolute text-center">
        <div className="font-bold leading-none" style={{ color, fontSize: size * 0.2 }}>{score}</div>
        <div className="text-muted uppercase tracking-wider" style={{ fontSize: size * 0.09 }}>{level}</div>
      </div>
    </div>
  );
}
