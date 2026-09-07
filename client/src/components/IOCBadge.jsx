import { Globe, Server, Link, Hash, Network, Mail } from 'lucide-react';

const typeConfig = {
  domain: { icon: Globe,   color: 'text-blue-400',   bg: 'bg-blue-400/10',   border: 'border-blue-400/20' },
  ip:     { icon: Server,  color: 'text-red-400',    bg: 'bg-red-400/10',    border: 'border-red-400/20' },
  url:    { icon: Link,    color: 'text-amber-400',  bg: 'bg-amber-400/10',  border: 'border-amber-400/20' },
  hash:   { icon: Hash,    color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20' },
  asn:    { icon: Network, color: 'text-cyan-400',   bg: 'bg-cyan-400/10',   border: 'border-cyan-400/20' },
  email:  { icon: Mail,    color: 'text-green-400',  bg: 'bg-green-400/10',  border: 'border-green-400/20' },
};

export default function IOCBadge({ type }) {
  const cfg = typeConfig[type] || typeConfig.domain;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
      <Icon size={11} />
      {type?.toUpperCase()}
    </span>
  );
}
