import { getRiskColor } from '../utils/riskUtils';

export default function PulseDot({ level = 'medium', size = 4 }) {
  return (
    <span className="relative inline-flex">
      <span
        className={`animate-ping absolute inline-flex h-${size} w-${size} rounded-full opacity-75`}
        style={{ backgroundColor: getRiskColor(level) }}
      />
      <span
        className={`relative inline-flex rounded-full h-${size} w-${size}`}
        style={{ backgroundColor: getRiskColor(level) }}
      />
    </span>
  );
}
