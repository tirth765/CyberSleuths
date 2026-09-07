import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center text-center p-4">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="max-w-md">
        <div className="flex justify-center mb-6">
          <div className="p-5 bg-red-500/10 border border-red-500/20 rounded-3xl">
            <Shield size={48} className="text-red-400" />
          </div>
        </div>
        <h1 className="text-7xl font-black text-red-400 font-mono mb-2">404</h1>
        <h2 className="text-2xl font-bold text-white mb-3">TARGET NOT FOUND</h2>
        <p className="text-muted text-sm mb-8">
          The intelligence record you're looking for doesn't exist or has been archived.<br />
          Check your case ID or return to the SOC dashboard.
        </p>
        <div className="font-mono text-xs text-muted bg-card border border-border rounded-xl p-4 text-left mb-6">
          <p className="text-red-400">ERROR: 0x404 — RESOURCE_NOT_FOUND</p>
          <p className="text-muted mt-1">TRACE: Router resolved null</p>
          <p className="text-muted">PATH: {window.location.pathname}</p>
          <p className="text-green-400 mt-1">STATUS: System nominal</p>
        </div>
        <Link to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-xl font-semibold hover:bg-accent/90 transition-colors">
          <Home size={16} />Return to Dashboard
        </Link>
      </motion.div>
    </div>
  );
}
