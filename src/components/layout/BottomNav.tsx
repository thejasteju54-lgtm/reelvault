import { NavLink } from 'react-router-dom';
import { Home, Bookmark, Star, Settings } from 'lucide-react';

export function BottomNav() {
  const navItems = [
    { to: '/dashboard', icon: Home, label: 'Home' },
    { to: '/saved', icon: Bookmark, label: 'Saved' },
    { to: '/favorites', icon: Star, label: 'Favorites' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <nav className="bottom-nav">
      <div className="bottom-nav-inner">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
          >
            {({ isActive }) => (
              <>
                <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
