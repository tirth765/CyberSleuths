export default function PageHeader({ title, subtitle, actions, badge }) {
  return (
    <div className="flex items-start justify-between mb-6 gap-4">
      <div>
        {badge && (
          <span className="text-xs uppercase tracking-widest text-muted mb-1 block font-mono">{badge}</span>
        )}
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        {subtitle && <p className="text-muted text-sm mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex gap-2 flex-shrink-0">{actions}</div>}
    </div>
  );
}
