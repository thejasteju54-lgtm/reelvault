import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: 'var(--space-7) var(--space-4)',
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius)',
        border: '1px dashed var(--border-muted)',
        marginTop: 'var(--space-5)'
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 'var(--radius)',
          backgroundColor: 'var(--bg-surface-active)',
          color: 'var(--color-primary)',
          border: '1px solid var(--border-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 'var(--space-3)'
        }}
      >
        <Icon size={22} />
      </div>

      <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, marginBottom: 'var(--space-2)' }}>
        {title}
      </h3>
      <p style={{ maxWidth: '52ch', fontSize: 'var(--font-size-sm)', marginBottom: actionLabel ? 'var(--space-4)' : '0' }}>
        {description}
      </p>

      {actionLabel && onAction && (
        <button onClick={onAction} className="btn btn-primary">
          {actionLabel}
        </button>
      )}
    </div>
  );
};
