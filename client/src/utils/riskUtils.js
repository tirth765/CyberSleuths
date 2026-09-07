export const getRiskColor = (level) => {
  const map = { critical: '#FF3B30', high: '#EF4444', medium: '#F59E0B', low: '#22C55E', info: '#22D3EE' };
  return map[level?.toLowerCase()] || '#8A93AB';
};

export const getRiskBg = (level) => {
  const map = {
    critical: 'bg-red-500/20 text-red-400 border-red-500/30',
    high:     'bg-red-400/15 text-orange-400 border-orange-400/20',
    medium:   'bg-amber-500/20 text-amber-400 border-amber-500/30',
    low:      'bg-green-500/20 text-green-400 border-green-500/30',
    info:     'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  };
  return map[level?.toLowerCase()] || 'bg-gray-500/20 text-gray-400 border-gray-500/20';
};

export const getSeverityLabel = (score) => {
  if (score >= 90) return 'critical';
  if (score >= 70) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
};

export const getStatusColor = (status) => {
  const map = { open: 'text-red-400', monitoring: 'text-amber-400', closed: 'text-green-400' };
  return map[status] || 'text-gray-400';
};

export const getStatusBg = (status) => {
  const map = {
    open:       'border-red-500/30 text-red-400 bg-red-500/10',
    monitoring: 'border-amber-500/30 text-amber-400 bg-amber-500/10',
    closed:     'border-green-500/30 text-green-400 bg-green-500/10'
  };
  return map[status] || 'border-gray-500/30 text-gray-400 bg-gray-500/10';
};

export const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

export const formatDateShort = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const timeAgo = (date) => {
  if (!date) return 'N/A';
  const diff = Date.now() - new Date(date).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

export const truncate = (str, len = 40) =>
  str && str.length > len ? str.slice(0, len) + '...' : (str || '');
