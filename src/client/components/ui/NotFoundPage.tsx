import React, { useEffect } from 'react';
import { FileQuestion, ArrowLeft, Bookmark, Search } from 'lucide-react';
import { analytics } from '../../services/analytics.js';

interface NotFoundPageProps {
  onGoHome: () => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onGoHome }) => {
  useEffect(() => {
    document.title = 'Page Not Found: ReelVault';
    analytics.pageView('/404');
  }, []);

  return (
    <article
      style={{
        maxWidth: '540px',
        margin: 'var(--space-8) auto',
        padding: 'var(--space-6) var(--space-4)',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--space-4)'
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 'var(--radius)',
          backgroundColor: 'var(--bg-surface-active)',
          color: 'var(--color-primary)',
          border: '1px solid var(--border-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 'var(--space-2)'
        }}
      >
        <FileQuestion size={28} />
      </div>

      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--font-size-xs)',
          color: 'var(--color-primary)',
          letterSpacing: '0.05em',
          fontWeight: 600
        }}
      >
        HTTP STATUS 404 • RECORD UNRESOLVED
      </span>

      <h1
        style={{
          fontSize: 'var(--font-size-lg)',
          fontWeight: 700,
          lineHeight: 'var(--line-height-tight)',
          letterSpacing: '-0.02em'
        }}
      >
        Page Not Located
      </h1>

      <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', maxWidth: '44ch' }}>
        The requested path does not match any ledger entry or catalog route in your ReelVault workstation. It may have been relocated or removed.
      </p>

      <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-3)' }}>
        <button onClick={onGoHome} className="btn btn-primary">
          <ArrowLeft size={16} />
          <span>Return to Dashboard</span>
        </button>
      </div>
    </article>
  );
};
