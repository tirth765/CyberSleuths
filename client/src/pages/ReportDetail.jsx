import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Printer, Shield } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import api from '../services/api';
import RiskBadge from '../components/RiskBadge';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { formatDate } from '../utils/riskUtils';

export default function ReportDetail() {
  const { id } = useParams();
  const [report, setReport] = useState(null);

  useEffect(() => {
    api.get(`/reports/${id}`).then(r => setReport(r.data.data)).catch(() => {});
  }, [id]);

  if (!report) return <div className="p-6"><LoadingSkeleton rows={10} /></div>;
  const s = report.sections || {};

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 max-w-4xl mx-auto">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6 no-print">
        <Link to="/reports" className="flex items-center gap-2 text-muted hover:text-white transition-colors text-sm">
          <ArrowLeft size={16} />Back to Reports
        </Link>
        <button onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 bg-border text-muted hover:text-white rounded-xl text-sm transition-colors">
          <Printer size={15} />Print / Export PDF
        </button>
      </div>

      {/* Report */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-accent/20 to-danger/10 border-b border-border p-8 print-section">
          <div className="flex items-center gap-3 mb-4">
            <Shield size={32} className="text-accent" />
            <div>
              <p className="text-muted text-xs uppercase tracking-widest">CyberSleuthes Threat Intelligence</p>
              <h1 className="text-2xl font-bold text-white">{report.title}</h1>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            {[
              ['Case ID', report.case?.caseId],
              ['Severity', report.case?.severity],
              ['Threat Score', report.case?.threatScore + '/100'],
              ['Generated', formatDate(report.createdAt)],
            ].map(([k, v]) => (
              <div key={k} className="card-print">
                <p className="text-muted text-xs uppercase">{k}</p>
                {k === 'Severity' ? <RiskBadge level={v} size="lg" /> : <p className="text-white font-semibold">{v}</p>}
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-muted">
            <span>Report Type: {report.type?.replace('_', ' ').toUpperCase()}</span>
            <span>·</span>
            <span>Status: {report.status?.toUpperCase()}</span>
            {report.generatedBy && <><span>·</span><span>Analyst: {report.generatedBy.name}</span></>}
          </div>
        </div>

        {/* Sections */}
        <div className="p-8 space-y-8">
          {[
            { key: 'executiveSummary', title: '01 Executive Summary' },
            { key: 'technicalAnalysis', title: '02 Technical Analysis' },
            { key: 'iocSummary', title: '03 IOC Summary' },
            { key: 'riskAssessment', title: '04 Risk Assessment' },
            { key: 'recommendations', title: '05 Recommendations' },
          ].map(({ key, title }) => s[key] && (
            <div key={key} className="print-section">
              <h2 className="text-lg font-bold text-white mb-4 pb-2 border-b border-border font-mono tracking-wide">{title}</h2>
              <div className="prose-dark">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{s[key]}</ReactMarkdown>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-border p-6 text-center text-muted text-xs print-section">
          <p>CyberSleuthes AI-Powered Threat Intelligence Platform · {formatDate(report.createdAt)}</p>
          <p className="mt-1">CONFIDENTIAL — For authorized personnel only</p>
        </div>
      </div>
    </motion.div>
  );
}
