import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { useAuthStore } from './stores/authStore';
import { connectSocket } from './services/socket';
import { useAlertStore } from './stores/alertStore';

import AppLayout from './layouts/AppLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import InvestigationList from './pages/InvestigationList';
import InvestigationDetail from './pages/InvestigationDetail';
import ThreatGraphPage from './pages/ThreatGraphPage';
import CampaignList from './pages/CampaignList';
import CampaignDetail from './pages/CampaignDetail';
import IOCDashboard from './pages/IOCDashboard';
import IOCDetail from './pages/IOCDetail';
import EmailAnalysis from './pages/EmailAnalysis';
import EmailDetail from './pages/EmailDetail';
import AlertsPage from './pages/AlertsPage';
import ReportsPage from './pages/ReportsPage';
import ReportDetail from './pages/ReportDetail';
import AIAssistant from './pages/AIAssistant';
import SettingsPage from './pages/SettingsPage';
import NotFound from './pages/NotFound';

function ProtectedRoute({ children }) {
  const { isAuthenticated, token } = useAuthStore();
  if (!isAuthenticated && !token) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const { isAuthenticated } = useAuthStore();
  const { fetchAlerts, addAlert } = useAlertStore();

  useEffect(() => {
    if (isAuthenticated) {
      fetchAlerts();
      const socket = connectSocket();
      socket.on('new-alert', (alert) => {
        addAlert(alert);
      });
      return () => {
        socket.off('new-alert');
      };
    }
  }, [isAuthenticated]);

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#10141F', color: '#F5F7FA', border: '1px solid #1E2433', fontSize: '14px' },
          duration: 4000,
        }}
      />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="investigations" element={<InvestigationList />} />
          <Route path="investigations/:id" element={<InvestigationDetail />} />
          <Route path="threat-graph" element={<ThreatGraphPage />} />
          <Route path="campaigns" element={<CampaignList />} />
          <Route path="campaigns/:id" element={<CampaignDetail />} />
          <Route path="iocs" element={<IOCDashboard />} />
          <Route path="iocs/:id" element={<IOCDetail />} />
          <Route path="email-analysis" element={<EmailAnalysis />} />
          <Route path="email-analysis/:id" element={<EmailDetail />} />
          <Route path="alerts" element={<AlertsPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="reports/:id" element={<ReportDetail />} />
          <Route path="ai-assistant" element={<AIAssistant />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
