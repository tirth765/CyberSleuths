import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FileText, Plus, Download } from 'lucide-react';
import api from '../services/api';
import { useCaseStore } from '../stores/caseStore';
import RiskBadge from '../components/RiskBadge';
import PageHeader from '../components/PageHeader';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import toast from 'react-hot-toast';
import { timeAgo } from '../utils/riskUtils';

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedCase, setSelectedCase] = useState('');
  const [generating, setGenerating] = useState(false);
  const { cases, fetchCases } = useCaseStore();

  useEffect(() => {
    api.get('/reports').then(r => setReports(r.data.data || [])).catch(() => {}).finally(() => setLoading(false));
    fetchCases({ limit: 50 });
  }, []);

  const handleGenerate = async () => {
    if (!selectedCase) { toast.error('Select a case'); return; }
    setGenerating(true);
    try {
      const res = await api.post('/reports', { caseId: selectedCase, type: 'full' });
      setReports(prev => [res.data.data, ...prev]);
      setShowCreate(false);
      toast.success('Report generated successfully');
    } catch { toast.error('Failed to generate report'); }
    finally { setGenerating(false); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 space-y-6">
      <PageHeader
        badge="Intelligence Reports"
        title="Reports"
        subtitle={`${reports.length} generated reports`}
        actions={
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent/90 transition-colors">
            <Plus size={15} />Generate Report
          </button>
        }
      />

      {loading ? <LoadingSkeleton rows={4} /> : reports.length === 0 ?
        <EmptyState icon={FileText} title="No reports" message="Generate a threat intelligence report for any investigation." /> :
        <div className="space-y-3">
          {reports.map(report => (
            <motion.div key={report._id} className="bg-card border border-border rounded-xl p-5 hover:border-accent/30 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <FileText size={16} className="text-accent" />
                    <h3 className="text-white font-semibold">{report.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${report.status === 'final' ? 'border-green-500/30 text-green-400 bg-green-500/10' : 'border-amber-500/30 text-amber-400 bg-amber-500/10'}`}>
                      {report.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted">
                    {report.case && <span className="font-mono">{report.case.caseId}</span>}
                    {report.case && <RiskBadge level={report.case.severity} />}
                    {report.generatedBy && <span>By: {report.generatedBy.name}</span>}
                    <span>{timeAgo(report.createdAt)}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link to={`/reports/${report._id}`}
                    className="flex items-center gap-1.5 px-3 py-2 bg-accent text-white rounded-lg text-xs hover:bg-accent/90 transition-colors">
                    <FileText size={12} />View
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      }

      {showCreate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-card border border-border rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold text-white mb-4">Generate Report</h2>
            <p className="text-muted text-sm mb-4">Select a case to generate a comprehensive threat intelligence report.</p>
            <select value={selectedCase} onChange={e => setSelectedCase(e.target.value)}
              className="w-full bg-bg border border-border text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent mb-4">
              <option value="">-- Select Case --</option>
              {cases.map(c => <option key={c._id} value={c._id}>{c.caseId} — {c.title}</option>)}
            </select>
            <div className="flex gap-3">
              <button onClick={() => setShowCreate(false)} className="flex-1 py-2.5 bg-border text-muted rounded-xl text-sm hover:text-white transition-colors">Cancel</button>
              <button onClick={handleGenerate} disabled={generating}
                className="flex-1 py-2.5 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent/90 transition-colors disabled:opacity-60">
                {generating ? 'Generating...' : 'Generate Report'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
