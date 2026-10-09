import React from 'react';
import { LayoutDashboard, Bookmark, Star, Archive, Hash } from 'lucide-react';
import { ActiveTab } from './Sidebar.js';

interface MobileNavProps {
  currentTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ currentTab, onSelectTab }) => {
  const tabs = [
    { id: 'dashboard' as ActiveTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'saved' as ActiveTab, label: 'Saved', icon: Bookmark },
    { id: 'favorites' as ActiveTab, label: 'Favorites', icon: Star },
    { id: 'archive' as ActiveTab, label: 'Archive', icon: Archive },
    { id: 'tags' as ActiveTab, label: 'Tags', icon: Hash }
  ];

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '56px',
        backgroundColor: 'var(--bg-surface)',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 50,
        paddingBottom: 'env(safe-area-inset-bottom)'
      }}
      className="mobile-nav-container"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
              color: isActive ? 'var(--color-primary)' : 'var(--text-muted)',
              backgroundColor: 'transparent',
              fontSize: 'var(--font-size-xs)',
              fontWeight: isActive ? 600 : 500,
              padding: 'var(--space-1) var(--space-2)'
            }}
          >
            <Icon size={18} />
            <span>{tab.label}</span>
          </button>
        );
      })}
      <style>{`
        @media (min-width: 769px) {
          .mobile-nav-container { display: none !important; }
        }
      `}</style>
    </div>
  );
};
