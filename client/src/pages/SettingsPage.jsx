import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, User, Bell, Shield, Link as LinkIcon } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';
import api from '../services/api';

const TABS = ['Profile', 'Security', 'Notifications', 'Integrations'];

export default function SettingsPage() {
  const { user, updateProfile } = useAuthStore();
  const [tab, setTab] = useState('Profile');
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);
  const [notifications, setNotifications] = useState(user?.notifications || {
    criticalAlerts: true, emailNotifications: true, realTimeAlerts: true, campaignDetection: true
  });
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });

  const saveProfile = async () => {
    setSaving(true);
    try {
      await updateProfile({ name });
      toast.success('Profile updated');
    } catch { toast.error('Failed to update profile'); }
    finally { setSaving(false); }
  };

  const saveNotifications = async () => {
    setSaving(true);
    try {
      await updateProfile({ notifications });
      toast.success('Notifications updated');
    } catch { toast.error('Failed to update'); }
    finally { setSaving(false); }
  };

  const changePassword = async () => {
    if (passwords.newPass !== passwords.confirm) { toast.error('Passwords do not match'); return; }
    setSaving(true);
    try {
      await api.put('/auth/change-password', { currentPassword: passwords.current, newPassword: passwords.newPass });
      toast.success('Password changed');
      setPasswords({ current: '', newPass: '', confirm: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to change password'); }
    finally { setSaving(false); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Settings size={20} className="text-accent" />
        <h1 className="text-2xl font-bold text-white">Settings</h1>
      </div>

      <div className="border-b border-border mb-6">
        <div className="flex gap-1">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-sm border-b-2 transition-colors ${tab === t ? 'border-accent text-accent font-semibold' : 'border-transparent text-muted hover:text-white'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {tab === 'Profile' && (
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-accent/30 flex items-center justify-center text-accent text-2xl font-bold">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="text-white font-semibold text-lg">{user?.name}</p>
              <p className="text-muted text-sm">{user?.email}</p>
              <span className="text-xs px-2 py-0.5 bg-accent/20 text-accent rounded-full capitalize">{user?.role}</span>
            </div>
          </div>
          <div>
            <label className="text-xs text-muted uppercase tracking-wider block mb-1">Display Name</label>
            <input value={name} onChange={e => setName(e.target.value)}
              className="w-full bg-bg border border-border text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent" />
          </div>
          <div>
            <label className="text-xs text-muted uppercase tracking-wider block mb-1">Email Address</label>
            <input value={user?.email} readOnly
              className="w-full bg-bg border border-border text-muted rounded-xl px-4 py-3 text-sm cursor-not-allowed" />
          </div>
          <button onClick={saveProfile} disabled={saving}
            className="px-6 py-2.5 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent/90 transition-colors disabled:opacity-60">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}

      {tab === 'Security' && (
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <h2 className="text-white font-semibold flex items-center gap-2"><Shield size={16} />Change Password</h2>
          {[
            ['Current Password', 'current'],
            ['New Password', 'newPass'],
            ['Confirm New Password', 'confirm'],
          ].map(([label, key]) => (
            <div key={key}>
              <label className="text-xs text-muted uppercase tracking-wider block mb-1">{label}</label>
              <input type="password" value={passwords[key]} onChange={e => setPasswords(p => ({ ...p, [key]: e.target.value }))}
                className="w-full bg-bg border border-border text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent" />
            </div>
          ))}
          <button onClick={changePassword} disabled={saving}
            className="px-6 py-2.5 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent/90 transition-colors disabled:opacity-60">
            {saving ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      )}

      {tab === 'Notifications' && (
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <h2 className="text-white font-semibold flex items-center gap-2"><Bell size={16} />Alert Preferences</h2>
          {[
            ['criticalAlerts', 'Critical Threat Alerts', 'Get notified immediately for CRITICAL severity threats'],
            ['emailNotifications', 'Email Notifications', 'Receive alerts via email digest'],
            ['realTimeAlerts', 'Real-time Live Alerts', 'Show browser notifications via WebSocket'],
            ['campaignDetection', 'Campaign Detection', 'Alert when new campaign correlation is found'],
          ].map(([key, label, desc]) => (
            <div key={key} className="flex items-center justify-between p-4 bg-bg rounded-xl border border-border">
              <div>
                <p className="text-white text-sm font-medium">{label}</p>
                <p className="text-muted text-xs mt-0.5">{desc}</p>
              </div>
              <button onClick={() => setNotifications(n => ({ ...n, [key]: !n[key] }))}
                className={`w-12 h-6 rounded-full transition-colors relative ${notifications[key] ? 'bg-accent' : 'bg-border'}`}>
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${notifications[key] ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
          ))}
          <button onClick={saveNotifications} disabled={saving}
            className="px-6 py-2.5 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent/90 transition-colors disabled:opacity-60">
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      )}

      {tab === 'Integrations' && (
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <h2 className="text-white font-semibold flex items-center gap-2"><LinkIcon size={16} />API Integrations</h2>
          {[
            ['OpenAI GPT-4', 'AI-powered threat analysis', 'Not configured', 'Configure'],
            ['VirusTotal', 'Malware and IOC scanning', 'Not configured', 'Add Key'],
            ['AbuseIPDB', 'IP reputation lookup', 'Not configured', 'Add Key'],
            ['MaxMind GeoIP', 'IP geolocation database', 'Not configured', 'Configure'],
          ].map(([name, desc, status, action]) => (
            <div key={name} className="flex items-center justify-between p-4 bg-bg rounded-xl border border-border">
              <div>
                <p className="text-white text-sm font-medium">{name}</p>
                <p className="text-muted text-xs mt-0.5">{desc}</p>
                <span className="text-xs text-amber-400">{status}</span>
              </div>
              <button className="px-3 py-1.5 bg-border text-muted hover:text-white rounded-lg text-xs transition-colors">
                {action}
              </button>
            </div>
          ))}
          <p className="text-muted text-xs">API keys are stored securely in your server .env file. The platform works fully in demo mode without any external APIs.</p>
        </div>
      )}
    </motion.div>
  );
}
