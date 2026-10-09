import React, { useEffect } from 'react';
import { ArrowLeft, BookOpen, AlertTriangle, ShieldCheck, FileCheck, Mail } from 'lucide-react';
import { analytics } from '../../services/analytics.js';

interface TermsOfServiceProps {
  onBack: () => void;
}

export const TermsOfService: React.FC<TermsOfServiceProps> = ({ onBack }) => {
  useEffect(() => {
    document.title = 'Terms of Service: ReelVault Usage Terms';
    analytics.pageView('/terms');
  }, []);

  return (
    <article
      style={{
        maxWidth: '760px',
        margin: '0 auto',
        padding: 'var(--space-6) var(--space-4)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-5)'
      }}
    >
      <div>
        <button
          onClick={onBack}
          className="btn btn-secondary"
          style={{
            fontSize: 'var(--font-size-xs)',
            padding: 'var(--space-1) var(--space-3)',
            marginBottom: 'var(--space-4)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-1)'
          }}
        >
          <ArrowLeft size={14} />
          <span>Return to Vault Ledger</span>
        </button>

        <span
          style={{
            display: 'block',
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--font-size-xs)',
            color: 'var(--text-muted)',
            marginBottom: 'var(--space-1)'
          }}
        >
          REELVAULT COMPLIANCE DOCUMENTATION • LAST UPDATED OCTOBER 2026
        </span>
        <h1
          style={{
            fontSize: 'var(--font-size-xl)',
            fontWeight: 700,
            lineHeight: 'var(--line-height-tight)',
            letterSpacing: '-0.025em',
            marginBottom: 'var(--space-2)'
          }}
        >
          Terms of Service
        </h1>
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
          Terms governing the use of the ReelVault workstation, bookmarking APIs, and knowledge export utilities.
        </p>
      </div>

      {/* Draft Disclaimer Notice */}
      <div
        style={{
          padding: 'var(--space-3) var(--space-4)',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-muted)',
          borderRadius: 'var(--radius)',
          fontSize: 'var(--font-size-xs)',
          color: 'var(--text-secondary)',
          lineHeight: 'var(--line-height-normal)'
        }}
      >
        <strong style={{ color: 'var(--color-primary)' }}>Legal Draft Notice:</strong> These terms of service reflect the intended operational and intellectual property safeguards of ReelVault. They are provided as an operating draft and should be formally reviewed by a qualified legal professional prior to commercial release.
      </div>

      {/* Section 1: Purpose & Eligibility */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <h2 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <BookOpen size={16} color="var(--color-primary)" />
          <span>1. Permitted Use and Personal Bookmarking</span>
        </h2>
        <p style={{ fontSize: 'var(--font-size-sm)' }}>
          ReelVault is designed exclusively as an organizational ledger and personal reference study tool for video creators, researchers, and students. By accessing ReelVault, you agree to catalog links only for lawful research and reference purposes.
        </p>
      </section>

      {/* Section 2: Intellectual Property & Third-Party Content */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <h2 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <ShieldCheck size={16} color="var(--color-primary)" />
          <span>2. Intellectual Property and Instagram Compatibility</span>
        </h2>
        <p style={{ fontSize: 'var(--font-size-sm)' }}>
          ReelVault does not host, duplicate, re-encode, or redistribute proprietary video media files. All rights, title, and ownership in and to Instagram Reels remain with their respective original creators and Meta Platforms, Inc.
        </p>
        <p style={{ fontSize: 'var(--font-size-sm)' }}>
          ReelVault indexes canonical URLs and displays public metadata pursuant to standard web linking conventions and oEmbed standards. Users are solely responsible for ensuring their usage complies with Instagram terms.
        </p>
      </section>

      {/* Section 3: Account Responsibilities */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <h2 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <FileCheck size={16} color="var(--color-primary)" />
          <span>3. User Responsibilities and Acceptable Use</span>
        </h2>
        <ul style={{ paddingLeft: 'var(--space-4)', fontSize: 'var(--font-size-sm)', display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
          <li>You are responsible for maintaining the confidentiality of your account password.</li>
          <li>You must not execute automated scraping bots, vulnerability attacks, or denial-of-service requests against ReelVault endpoints.</li>
          <li>Honeypot fields and rate limits are enforced to protect platform integrity; intentional bypass attempts will result in immediate IP termination.</li>
        </ul>
      </section>

      {/* Section 4: Warranty Disclaimer */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <h2 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <AlertTriangle size={16} color="var(--color-primary)" />
          <span>4. Disclaimer of Warranties and Limitation of Liability</span>
        </h2>
        <p style={{ fontSize: 'var(--font-size-sm)' }}>
          ReelVault is provided on an "AS IS" and "AS AVAILABLE" basis. While we strive for 100% uptime and rigorous data integrity, we do not warrant that Instagram public metadata endpoints will remain continuously reachable or unchanged. Under no circumstances will ReelVault be liable for indirect, incidental, or consequential damages.
        </p>
      </section>

      {/* Section 5: Inquiries */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--border-subtle)' }}>
        <h2 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <Mail size={16} color="var(--color-primary)" />
          <span>5. Inquiries and Notices</span>
        </h2>
        <p style={{ fontSize: 'var(--font-size-sm)' }}>
          For inquiries regarding these terms, contact: <code>legal@reelvault.app</code>.
        </p>
      </section>
    </article>
  );
};
