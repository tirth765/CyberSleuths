import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter } from 'lucide-react';
import { useCaseStore } from '../stores/caseStore';
import InvestigationCard from '../components/InvestigationCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import PageHeader from '../components/PageHeader';
import toast from 'react-hot-toast';

const STATUSES = ['all', 'open', 'monitoring', 'closed'];
const SEVERITIES = ['all', 'critical', 'high', 'medium', 'low'];

export default function InvestigationList() {
  const { cases, loading, total, fetchCases, createCase } = useCaseStore();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [severity, setSeverity] = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const [newCase, setNewCase] = useState({ title: '', description: '', attackType: '', severity: 'medium' });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchCases({ status, severity, search });
  }, [status, severity]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCases({ status, severity, search });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const c = await createCase(newCase);
      setShowCreate(false);
      setNewCase({ title: '', description: '', attackType: '', severity: 'medium' });
      toast.success(`Case ${c.caseId} created`);
    } catch { toast.error('Failed to create case'); }
    finally { setCreating(false); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6">
      <PageHeader
        badge="SOC Operations"
        title="Investigations"
        subtitle={`${total} total investigations`}
        actions={
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent/90 transition-colors">
            <Plus size={15} />New Case
          </button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-48">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search cases..."
              className="w-full bg-card border border-border text-white rounded-xl pl-9 pr-4 py-2.5 text-sm placeholder:text-muted focus:outline-none focus:border-accent" />
          </div>
          <button type="submit" className="px-4 py-2.5 bg-accent text-white rounded-xl text-sm hover:bg-accent/90 transition-colors">Search</button>
        </form>

        <div className="flex gap-2 flex-wrap">
          {STATUSES.map(s => (
            <button key={s} onClick={() => setStatus(s)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors capitalize ${status === s ? 'bg-accent text-white' : 'bg-card border border-border text-muted hover:text-white'}`}>
              {s}
            </button>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          {SEVERITIES.map(s => (
            <button key={s} onClick={() => setSeverity(s)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors capitalize ${severity === s ? 'bg-accent text-white' : 'bg-card border border-border text-muted hover:text-white'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Cases */}
      {loading ? <LoadingSkeleton rows={6} /> : cases.length === 0 ? (
        <EmptyState icon={Search} title="No investigations found" message="Try adjusting filters or create a new case." />
      ) : (
        <div className="space-y-3">
          {cases.map(c => <InvestigationCard key={c._id} investigation={c} />)}
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-card border border-border rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold text-white mb-4">Create New Case</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              {[
                { key: 'title', label: 'Case Title', type: 'text', placeholder: 'Credential Harvesting Campaign' },
                { key: 'description', label: 'Description', type: 'text', placeholder: 'Brief description of the incident...' },
                { key: 'attackType', label: 'Attack Type', type: 'text', placeholder: 'Phishing, BEC, Malware...' },
              ].map(({ key, label, type, placeholder }) => (
                <div key={key}>
                  <label className="text-xs text-muted uppercase tracking-wider block mb-1">{label}</label>
                  <input type={type} value={newCase[key]} onChange={e => setNewCase(f => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full bg-bg border border-border text-white rounded-xl px-4 py-2.5 text-sm placeholder:text-muted focus:outline-none focus:border-accent" />
                </div>
              ))}
              <div>
                <label className="text-xs text-muted uppercase tracking-wider block mb-1">Severity</label>
                <select value={newCase.severity} onChange={e => setNewCase(f => ({ ...f, severity: e.target.value }))}
                  className="w-full bg-bg border border-border text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent">
                  {['low', 'medium', 'high', 'critical'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreate(false)}
                  className="flex-1 py-2.5 bg-border text-muted rounded-xl text-sm hover:text-white transition-colors">Cancel</button>
                <button type="submit" disabled={creating}
                  className="flex-1 py-2.5 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent/90 transition-colors disabled:opacity-60">
                  {creating ? 'Creating...' : 'Create Case'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
