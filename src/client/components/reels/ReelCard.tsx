import React, { useState } from 'react';
import {
  ExternalLink,
  Star,
  CheckCircle,
  MoreVertical,
  Edit2,
  Copy,
  Archive,
  ArchiveRestore,
  Trash2
} from 'lucide-react';
import { InstagramIcon } from '../ui/InstagramIcon.js';
import { Reel } from '../../types/index.js';
import { useToast } from '../ui/Toast.js';

interface ReelCardProps {
  reel: Reel;
  onOpenDetails: (reel: Reel) => void;
  onToggleFavorite: (reelId: string) => void;
  onToggleWatched: (reelId: string) => void;
  onToggleArchive: (reelId: string) => void;
  onDelete: (reelId: string) => void;
  onSelectTag?: (tag: string) => void;
}

export const ReelCard: React.FC<ReelCardProps> = ({
  reel,
  onOpenDetails,
  onToggleFavorite,
  onToggleWatched,
  onToggleArchive,
  onDelete,
  onSelectTag
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const { showToast } = useToast();

  const handleCopyUrl = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(reel.canonicalUrl);
      showToast('✓ Copied Instagram link to clipboard', 'info');
    } catch {
      showToast('Failed to copy link', 'error');
    }
    setShowMenu(false);
  };

  const formatRelativeTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const diffMs = Date.now() - date.getTime();
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffSecs < 60) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 30) return `${diffDays}d ago`;
      return date.toLocaleDateString();
    } catch {
      return 'Recently';
    }
  };

  return (
    <article className="reel-card" onClick={() => onOpenDetails(reel)}>
      {/* Thumbnail area with fallback */}
      <div className="reel-card-thumbnail">
        {reel.thumbnailUrl ? (
          <img src={reel.thumbnailUrl} alt={reel.title || 'Reel thumbnail'} loading="lazy" />
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              color: 'var(--text-muted)'
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 'var(--radius-full)',
                background: 'rgba(255, 255, 255, 0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#e1306c'
              }}
            >
              <InstagramIcon size={26} />
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 500, letterSpacing: '0.04em' }}>
              REEL • {reel.instagramShortcode}
            </span>
          </div>
        )}

        {/* Top Floating Status Badges */}
        <div
          style={{
            position: 'absolute',
            top: '0.625rem',
            left: '0.625rem',
            display: 'flex',
            gap: '0.35rem'
          }}
        >
          {reel.categoryName && (
            <span
              className="badge"
              style={{
                backgroundColor: reel.categoryColor ? `${reel.categoryColor}22` : undefined,
                color: reel.categoryColor || undefined,
                borderColor: reel.categoryColor ? `${reel.categoryColor}44` : undefined,
                backdropFilter: 'blur(6px)'
              }}
            >
              {reel.categoryName}
            </span>
          )}

          {reel.isWatched && (
            <span
              className="badge"
              style={{
                background: 'var(--color-success-bg)',
                color: 'var(--color-success)',
                borderColor: 'rgba(16, 185, 129, 0.25)',
                backdropFilter: 'blur(6px)'
              }}
            >
              <CheckCircle size={10} />
              <span>Watched</span>
            </span>
          )}
        </div>

        {/* Favorite Star Top Right */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(reel.id);
          }}
          className="btn-icon"
          style={{
            position: 'absolute',
            top: '0.5rem',
            right: '0.5rem',
            background: 'rgba(0, 0, 0, 0.45)',
            backdropFilter: 'blur(6px)',
            color: reel.isFavorite ? '#fbbf24' : '#ffffff',
            padding: '6px'
          }}
          aria-label={reel.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          title={reel.isFavorite ? 'Favorited' : 'Favorite'}
        >
          <Star size={16} fill={reel.isFavorite ? '#fbbf24' : 'none'} />
        </button>
      </div>

      {/* Content Area */}
      <div className="reel-card-content">
        <h3
          style={{
            fontSize: '0.9375rem',
            fontWeight: 600,
            lineHeight: 1.4,
            marginBottom: '0.25rem',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
          title={reel.title || `Instagram Reel (${reel.instagramShortcode})`}
        >
          {reel.title || `Instagram Reel (${reel.instagramShortcode})`}
        </h3>

        {reel.creatorUsername && (
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            @{reel.creatorUsername}
          </p>
        )}

        {/* Notes preview */}
        {reel.notes && (
          <p
            style={{
              fontSize: '0.8125rem',
              color: 'var(--text-secondary)',
              marginBottom: '0.625rem',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {reel.notes}
          </p>
        )}

        {/* Tags */}
        {reel.tags.length > 0 && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.35rem',
              marginBottom: '0.75rem'
            }}
          >
            {reel.tags.map((tag) => (
              <span
                key={tag}
                className="badge badge-tag"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectTag?.(tag);
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Bottom Metadata & Actions Bar */}
        <div
          style={{
            marginTop: 'auto',
            paddingTop: '0.75rem',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {formatRelativeTime(reel.createdAt)}
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', position: 'relative' }}>
            {/* Watched Toggle */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleWatched(reel.id);
              }}
              className="btn-icon"
              style={{
                color: reel.isWatched ? 'var(--color-success)' : 'var(--text-muted)',
                padding: '4px'
              }}
              aria-label={reel.isWatched ? 'Mark unwatched' : 'Mark watched'}
              title={reel.isWatched ? 'Watched' : 'Mark watched'}
            >
              <CheckCircle size={16} />
            </button>

            {/* Open on Instagram Action */}
            <a
              href={reel.canonicalUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="btn btn-secondary"
              style={{
                fontSize: '0.75rem',
                padding: '0.35rem 0.65rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
              title="Open canonical Instagram Reel in new tab"
            >
              <span>Open</span>
              <ExternalLink size={12} />
            </a>

            {/* More Menu Dropdown Toggle */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="btn-icon"
              style={{ padding: '4px' }}
              aria-label="More actions"
            >
              <MoreVertical size={16} />
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <>
                <div
                  style={{ position: 'fixed', inset: 0, zIndex: 60 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: '100%',
                    right: 0,
                    marginBottom: '0.35rem',
                    background: 'var(--bg-dropdown)',
                    border: '1px solid var(--border-muted)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-dropdown)',
                    zIndex: 70,
                    minWidth: '150px',
                    padding: '0.35rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px'
                  }}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                      onOpenDetails(reel);
                    }}
                    className="btn-ghost"
                    style={{
                      justifyContent: 'flex-start',
                      width: '100%',
                      padding: '0.4rem 0.6rem',
                      fontSize: '0.8125rem',
                      gap: '0.5rem'
                    }}
                  >
                    <Edit2 size={14} />
                    <span>Edit Details</span>
                  </button>

                  <button
                    onClick={handleCopyUrl}
                    className="btn-ghost"
                    style={{
                      justifyContent: 'flex-start',
                      width: '100%',
                      padding: '0.4rem 0.6rem',
                      fontSize: '0.8125rem',
                      gap: '0.5rem'
                    }}
                  >
                    <Copy size={14} />
                    <span>Copy Link</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                      onToggleArchive(reel.id);
                    }}
                    className="btn-ghost"
                    style={{
                      justifyContent: 'flex-start',
                      width: '100%',
                      padding: '0.4rem 0.6rem',
                      fontSize: '0.8125rem',
                      gap: '0.5rem'
                    }}
                  >
                    {reel.isArchived ? <ArchiveRestore size={14} /> : <Archive size={14} />}
                    <span>{reel.isArchived ? 'Restore' : 'Archive'}</span>
                  </button>

                  <div style={{ height: 1, background: 'var(--border-subtle)', margin: '2px 0' }} />

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                      onDelete(reel.id);
                    }}
                    className="btn-ghost"
                    style={{
                      justifyContent: 'flex-start',
                      width: '100%',
                      padding: '0.4rem 0.6rem',
                      fontSize: '0.8125rem',
                      gap: '0.5rem',
                      color: 'var(--color-danger)'
                    }}
                  >
                    <Trash2 size={14} />
                    <span>Delete</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};
