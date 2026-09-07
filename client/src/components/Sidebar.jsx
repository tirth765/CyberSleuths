import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Search, Network, Radar, Fingerprint,
  Mail, Bell, FileText, Bot, Settings, Shield, LogOut
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useAlertStore } from '../stores/alertStore';

const navItems = [
  { to: '/',               icon: LayoutDashboard, label: 'Dashboard',       exact: true },
  { to: '/investigations', icon: Search,          label: 'Investigations' },
  { to: '/threat-graph',   icon: Network,         label: 'Threat Graph' },
  { to: '/campaigns',      icon: Radar,           label: 'Campaigns' },
  { to: '/iocs',           icon: Fingerprint,     label: 'IOCs' },
  { to: '/email-analysis', icon: Mail,            label: 'Email Analysis' },
  { to: '/alerts',         icon: Bell,            label: 'Alerts',          badge: true },
  { to: '/reports',        icon: FileText,        label: 'Reports' },
  { to: '/ai-assistant',   icon: Bot,             label: 'AI Assistant' },
  { to: '/settings',       icon: Settings,        label: 'Settings' },
];

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const { unacknowledged } = useAlertStore();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside className="w-56 bg-card border-r border-border flex flex-col h-screen flex-shrink-0">
      {/* Logo */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent/20 rounded-xl glow-indigo">
            <Shield size={18} className="text-accent" />
          </div>
          <div>
            <div className="font-bold text-white text-sm leading-tight">CyberSleuthes</div>
            <div className="text-[10px] text-muted tracking-widest uppercase font-mono">Threat Intel</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label, badge, exact }) => (
          <NavLink key={to} to={to} end={exact}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all relative group ${
                isActive
                  ? 'bg-accent/15 text-accent font-semibold'
                  : 'text-muted hover:bg-border hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="active-nav"
                    className="absolute left-0 top-1 bottom-1 w-0.5 bg-accent rounded-full"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon size={15} className="flex-shrink-0" />
                <span className="flex-1 text-sm">{label}</span>
                {badge && unacknowledged > 0 && (
                  <span className="bg-red-500 text-white text-[10px] rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 font-bold animate-pulse">
                    {unacknowledged > 99 ? '99+' : unacknowledged}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-border space-y-1">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="relative">
            <div className="w-7 h-7 rounded-full bg-accent/30 flex items-center justify-center text-accent text-xs font-bold flex-shrink-0">
              {user?.name?.[0]?.toUpperCase() || 'A'}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-success rounded-full border border-card" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white text-xs font-semibold truncate">{user?.name || 'Analyst'}</div>
            <div className="text-muted text-[10px] capitalize">{user?.role || 'analyst'}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 text-muted hover:text-red-400 hover:bg-red-400/10 rounded-lg text-xs transition-colors"
        >
          <LogOut size={13} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
