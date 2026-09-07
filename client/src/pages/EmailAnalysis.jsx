import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Upload, Mail, AlertTriangle, FileText, X } from 'lucide-react';
import api from '../services/api';
import LoadingSkeleton from '../components/LoadingSkeleton';
import RiskBadge from '../components/RiskBadge';
import PageHeader from '../components/PageHeader';
import toast from 'react-hot-toast';
import { timeAgo, getRiskColor } from '../utils/riskUtils';

export default function EmailAnalysis() {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/emails').then(res => setEmails(res.data.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleUpload = async (file) => {
    if (!file || !file.name.endsWith('.eml')) { toast.error('Please upload a .eml file'); return; }
    setUploading(true);
    const fd = new FormData();
    fd.append('email', file);
    try {
      const res = await api.post('/emails/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success(`Email analyzed — Threat Score: ${res.data.data.case.threatScore}/100`);
      navigate(`/investigations/${res.data.data.case._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally { setUploading(false); }
  };

  const onDrop = (e) => {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 space-y-6">
      <PageHeader badge="Email Intelligence" title="Email Analysis" subtitle="Upload suspicious .eml files for AI-powered threat analysis" />

      {/* Upload Zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => fileRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
          dragging ? 'border-accent bg-accent/10' : 'border-border hover:border-accent/50 hover:bg-card'
        }`}
      >
        <input ref={fileRef} type="file" accept=".eml" className="hidden"
          onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0])} />
        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-3 border-accent/30 border-t-accent rounded-full animate-spin" />
            <p className="text-white font-semibold">Analyzing email...</p>
            <p className="text-muted text-sm">Extracting IOCs, scoring threats, geolocating infrastructure...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="p-4 rounded-2xl bg-accent/10">
              <Upload size={32} className={dragging ? 'text-accent' : 'text-muted'} />
            </div>
            <div>
              <p className="text-white font-semibold text-lg">Drop .eml file here to analyze</p>
              <p className="text-muted text-sm mt-1">or click to browse — max 10MB</p>
            </div>
            <div className="flex gap-3 mt-2">
              {['SPF/DKIM/DMARC check', 'IOC extraction', 'Threat scoring', 'Geo-mapping'].map(f => (
                <span key={f} className="text-xs px-2 py-1 bg-accent/10 text-accent border border-accent/20 rounded-full">{f}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Demo notice */}
      <div className="flex items-center gap-3 p-4 bg-warning/10 border border-warning/20 rounded-xl text-sm">
        <AlertTriangle size={16} className="text-warning flex-shrink-0" />
        <p className="text-muted">
          <span className="text-warning font-semibold">Demo mode:</span> Upload any .eml file and the platform will analyze headers, extract IOCs, and create an investigation automatically.
        </p>
      </div>

      {/* Emails list */}
      <div>
        <h2 className="text-white font-semibold mb-3">Analyzed Emails ({emails.length})</h2>
        {loading ? <LoadingSkeleton rows={4} /> : emails.length === 0 ? (
          <div className="text-center py-12 text-muted">No emails analyzed yet. Upload a .eml file to begin.</div>
        ) : (
          <div className="space-y-3">
            {emails.map(email => (
              <div key={email._id} className="bg-card border border-border rounded-xl p-4 flex items-start gap-4 hover:border-accent/30 transition-colors">
                <div className="p-2.5 rounded-xl bg-accent/10 flex-shrink-0">
                  <Mail size={18} className="text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold truncate">{email.subject || 'No Subject'}</p>
                  <p className="text-muted text-xs mt-0.5">From: {email.sender}</p>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {[['SPF', email.spf], ['DKIM', email.dkim], ['DMARC', email.dmarc]].map(([k, v]) => (
                      <span key={k} className={`text-xs px-1.5 py-0.5 rounded border ${v === 'pass' ? 'border-green-500/30 text-green-400 bg-green-500/10' : 'border-red-500/30 text-red-400 bg-red-500/10'}`}>
                        {k}: {v}
                      </span>
                    ))}
                    {email.flaggedPhrases?.length > 0 && (
                      <span className="text-xs px-1.5 py-0.5 rounded border border-amber-500/20 text-amber-400 bg-amber-500/10">
                        {email.flaggedPhrases.length} suspicious phrases
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-2xl font-bold" style={{ color: getRiskColor(email.riskScore >= 90 ? 'critical' : email.riskScore >= 70 ? 'high' : 'medium') }}>
                    {email.riskScore}
                  </p>
                  <p className="text-muted text-xs">Risk Score</p>
                  <p className="text-muted text-xs mt-1">{timeAgo(email.receivedAt)}</p>
                  <Link to={`/email-analysis/${email._id}`} className="text-accent text-xs hover:underline mt-1 block">Details →</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
