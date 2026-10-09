import React, { useState, useEffect } from 'react';
import { ShieldCheck, ExternalLink } from 'lucide-react';
import { analytics, ConsentStatus } from '../../services/analytics.js';

interface CookieBannerProps {
  onNavigateToPrivacy: () => void;
}

export const CookieBanner: React.FC<CookieBannerProps> = ({ onNavigateToPrivacy }) => {
  const [status, setStatus] = useState<ConsentStatus>('pending');

  useEffect(() => {
    setStatus(analytics.getConsentStatus());

    const handleConsentChange = (e: Event) => {
      const custom = e as CustomEvent<ConsentStatus>;
      setStatus(custom.detail);
    };

    window.addEventListener('reelvault:consent-changed', handleConsentChange);
    return () => window.removeEventListener('reelvault:consent-changed', handleConsentChange);
  }, []);

  if (status !== 'pending') {
    return null;
  }

  const handleAccept = () => {
    analytics.setConsent('accepted');
    analytics.pageView(window.location.pathname);
  };

  const handleReject = () => {
    analytics.setConsent('rejected');
  };

  return (
    <div
      role="dialog"
      aria-label="Privacy and analytics preferences"
      style={{
        position: 'fixed',
        bottom: 'var(--space-4)',
        left: 'var(--space-4)',
        right: 'var(--space-4)',
        maxWidth: '560px',
        margin: '0 auto',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-muted)',
        borderRadius: 'var(--radius)',
        padding: 'var(--space-4)',
        boxShadow: 'var(--shadow-dropdown)',
        zIndex: 150,
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
        animation: 'toastSlideUp var(--transition-fast)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 'var(--radius)',
            backgroundColor: 'var(--bg-surface-active)',
            border: '1px solid var(--border-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-primary)',
            flexShrink: 0
          }}
        >
          <ShieldCheck size={18} />
        </div>
        <div>
          <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: '2px' }}>
            Privacy and Analytics Notice
          </h4>
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', lineHeight: 'var(--line-height-normal)' }}>
            ReelVault uses essential local storage for authentication. We optionally gather privacy-friendly, cookieless usage analytics to improve catalog search speed. No personal data is sold or shared with advertisers.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
        <button
          onClick={onNavigateToPrivacy}
          className="btn-ghost"
          style={{
            fontSize: 'var(--font-size-xs)',
            padding: 'var(--space-1) var(--space-2)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-1)',
            color: 'var(--text-muted)'
          }}
        >
          <span>Privacy Policy</span>
          <ExternalLink size={11} />
        </button>

        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <button
            onClick={handleReject}
            className="btn btn-secondary"
            style={{ fontSize: 'var(--font-size-xs)', padding: 'var(--space-1) var(--space-3)' }}
          >
            Reject All
          </button>
          <button
            onClick={handleAccept}
            className="btn btn-primary"
            style={{ fontSize: 'var(--font-size-xs)', padding: 'var(--space-1) var(--space-3)' }}
          >
            Accept Analytics
          </button>
        </div>
      </div>
    </div>
  );
};
