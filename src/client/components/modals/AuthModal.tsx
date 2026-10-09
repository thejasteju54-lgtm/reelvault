import React, { useState } from 'react';
import { Layers, Mail, Lock, User as UserIcon, AlertCircle } from 'lucide-react';
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
        showToast('Signed into vault', 'success');
        onSuccess({
          id: res.user.id,
          email: res.user.email,
          displayName: res.user.displayName,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      } else {
        const res = await api.auth.register(email, password, displayName || undefined);
        showToast('Account registered successfully', 'success');
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
      let res;
      try {
        res = await api.auth.login('demo@reelvault.app', 'demo1234');
      } catch {
        res = await api.auth.register('demo@reelvault.app', 'demo1234', 'Demo User');
      }

      showToast('Entered as Demo Curator', 'success');
      onSuccess({
        id: res.user.id,
        email: res.user.email,
        displayName: res.user.displayName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    } catch (err: unknown) {
      const e = err as Error;
      setErrorMsg(e.message || 'Failed demo authentication');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="420px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {/* Modal Brand Title: Solid Terracotta Emblem */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-2)' }}>
          <div
            style={{
              width: 40,
              height: 40,
              margin: '0 auto var(--space-3) auto',
              borderRadius: 'var(--radius)',
              backgroundColor: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff'
            }}
          >
            <Layers size={22} />
          </div>
          <h2 style={{ fontSize: 'var(--font-size-md)', fontWeight: 600 }}>
            {mode === 'login' ? 'Sign in to ReelVault' : 'Register Vault Account'}
          </h2>
          <p style={{ fontSize: 'var(--font-size-xs)', marginTop: 'var(--space-1)', color: 'var(--text-secondary)' }}>
            {mode === 'login'
              ? 'Access your saved video reference library'
              : 'Index and organize reels across all workstations'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div
          style={{
            display: 'flex',
            backgroundColor: 'var(--bg-app)',
            borderRadius: 'var(--radius)',
            padding: '2px',
            border: '1px solid var(--border-subtle)'
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
              padding: 'var(--space-1) var(--space-2)',
              fontSize: 'var(--font-size-xs)',
              fontWeight: mode === 'login' ? 600 : 500,
              borderRadius: 'var(--radius)',
              color: mode === 'login' ? 'var(--text-primary)' : 'var(--text-muted)',
              backgroundColor: mode === 'login' ? 'var(--bg-surface)' : 'transparent',
              border: mode === 'login' ? '1px solid var(--border-subtle)' : '1px solid transparent',
              transition: 'all var(--transition-fast)'
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
              padding: 'var(--space-1) var(--space-2)',
              fontSize: 'var(--font-size-xs)',
              fontWeight: mode === 'register' ? 600 : 500,
              borderRadius: 'var(--radius)',
              color: mode === 'register' ? 'var(--text-primary)' : 'var(--text-muted)',
              backgroundColor: mode === 'register' ? 'var(--bg-surface)' : 'transparent',
              border: mode === 'register' ? '1px solid var(--border-subtle)' : '1px solid transparent',
              transition: 'all var(--transition-fast)'
            }}
          >
            Register
          </button>
        </div>

        {errorMsg && (
          <div
            style={{
              padding: 'var(--space-2) var(--space-3)',
              borderRadius: 'var(--radius)',
              backgroundColor: 'var(--bg-surface-active)',
              border: '1px solid var(--color-danger)',
              color: 'var(--color-danger)',
              fontSize: 'var(--font-size-xs)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)'
            }}
          >
            <AlertCircle size={15} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {mode === 'register' && (
            <div>
              <label style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', display: 'block', marginBottom: 'var(--space-1)' }}>
                Display Name (Optional)
              </label>
              <div style={{ position: 'relative' }}>
                <UserIcon
                  size={15}
                  style={{ position: 'absolute', left: 'var(--space-3)', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Alex"
                  style={{ width: '100%', padding: 'var(--space-2) var(--space-3) var(--space-2) 2.25rem' }}
                />
              </div>
            </div>
          )}

          <div>
            <label style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', display: 'block', marginBottom: 'var(--space-1)' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={15}
                style={{ position: 'absolute', left: 'var(--space-3)', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
              />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                style={{ width: '100%', padding: 'var(--space-2) var(--space-3) var(--space-2) 2.25rem' }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', display: 'block', marginBottom: 'var(--space-1)' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={15}
                style={{ position: 'absolute', left: 'var(--space-3)', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
              />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                style={{ width: '100%', padding: 'var(--space-2) var(--space-3) var(--space-2) 2.25rem' }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary"
            style={{ width: '100%', padding: 'var(--space-3)', marginTop: 'var(--space-1)' }}
          >
            {isLoading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>

          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={isLoading}
            className="btn btn-secondary"
            style={{ width: '100%', padding: 'var(--space-2)', fontSize: 'var(--font-size-xs)' }}
          >
            Enter as Demo Curator
          </button>
        </form>
      </div>
    </Modal>
  );
};
