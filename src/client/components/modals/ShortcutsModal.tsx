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
    { key: 'G then T', description: 'Navigate to Index Tags' },
    { key: '?', description: 'Toggle this keyboard shortcuts cheatsheet' }
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="460px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--radius)',
              backgroundColor: 'var(--bg-surface-active)',
              color: 'var(--color-primary)',
              border: '1px solid var(--border-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Keyboard size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600 }}>Keyboard Shortcuts</h3>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
              Keyboard navigation for high-speed cataloging
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
          {shortcuts.map((item) => (
            <div
              key={item.key}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 'var(--space-2) var(--space-3)',
                backgroundColor: 'var(--bg-app)',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
                {item.description}
              </span>
              <kbd>{item.key}</kbd>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-2)' }}>
          <button onClick={onClose} className="btn btn-secondary">
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};
