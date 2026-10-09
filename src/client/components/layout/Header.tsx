import React from 'react';
import { Sun, Moon, Keyboard } from 'lucide-react';
import { User } from '../../types/index.js';

interface HeaderProps {
  currentUser?: User | null;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onOpenShortcuts: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  theme,
  onToggleTheme,
  onOpenShortcuts
}) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <header className="app-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <div>
          <span
            style={{
              fontSize: 'var(--font-size-xs)',
              color: 'var(--text-muted)',
              fontWeight: 500,
              display: 'block',
              letterSpacing: '0.01em'
            }}
          >
            {getGreeting()}{currentUser?.displayName ? `, ${currentUser.displayName}` : ''}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <h1
              style={{
                fontSize: 'var(--font-size-md)',
                lineHeight: 'var(--line-height-tight)',
                fontWeight: 600
              }}
            >
              ReelVault Ledger
            </h1>
            {import.meta.env.DEV && (
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  fontWeight: 600,
                  padding: '1px 6px',
                  borderRadius: 'var(--radius)',
                  backgroundColor: 'var(--color-accent-subtle)',
                  color: 'var(--color-accent)',
                  border: '1px solid var(--border-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}
                title="Running in local development mode"
              >
                Local Dev
              </span>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
        <button
          onClick={onOpenShortcuts}
          className="btn btn-secondary"
          style={{
            fontSize: 'var(--font-size-xs)',
            padding: 'var(--space-1) var(--space-3)'
          }}
          title="Keyboard shortcuts"
        >
          <Keyboard size={14} />
          <span className="hide-mobile">Shortcuts (?)</span>
        </button>

        <button
          onClick={onToggleTheme}
          className="btn-icon"
          aria-label="Toggle color theme"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
};
