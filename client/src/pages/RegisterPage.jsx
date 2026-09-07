import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, User, Mail, Lock, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const { register, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) { setError('Passwords do not match'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    try {
      await register(form.name, form.email, form.password);
      toast.success('Account created — welcome to CyberSleuthes');
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      setError(msg);
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center relative overflow-hidden p-4">
      <div className="absolute inset-0 opacity-5"
        style={{ backgroundImage: 'linear-gradient(#6366F1 1px, transparent 1px), linear-gradient(90deg, #6366F1 1px, transparent 1px)', backgroundSize: '50px 50px' }} />

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md z-10">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-accent/20 rounded-2xl glow-indigo">
              <Shield size={36} className="text-accent" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white">Create SOC Account</h1>
          <p className="text-muted text-sm mt-1">Join the threat intelligence team</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-4">
              <AlertTriangle size={14} />{error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { key: 'name', label: 'Full Name', icon: User, type: 'text', placeholder: 'Alex Mercer' },
              { key: 'email', label: 'Email Address', icon: Mail, type: 'email', placeholder: 'analyst@corp.com' },
              { key: 'password', label: 'Password', icon: Lock, type: 'password', placeholder: '••••••••' },
              { key: 'confirm', label: 'Confirm Password', icon: Lock, type: 'password', placeholder: '••••••••' },
            ].map(({ key, label, icon: Icon, type, placeholder }) => (
              <div key={key}>
                <label className="text-xs text-muted uppercase tracking-wider block mb-2">{label}</label>
                <div className="relative">
                  <Icon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    type={type} value={form[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder} required
                    className="w-full bg-bg border border-border text-white rounded-xl pl-10 pr-4 py-3 text-sm placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
              </div>
            ))}

            <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.01 }}
              className="w-full bg-accent hover:bg-accent/90 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
              {loading
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating Account...</>
                : <><Shield size={16} />Create Account</>
              }
            </motion.button>
          </form>

          <p className="text-center text-muted text-sm mt-4">
            Already have access?{' '}
            <Link to="/login" className="text-accent hover:underline">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
