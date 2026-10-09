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
  Layers,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { User, VaultStats } from '../../types/index.js';

export type ActiveTab = 'dashboard' | 'saved' | 'favorites' | 'unwatched' | 'archive' | 'tags' | 'privacy' | 'terms' | 'not-found';

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
  onNavigateToPrivacy?: () => void;
  onNavigateToTerms?: () => void;
  onResetCookieConsent?: () => void;
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
  onToggleTheme,
  onNavigateToPrivacy,
  onNavigateToTerms,
  onResetCookieConsent
}) => {
  const navItems = [
    { id: 'dashboard' as ActiveTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'saved' as ActiveTab, label: 'Saved Reels', icon: Bookmark, count: stats?.total },
    { id: 'favorites' as ActiveTab, label: 'Favorites', icon: Star, count: stats?.favorites },
    { id: 'archive' as ActiveTab, label: 'Archive', icon: Archive, count: stats?.archived },
    { id: 'tags' as ActiveTab, label: 'Index Tags', icon: Hash }
  ];

  return (
    <aside className="app-sidebar">
      {/* Brand Identity: Solid Terracotta Emblem */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-3)',
          paddingBottom: 'var(--space-5)',
          borderBottom: '1px solid var(--border-subtle)',
          cursor: 'pointer'
        }}
        onClick={() => onSelectTab('dashboard')}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 'var(--radius)',
            backgroundColor: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            flexShrink: 0
          }}
        >
          <Layers size={18} />
        </div>
        <div>
          <h2
            style={{
              fontSize: 'var(--font-size-base)',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)'
            }}
          >
            ReelVault
          </h2>
          <span
            style={{
              fontSize: 'var(--font-size-xs)',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)'
            }}
          >
            v1.0 • Archival Ledger
          </span>
        </div>
      </div>

      {/* Navigation Sections */}
      <nav
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-1)',
          marginTop: 'var(--space-5)',
          flex: 1
        }}
      >
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
                gap: 'var(--space-3)',
                padding: 'var(--space-2) var(--space-3)',
                borderRadius: 'var(--radius)',
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                backgroundColor: isActive ? 'var(--bg-surface-hover)' : 'transparent',
                fontWeight: isActive ? 600 : 500,
                fontSize: 'var(--font-size-sm)',
                border: isActive ? '1px solid var(--border-muted)' : '1px solid transparent',
                transition: 'all var(--transition-fast)'
              }}
            >
              <Icon
                size={16}
                color={isActive ? 'var(--color-primary)' : 'currentColor'}
              />
              <span>{item.label}</span>
              {typeof item.count === 'number' && item.count > 0 && (
                <span
                  style={{
                    marginLeft: 'auto',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--font-size-xs)',
                    padding: '1px var(--space-2)',
                    borderRadius: 'var(--radius)',
                    backgroundColor: isActive ? 'var(--bg-surface-active)' : 'var(--bg-surface)',
                    color: isActive ? 'var(--color-primary)' : 'var(--text-muted)',
                    border: '1px solid var(--border-subtle)'
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
          gap: 'var(--space-1)',
          paddingTop: 'var(--space-3)',
          borderTop: '1px solid var(--border-subtle)'
        }}
      >
        <button
          onClick={onOpenStats}
          className="btn-ghost"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            padding: 'var(--space-1) var(--space-3)',
            borderRadius: 'var(--radius)',
            fontSize: 'var(--font-size-xs)'
          }}
        >
          <BarChart2 size={14} />
          <span>Vault Statistics</span>
        </button>

        <button
          onClick={onExport}
          className="btn-ghost"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            padding: 'var(--space-1) var(--space-3)',
            borderRadius: 'var(--radius)',
            fontSize: 'var(--font-size-xs)'
          }}
        >
          <Download size={14} />
          <span>Export Vault</span>
        </button>

        <button
          onClick={onOpenShortcuts}
          className="btn-ghost"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            padding: 'var(--space-1) var(--space-3)',
            borderRadius: 'var(--radius)',
            fontSize: 'var(--font-size-xs)'
          }}
        >
          <Keyboard size={14} />
          <span>Shortcuts (?)</span>
        </button>

        <button
          onClick={onToggleTheme}
          className="btn-ghost"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            padding: 'var(--space-1) var(--space-3)',
            borderRadius: 'var(--radius)',
            fontSize: 'var(--font-size-xs)'
          }}
        >
          {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          <span>{theme === 'dark' ? 'Light Appearance' : 'Dark Appearance'}</span>
        </button>
      </div>

      {/* Compliance & Legal Footer (Items 1, 2, 5) */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
          paddingTop: 'var(--space-2)',
          marginTop: 'var(--space-2)',
          borderTop: '1px solid var(--border-subtle)',
          fontSize: 'var(--font-size-xs)',
          color: 'var(--text-muted)'
        }}
      >
        <button
          onClick={onNavigateToPrivacy}
          className="btn-ghost"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            padding: '2px var(--space-2)',
            fontSize: 'var(--font-size-xs)',
            justifyContent: 'flex-start',
            color: currentTab === 'privacy' ? 'var(--color-primary)' : 'var(--text-muted)'
          }}
        >
          <ShieldCheck size={13} />
          <span>Privacy Policy</span>
        </button>

        <button
          onClick={onNavigateToTerms}
          className="btn-ghost"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            padding: '2px var(--space-2)',
            fontSize: 'var(--font-size-xs)',
            justifyContent: 'flex-start',
            color: currentTab === 'terms' ? 'var(--color-primary)' : 'var(--text-muted)'
          }}
        >
          <FileText size={13} />
          <span>Terms of Service</span>
        </button>

        <button
          onClick={onResetCookieConsent}
          className="btn-ghost"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            padding: '2px var(--space-2)',
            fontSize: 'var(--font-size-xs)',
            justifyContent: 'flex-start',
            color: 'var(--text-muted)'
          }}
        >
          <span>Manage Cookies</span>
        </button>
      </div>

      {/* User Section */}
      {currentUser && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 'var(--space-2) var(--space-2) 0 var(--space-2)',
            marginTop: 'var(--space-2)',
            borderTop: '1px solid var(--border-subtle)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', minWidth: 0 }}>
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: 'var(--radius)',
                backgroundColor: 'var(--bg-surface-active)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--font-size-xs)',
                fontWeight: 600,
                flexShrink: 0
              }}
            >
              {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : 'U'}
            </div>
            <div style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>
              <p
                style={{
                  fontSize: 'var(--font-size-xs)',
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
            <LogOut size={14} />
          </button>
        </div>
      )}
    </aside>
  );
};
