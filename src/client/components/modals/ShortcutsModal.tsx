import React from 'react';
import { Keyboard } from 'lucide-react';
import { Modal } from '../ui/Modal.js';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  const shortcuts = [
    { key: 'N', description: 'Focus Quick Save URL bar to paste Reel' },
    { key: '/', description: 'Focus Search field' },
    { key: 'Esc', description: 'Close any active modal or clear inputs' },
    { key: 'G then D', description: 'Navigate to Dashboard' },
    { key: 'G then S', description: 'Navigate to Saved Reels' },
    { key: 'G then F', description: 'Navigate to Favorites' },
    { key: 'G then A', description: 'Navigate to Archive' },
    { key: 'G then T', description: 'Navigate to Tags' },
    { key: '?', description: 'Toggle this keyboard shortcuts cheatsheet' }
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="460px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-accent-subtle)',
              color: 'var(--color-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Keyboard size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Keyboard Shortcuts</h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Speed up your workflow with power-user keystrokes
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {shortcuts.map((item) => (
            <div
              key={item.key}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.5rem 0.75rem',
                background: 'var(--bg-app)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                {item.description}
              </span>
              <kbd
                style={{
                  fontFamily: 'monospace',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  padding: '0.2rem 0.5rem',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-muted)',
                  borderRadius: 'var(--radius-sm)',
                  boxShadow: 'var(--shadow-sm)',
                  color: 'var(--text-primary)'
                }}
              >
                {item.key}
              </kbd>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
          <button onClick={onClose} className="btn btn-secondary">
            Got It
          </button>
        </div>
      </div>
    </Modal>
  );
};
