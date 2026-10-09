import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
  actionIcon?: LucideIcon;
}

export function EmptyState({
  icon: Icon,
  title,
  subtitle,
  actionLabel,
  onAction,
  actionIcon: ActionIcon
}: EmptyStateProps) {
  return (
    <div className="empty-state animate-fade-in">
      <div className="empty-state-icon">
        <Icon size={32} strokeWidth={1.5} />
      </div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-subtitle">{subtitle}</p>
      
      {actionLabel && onAction && (
        <button className="empty-state-action" onClick={onAction}>
          {ActionIcon && <ActionIcon size={16} />}
          {actionLabel}
        </button>
      )}
    </div>
  );
}
