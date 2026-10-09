import React from 'react';
import {
  LayoutDashboard,
  Bookmark,
  Star,
  Archive,
  Hash,
  BarChart2,
  Download,
  Keyboard,
  LogOut,
  Sun,
  Moon,
  Sparkles
} from 'lucide-react';
import { User, VaultStats } from '../../types/index.js';

export type ActiveTab = 'dashboard' | 'saved' | 'favorites' | 'unwatched' | 'archive' | 'tags';

interface SidebarProps {
  currentTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  stats?: VaultStats | null;
  currentUser?: User | null;
  onOpenStats: () => void;
  onExport: () => void;
  onOpenShortcuts: () => void;
  onLogout: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  stats,
  currentUser,
  onOpenStats,
  onExport,
  onOpenShortcuts,
  onLogout,
  theme,
  onToggleTheme
}) => {
  const navItems = [
    { id: 'dashboard' as ActiveTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'saved' as ActiveTab, label: 'Saved Reels', icon: Bookmark, count: stats?.total },
    { id: 'favorites' as ActiveTab, label: 'Favorites', icon: Star, count: stats?.favorites },
    { id: 'archive' as ActiveTab, label: 'Archive', icon: Archive, count: stats?.archived },
    { id: 'tags' as ActiveTab, label: 'Tags', icon: Hash }
  ];

  return (
    <aside className="app-sidebar">
      {/* Brand Logo */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.625rem',
          padding: '0.5rem 0.5rem 1.5rem 0.5rem',
          borderBottom: '1px solid var(--border-subtle)'
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 2px 8px rgba(99, 102, 241, 0.35)'
          }}
        >
          <Sparkles size={18} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
            ReelVault
          </h2>
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '1.25rem', flex: 1 }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.625rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                background: isActive ? 'var(--bg-card-hover)' : 'transparent',
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.875rem',
                transition: 'all var(--transition-fast)'
              }}
            >
              <Icon size={18} color={isActive ? 'var(--color-accent)' : 'currentColor'} />
              <span>{item.label}</span>
              {typeof item.count === 'number' && item.count > 0 && (
                <span
                  style={{
                    marginLeft: 'auto',
                    fontSize: '0.75rem',
                    padding: '0.1rem 0.45rem',
                    borderRadius: 'var(--radius-full)',
                    background: isActive ? 'var(--color-accent-subtle)' : 'var(--bg-card)',
                    color: isActive ? 'var(--color-accent)' : 'var(--text-muted)'
                  }}
                >
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Utility Actions */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem',
          paddingTop: '1rem',
          borderTop: '1px solid var(--border-subtle)'
        }}
      >
        <button
          onClick={onOpenStats}
          className="btn-ghost"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.5rem 0.75rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.8125rem'
          }}
        >
          <BarChart2 size={16} />
          <span>Vault Statistics</span>
        </button>

        <button
          onClick={onExport}
          className="btn-ghost"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.5rem 0.75rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.8125rem'
          }}
        >
          <Download size={16} />
          <span>Export Vault</span>
        </button>

        <button
          onClick={onOpenShortcuts}
          className="btn-ghost"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.5rem 0.75rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.8125rem'
          }}
        >
          <Keyboard size={16} />
          <span>Keyboard Shortcuts</span>
        </button>

        <button
          onClick={onToggleTheme}
          className="btn-ghost"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.5rem 0.75rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.8125rem'
          }}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
      </div>

      {/* User Section */}
      {currentUser && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.75rem 0.5rem 0.25rem 0.5rem',
            marginTop: '0.75rem',
            borderTop: '1px solid var(--border-subtle)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 'var(--radius-full)',
                background: 'var(--color-accent-subtle)',
                color: 'var(--color-accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 600,
                flexShrink: 0
              }}
            >
              {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : 'U'}
            </div>
            <div style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>
              <p
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {currentUser.displayName || currentUser.email}
              </p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="btn-icon"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut size={16} />
          </button>
        </div>
      )}
    </aside>
  );
};
