import React, { useState } from 'react';
import { Sparkles, Mail, Lock, User as UserIcon, AlertCircle } from 'lucide-react';
import { Modal } from '../ui/Modal.js';
import { api } from '../../services/api.js';
import { User } from '../../types/index.js';
import { useToast } from '../ui/Toast.js';

interface AuthModalProps {
  isOpen: boolean;
  onSuccess: (user: User) => void;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onSuccess, onClose }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      if (mode === 'login') {
        const res = await api.auth.login(email, password);
        showToast('✓ Successfully signed in', 'success');
        onSuccess({
          id: res.user.id,
          email: res.user.email,
          displayName: res.user.displayName,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      } else {
        const res = await api.auth.register(email, password, displayName || undefined);
        showToast('✓ Account created successfully', 'success');
        onSuccess({
          id: res.user.id,
          email: res.user.email,
          displayName: res.user.displayName,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
    } catch (err: unknown) {
      const e = err as Error;
      setErrorMsg(e.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmail('demo@reelvault.app');
    setPassword('demo1234');
    setErrorMsg(null);
    setIsLoading(true);

    try {
      // Try login first, or register demo user if not existing
      let res;
      try {
        res = await api.auth.login('demo@reelvault.app', 'demo1234');
      } catch {
        res = await api.auth.register('demo@reelvault.app', 'demo1234', 'Demo User');
      }

      showToast('✓ Logged in as Demo User', 'success');
      onSuccess({
        id: res.user.id,
        email: res.user.email,
        displayName: res.user.displayName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    } catch (err: unknown) {
      const e = err as Error;
      setErrorMsg(e.message || 'Failed demo login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="420px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Modal Brand Title */}
        <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
          <div
            style={{
              width: 44,
              height: 44,
              margin: '0 auto 0.75rem auto',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff'
            }}
          >
            <Sparkles size={24} />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
            {mode === 'login' ? 'Sign in to ReelVault' : 'Create your Vault'}
          </h2>
          <p style={{ fontSize: '0.8125rem', marginTop: '0.25rem' }}>
            {mode === 'login'
              ? 'Access your personal saved reels and knowledge base'
              : 'Save and organize Reels across all your devices'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div
          style={{
            display: 'flex',
            background: 'var(--bg-app)',
            borderRadius: 'var(--radius-md)',
            padding: '3px'
          }}
        >
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMsg(null);
            }}
            style={{
              flex: 1,
              padding: '0.45rem',
              fontSize: '0.8125rem',
              fontWeight: mode === 'login' ? 600 : 500,
              borderRadius: 'var(--radius-sm)',
              color: mode === 'login' ? 'var(--text-primary)' : 'var(--text-muted)',
              background: mode === 'login' ? 'var(--bg-card)' : 'transparent',
              boxShadow: mode === 'login' ? 'var(--shadow-sm)' : 'none'
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMsg(null);
            }}
            style={{
              flex: 1,
              padding: '0.45rem',
              fontSize: '0.8125rem',
              fontWeight: mode === 'register' ? 600 : 500,
              borderRadius: 'var(--radius-sm)',
              color: mode === 'register' ? 'var(--text-primary)' : 'var(--text-muted)',
              background: mode === 'register' ? 'var(--bg-card)' : 'transparent',
              boxShadow: mode === 'register' ? 'var(--shadow-sm)' : 'none'
            }}
          >
            Register
          </button>
        </div>

        {errorMsg && (
          <div
            style={{
              padding: '0.625rem 0.875rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-danger-bg)',
              color: 'var(--color-danger)',
              fontSize: '0.8125rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {mode === 'register' && (
            <div>
              <label style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                Display Name (Optional)
              </label>
              <div style={{ position: 'relative' }}>
                <UserIcon
                  size={16}
                  style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Alex"
                  style={{ width: '100%', padding: '0.625rem 0.75rem 0.625rem 2.25rem' }}
                />
              </div>
            </div>
          )}

          <div>
            <label style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={16}
                style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
              />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                style={{ width: '100%', padding: '0.625rem 0.75rem 0.625rem 2.25rem' }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={16}
                style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
              />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                style={{ width: '100%', padding: '0.625rem 0.75rem 0.625rem 2.25rem' }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}
          >
            {isLoading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>

          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={isLoading}
            className="btn btn-secondary"
            style={{ width: '100%', padding: '0.625rem', fontSize: '0.8125rem' }}
          >
            Instant 1-Click Demo Login
          </button>
        </form>
      </div>
    </Modal>
  );
};
