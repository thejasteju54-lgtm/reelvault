import React from 'react';
import { Sparkles, Sun, Moon, Keyboard } from 'lucide-react';
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            {getGreeting()}{currentUser?.displayName ? `, ${currentUser.displayName}` : ''}
          </span>
          <h1 style={{ fontSize: '1.25rem', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Your Reel Vault
          </h1>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <button
          onClick={onOpenShortcuts}
          className="btn btn-secondary"
          style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem', display: 'flex', gap: '0.4rem' }}
          title="Keyboard shortcuts"
        >
          <Keyboard size={14} />
          <span className="hide-mobile">Shortcuts</span>
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
