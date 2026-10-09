import { Settings as SettingsIcon, Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export function Settings() {
  const { theme, setTheme } = useTheme();

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage your account and preferences.</p>
      </header>

      <div style={{ maxWidth: '600px' }}>
        <section style={{ 
          background: 'var(--bg-card)', 
          borderRadius: 'var(--radius-lg)', 
          border: '1px solid var(--border-card)',
          padding: 'var(--space-6)',
          marginBottom: 'var(--space-6)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
            <div style={{ padding: '8px', background: 'var(--accent-glow)', borderRadius: 'var(--radius-md)', color: 'var(--accent-primary)' }}>
              <SettingsIcon size={20} />
            </div>
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 600 }}>Appearance</h2>
          </div>
          
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}>
            Customize the look and feel of ReelVault.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-4)' }}>
            <button
              onClick={() => setTheme('light')}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-2)',
                padding: 'var(--space-4)',
                borderRadius: 'var(--radius-md)',
                border: theme === 'light' ? '2px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                background: 'var(--bg-input)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
            >
              <Sun size={24} />
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>Light</span>
            </button>
            
            <button
              onClick={() => setTheme('dark')}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-2)',
                padding: 'var(--space-4)',
                borderRadius: 'var(--radius-md)',
                border: theme === 'dark' ? '2px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                background: 'var(--bg-input)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
            >
              <Moon size={24} />
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>Dark</span>
            </button>

            <button
              onClick={() => setTheme('system')}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-2)',
                padding: 'var(--space-4)',
                borderRadius: 'var(--radius-md)',
                border: theme === 'system' ? '2px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                background: 'var(--bg-input)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
            >
              <Monitor size={24} />
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>System</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
