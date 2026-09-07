import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import RiskBadge from './RiskBadge';
import ThreatScoreRing from './ThreatScoreRing';
import { timeAgo, getStatusBg } from '../utils/riskUtils';
import { Fingerprint, Clock, User } from 'lucide-react';

export default function InvestigationCard({ investigation }) {
  return (
    <motion.div
      whileHover={{ scale: 1.005, borderColor: '#6366F1' }}
      className="bg-card border border-border rounded-xl p-5 hover:shadow-xl transition-all"
    >
      <Link to={`/investigations/${investigation._id}`} className="block">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-xs text-muted font-mono bg-border px-2 py-0.5 rounded">{investigation.caseId}</span>
              <RiskBadge level={investigation.severity} />
              <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusBg(investigation.status)}`}>
                {investigation.status}
              </span>
            </div>
            <h3 className="text-white font-semibold text-base mb-1 truncate">{investigation.title}</h3>
            <p className="text-muted text-sm mb-3 line-clamp-2">{investigation.description}</p>
            <div className="flex items-center gap-4 text-xs text-muted flex-wrap">
              <span className="flex items-center gap-1">
                <Fingerprint size={11} />
                {investigation.iocCount || 0} IOCs
              </span>
              <span className="flex items-center gap-1">
                <Clock size={11} />
                {timeAgo(investigation.updatedAt)}
              </span>
              {investigation.analyst?.name && (
                <span className="flex items-center gap-1">
                  <User size={11} />
                  {investigation.analyst.name}
                </span>
              )}
              {investigation.attackType && (
                <span className="text-muted font-mono">{investigation.attackType}</span>
              )}
            </div>
          </div>
          <ThreatScoreRing score={investigation.threatScore || 0} size={76} />
        </div>
      </Link>
    </motion.div>
  );
}
