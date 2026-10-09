import React from 'react';
import { BarChart2, CheckCircle, Star, Archive, Bookmark, Hash } from 'lucide-react';
import { Modal } from '../ui/Modal.js';
import { VaultStats } from '../../types/index.js';

interface StatsModalProps {
  isOpen: boolean;
  stats: VaultStats | null;
  onClose: () => void;
  onSelectTag?: (tag: string) => void;
}

export const StatsModal: React.FC<StatsModalProps> = ({
  isOpen,
  stats,
  onClose,
  onSelectTag
}) => {
  if (!stats) return null;

  const watchedPercent = stats.total > 0
    ? Math.round((stats.watched / stats.total) * 100)
    : 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="500px">
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
            <BarChart2 size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600 }}>Vault Statistics</h3>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
              Summary of saved references and study progress
            </p>
          </div>
        </div>

        {/* Primary KPI Grid: High-Density Ledger Cells */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 'var(--space-2)'
          }}
        >
          <div
            style={{
              padding: 'var(--space-3)',
              backgroundColor: 'var(--bg-app)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)', marginBottom: 'var(--space-1)' }}>
              <Bookmark size={13} />
              <span>TOTAL REELS</span>
            </div>
            <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
              {stats.total}
            </div>
          </div>

          <div
            style={{
              padding: 'var(--space-3)',
              backgroundColor: 'var(--bg-app)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', color: 'var(--color-success)', fontSize: 'var(--font-size-xs)', marginBottom: 'var(--space-1)' }}>
              <CheckCircle size={13} />
              <span>WATCHED ({watchedPercent}%)</span>
            </div>
            <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-success)' }}>
              {stats.watched}
            </div>
          </div>

          <div
            style={{
              padding: 'var(--space-3)',
              backgroundColor: 'var(--bg-app)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', color: 'var(--color-accent)', fontSize: 'var(--font-size-xs)', marginBottom: 'var(--space-1)' }}>
              <Star size={13} />
              <span>FAVORITES</span>
            </div>
            <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-accent)' }}>
              {stats.favorites}
            </div>
          </div>

          <div
            style={{
              padding: 'var(--space-3)',
              backgroundColor: 'var(--bg-app)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)', marginBottom: 'var(--space-1)' }}>
              <Archive size={13} />
              <span>ARCHIVED</span>
            </div>
            <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
              {stats.archived}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        {stats.total > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              <span>Watch Completion</span>
              <span>{stats.watched} of {stats.total} reviewed</span>
            </div>
            <div
              style={{
                height: 6,
                width: '100%',
                backgroundColor: 'var(--bg-app)',
                borderRadius: 'var(--radius)',
                overflow: 'hidden',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${watchedPercent}%`,
                  backgroundColor: 'var(--color-success)',
                  borderRadius: 'var(--radius)',
                  transition: 'width var(--transition-normal)'
                }}
              />
            </div>
          </div>
        )}

        {/* Top Tags */}
        {stats.topTags && stats.topTags.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginTop: 'var(--space-1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
              <Hash size={13} />
              <span style={{ fontWeight: 600 }}>TOP INDEX TAGS</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-1)' }}>
              {stats.topTags.map((tag) => (
                <button
                  key={tag.name}
                  onClick={() => {
                    onSelectTag?.(tag.name);
                    onClose();
                  }}
                  className="badge badge-tag"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)', padding: '2px var(--space-2)' }}
                >
                  <span>#{tag.name}</span>
                  <span style={{ opacity: 0.7, fontSize: 'var(--font-size-xs)' }}>({tag.count})</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-2)' }}>
          <button onClick={onClose} className="btn btn-secondary">
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};
