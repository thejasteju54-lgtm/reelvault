import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Bookmark, 
  Star, 
  Archive as ArchiveIcon, 
  Hash, 
  Settings,
  PlaySquare
} from 'lucide-react';

export function Sidebar() {
  const navItems = [
    { to: '/dashboard', icon: Home, label: 'Dashboard' },
    { to: '/saved', icon: Bookmark, label: 'Saved Reels', badge: '12' },
    { to: '/favorites', icon: Star, label: 'Favorites', badge: '3' },
    { to: '/tags', icon: Hash, label: 'Tags' },
    { to: '/archive', icon: ArchiveIcon, label: 'Archive' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">
          <PlaySquare size={20} />
        </div>
        <div className="sidebar-brand-text">ReelVault</div>
      </div>
      
      <div className="sidebar-section" style={{ flex: 1 }}>
        <div className="sidebar-section-label">Library</div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <item.icon className="sidebar-link-icon" size={18} />
              <span>{item.label}</span>
              {item.badge && <span className="sidebar-link-badge">{item.badge}</span>}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="sidebar-section">
        <nav className="sidebar-nav">
          <NavLink
            to="/settings"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <Settings className="sidebar-link-icon" size={18} />
            <span>Settings</span>
          </NavLink>
        </nav>
      </div>
    </aside>
  );
}
