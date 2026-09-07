import { Shield } from 'lucide-react';

export default function EmptyState({ icon: Icon = Shield, title = 'No data found', message = 'Nothing to display yet.', action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="p-4 rounded-full bg-border mb-4">
        <Icon size={32} className="text-muted" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-muted text-sm max-w-sm">{message}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
