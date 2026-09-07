import { motion } from 'framer-motion';

export default function StatCard({ icon: Icon, label, value, change, changeType = 'neutral', color = '#6366F1', onClick }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className={`bg-card border border-border rounded-xl p-5 flex flex-col gap-3 ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted uppercase tracking-widest font-medium">{label}</span>
        <div className="p-2 rounded-lg" style={{ backgroundColor: color + '20' }}>
          <Icon size={16} style={{ color }} />
        </div>
      </div>
      <div className="text-3xl font-bold text-white tabular-nums">{value ?? '—'}</div>
      {change !== undefined && (
        <div className={`text-xs flex items-center gap-1 ${
          changeType === 'up' ? 'text-red-400' : changeType === 'down' ? 'text-green-400' : 'text-muted'
        }`}>
          {changeType === 'up' ? '↑' : changeType === 'down' ? '↓' : '—'} {change}
        </div>
      )}
    </motion.div>
  );
}
