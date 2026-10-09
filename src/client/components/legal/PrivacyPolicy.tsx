import React, { useEffect } from 'react';
import { ArrowLeft, Shield, Lock, Database, Trash2, Mail } from 'lucide-react';
import { analytics } from '../../services/analytics.js';

interface PrivacyPolicyProps {
  onBack: () => void;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
  useEffect(() => {
    document.title = 'Privacy Policy: ReelVault Data Protection';
    analytics.pageView('/privacy');
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
          Privacy Policy
        </h1>
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
          Transparent overview of how ReelVault processes, stores, and protects your account data and saved video reference notes.
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
        <strong style={{ color: 'var(--color-primary)' }}>Legal Draft Notice:</strong> This privacy policy accurately reflects the technical data architecture and privacy measures of ReelVault. It is provided as an operating draft and should be formally reviewed by a qualified legal professional before commercial distribution.
      </div>

      {/* Section 1: Data We Collect */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <h2 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <Database size={16} color="var(--color-primary)" />
          <span>1. Information We Collect and Process</span>
        </h2>
        <p style={{ fontSize: 'var(--font-size-sm)' }}>
          ReelVault collects only the minimum data necessary to operate a personal bookmarking ledger:
        </p>
        <ul style={{ paddingLeft: 'var(--space-4)', fontSize: 'var(--font-size-sm)', display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
          <li>
            <strong>Account Credentials:</strong> Your email address and a cryptographically salted password hash (derived using Node.js scrypt with unique salt bytes). Plaintext passwords are never logged or stored.
          </li>
          <li>
            <strong>Curator Content:</strong> The Instagram Reel URLs you bookmark, along with your custom titles, personal research notes, index tags, category groupings, and watch/favorite statuses.
          </li>
          <li>
            <strong>Public Video Metadata:</strong> When you save a link, our server fetches public thumbnail images and creator handles via Instagram public oEmbed endpoints. We do not access or store your private Instagram account credentials.
          </li>
        </ul>
      </section>

      {/* Section 2: Cookies & Local Storage */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <h2 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <Lock size={16} color="var(--color-primary)" />
          <span>2. Cookies and Local Storage Architecture</span>
        </h2>
        <p style={{ fontSize: 'var(--font-size-sm)' }}>
          ReelVault does not employ advertising cookies or commercial tracking beacons. We use browser local storage strictly for:
        </p>
        <ul style={{ paddingLeft: 'var(--space-4)', fontSize: 'var(--font-size-sm)', display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
          <li>
            <code>reelvault_token</code>: Your JSON Web Token (JWT) authorizing your secure requests to the ReelVault API.
          </li>
          <li>
            <code>reelvault_theme</code>: Your appearance preference ('dark' or 'light').
          </li>
          <li>
            <code>reelvault_cookie_consent</code>: Your explicit consent choice for anonymized telemetry ('accepted' or 'rejected').
          </li>
        </ul>
        <p style={{ fontSize: 'var(--font-size-sm)' }}>
          If you reject analytics, no performance tracking scripts execute or communicate with external servers.
        </p>
      </section>

      {/* Section 3: Third-Party Services */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <h2 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <Shield size={16} color="var(--color-primary)" />
          <span>3. Third-Party Services</span>
        </h2>
        <p style={{ fontSize: 'var(--font-size-sm)' }}>
          ReelVault interfaces only with:
        </p>
        <ul style={{ paddingLeft: 'var(--space-4)', fontSize: 'var(--font-size-sm)', display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
          <li>
            <strong>Instagram/Meta Platforms:</strong> Public HTTPS requests are issued to verify reel existence and display media thumbnails. Your interactions with embedded videos remain governed by Meta's privacy policies.
          </li>
          <li>
            <strong>Google Fonts:</strong> Static font typefaces (Plus Jakarta Sans and JetBrains Mono) are loaded via Google Fonts CDN with display=swap.
          </li>
        </ul>
      </section>

      {/* Section 4: Data Retention & User Rights */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <h2 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <Trash2 size={16} color="var(--color-primary)" />
          <span>4. Data Retention, Portability, and Deletion</span>
        </h2>
        <p style={{ fontSize: 'var(--font-size-sm)' }}>
          You retain complete ownership of your bookmarked data. You may export your entire catalog at any time as structured JSON or CSV spreadsheets using the in-app Export function.
        </p>
        <p style={{ fontSize: 'var(--font-size-sm)' }}>
          When you delete a bookmark, it is immediately and permanently removed from our SQLite database. To request total account deletion, email our privacy desk.
        </p>
      </section>

      {/* Section 5: Contact */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--border-subtle)' }}>
        <h2 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <Mail size={16} color="var(--color-primary)" />
          <span>5. Contact Our Privacy Desk</span>
        </h2>
        <p style={{ fontSize: 'var(--font-size-sm)' }}>
          If you have questions about this policy or your personal data, contact us at: <code>privacy@reelvault.app</code>.
        </p>
      </section>
    </article>
  );
};
