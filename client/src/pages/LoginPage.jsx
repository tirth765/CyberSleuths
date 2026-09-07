import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Mail, Lock, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      toast.success('Welcome back, Analyst');
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid credentials';
      setError(msg);
      toast.error(msg);
    }
  };

  const fillDemo = (role) => {
    setEmail(role === 'admin' ? 'admin@cybersleuthes.com' : 'analyst@cybersleuthes.com');
    setPassword('Demo@2026');
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center relative overflow-hidden p-4">
      {/* Grid background */}
      <div className="absolute inset-0 opacity-5"
        style={{ backgroundImage: 'linear-gradient(#6366F1 1px, transparent 1px), linear-gradient(90deg, #6366F1 1px, transparent 1px)', backgroundSize: '50px 50px' }} />

      {/* Glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-accent/20 rounded-2xl glow-indigo">
              <Shield size={36} className="text-accent" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">CyberSleuthes</h1>
          <p className="text-muted text-sm">AI-Powered Threat Intelligence Platform</p>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-2xl p-8">
          <h2 className="text-lg font-semibold text-white mb-6">Sign In to SOC Dashboard</h2>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-4">
              <AlertTriangle size={14} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-muted uppercase tracking-wider block mb-2">Email Address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  placeholder="analyst@cybersleuthes.com"
                  className="w-full bg-bg border border-border text-white rounded-xl pl-10 pr-4 py-3 text-sm placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-muted uppercase tracking-wider block mb-2">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                  placeholder="••••••••"
                  className="w-full bg-bg border border-border text-white rounded-xl pl-10 pr-10 py-3 text-sm placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white transition-colors">
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <motion.button
              type="submit" disabled={loading}
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
              className="w-full bg-accent hover:bg-accent/90 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Authenticating...</>
              ) : (
                <><Shield size={16} />Access Platform</>
              )}
            </motion.button>
          </form>

          {/* Demo accounts */}
          <div className="mt-6 p-4 bg-bg rounded-xl border border-border">
            <p className="text-xs text-muted mb-3 uppercase tracking-wider">Demo Accounts</p>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => fillDemo('admin')} className="text-xs bg-accent/10 hover:bg-accent/20 text-accent border border-accent/20 rounded-lg py-2 transition-colors">
                👤 Admin Access
              </button>
              <button onClick={() => fillDemo('analyst')} className="text-xs bg-border hover:bg-border/80 text-muted rounded-lg py-2 transition-colors">
                🔍 Analyst Access
              </button>
            </div>
            <p className="text-xs text-muted mt-2 text-center">Password: <code className="text-accent">Demo@2026</code></p>
          </div>

          <p className="text-center text-muted text-sm mt-4">
            New analyst?{' '}
            <Link to="/register" className="text-accent hover:underline">Create account</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
