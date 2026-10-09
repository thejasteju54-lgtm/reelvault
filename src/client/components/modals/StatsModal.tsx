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
            <BarChart2 size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Vault Statistics</h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Overview of your saved content and learning progress
            </p>
          </div>
        </div>

        {/* Primary KPI Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '0.75rem'
          }}
        >
          <div
            style={{
              padding: '1rem',
              background: 'var(--bg-app)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
              <Bookmark size={14} />
              <span>TOTAL REELS</span>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {stats.total}
            </div>
          </div>

          <div
            style={{
              padding: '1rem',
              background: 'var(--bg-app)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-success)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
              <CheckCircle size={14} />
              <span>WATCHED ({watchedPercent}%)</span>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-success)' }}>
              {stats.watched}
            </div>
          </div>

          <div
            style={{
              padding: '1rem',
              background: 'var(--bg-app)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fbbf24', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
              <Star size={14} />
              <span>FAVORITES</span>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#fbbf24' }}>
              {stats.favorites}
            </div>
          </div>

          <div
            style={{
              padding: '1rem',
              background: 'var(--bg-app)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
              <Archive size={14} />
              <span>ARCHIVED</span>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {stats.archived}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        {stats.total > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span>Watch Completion</span>
              <span>{stats.watched} of {stats.total} watched</span>
            </div>
            <div
              style={{
                height: 8,
                width: '100%',
                background: 'var(--bg-app)',
                borderRadius: 'var(--radius-full)',
                overflow: 'hidden',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${watchedPercent}%`,
                  background: 'var(--color-success)',
                  borderRadius: 'var(--radius-full)',
                  transition: 'width var(--transition-normal)'
                }}
              />
            </div>
          </div>
        )}

        {/* Top Tags */}
        {stats.topTags && stats.topTags.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              <Hash size={14} />
              <span style={{ fontWeight: 600 }}>TOP TAGS</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {stats.topTags.map((tag) => (
                <button
                  key={tag.name}
                  onClick={() => {
                    onSelectTag?.(tag.name);
                    onClose();
                  }}
                  className="badge badge-tag"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.3rem 0.6rem' }}
                >
                  <span>#{tag.name}</span>
                  <span style={{ opacity: 0.65, fontSize: '0.7rem' }}>({tag.count})</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
          <button onClick={onClose} className="btn btn-secondary">
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};
