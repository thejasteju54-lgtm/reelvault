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
      showToast('Copied link to clipboard', 'info');
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
          <img
            src={reel.thumbnailUrl}
            alt={reel.title ? `Preview for ${reel.title}` : `Reel preview for shortcode ${reel.instagramShortcode}`}
            width={320}
            height={180}
            loading="lazy"
          />
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--space-2)',
              color: 'var(--text-muted)'
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 'var(--radius)',
                backgroundColor: 'var(--bg-surface-active)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-primary)'
              }}
            >
              <InstagramIcon size={22} />
            </div>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--font-size-xs)',
                fontWeight: 500
              }}
            >
              {reel.instagramShortcode}
            </span>
          </div>
        )}

        {/* Top Floating Badges: Solid Flat Surfaces, No Blur */}
        <div
          style={{
            position: 'absolute',
            top: 'var(--space-2)',
            left: 'var(--space-2)',
            display: 'flex',
            gap: 'var(--space-1)'
          }}
        >
          {reel.categoryName && (
            <span
              className="badge"
              style={{
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                borderColor: 'var(--border-muted)'
              }}
            >
              {reel.categoryName}
            </span>
          )}

          {reel.isWatched && (
            <span
              className="badge"
              style={{
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--color-success)',
                borderColor: 'var(--border-muted)'
              }}
            >
              <CheckCircle size={10} />
              <span>Watched</span>
            </span>
          )}
        </div>

        {/* Favorite Star Top Right: Solid Dark Surface, No Blur */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(reel.id);
          }}
          className="btn-icon"
          style={{
            position: 'absolute',
            top: 'var(--space-2)',
            right: 'var(--space-2)',
            backgroundColor: 'rgba(19, 19, 18, 0.85)',
            color: reel.isFavorite ? 'var(--color-accent)' : '#ffffff',
            padding: 'var(--space-1)'
          }}
          aria-label={reel.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          title={reel.isFavorite ? 'Favorited' : 'Favorite'}
        >
          <Star size={15} fill={reel.isFavorite ? 'var(--color-accent)' : 'none'} />
        </button>
      </div>

      {/* Content Area */}
      <div className="reel-card-content">
        <h3
          style={{
            fontSize: 'var(--font-size-sm)',
            fontWeight: 600,
            lineHeight: varLineHeightSnug(),
            marginBottom: 'var(--space-1)',
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
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--font-size-xs)',
              color: 'var(--text-muted)',
              marginBottom: 'var(--space-2)'
            }}
          >
            @{reel.creatorUsername}
          </p>
        )}

        {/* Notes preview */}
        {reel.notes && (
          <p
            style={{
              fontSize: 'var(--font-size-xs)',
              color: 'var(--text-secondary)',
              marginBottom: 'var(--space-2)',
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
              gap: 'var(--space-1)',
              marginBottom: 'var(--space-3)'
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
            paddingTop: 'var(--space-2)',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--font-size-xs)',
              color: 'var(--text-muted)'
            }}
          >
            {formatRelativeTime(reel.createdAt)}
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', position: 'relative' }}>
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
              <CheckCircle size={15} />
            </button>

            {/* Open on Instagram Action */}
            <a
              href={reel.canonicalUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="btn btn-secondary"
              style={{
                fontSize: 'var(--font-size-xs)',
                padding: '2px var(--space-2)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--space-1)'
              }}
              title="Open canonical Instagram Reel in new tab"
            >
              <span>Open</span>
              <ExternalLink size={11} />
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
              <MoreVertical size={15} />
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
                    marginBottom: 'var(--space-1)',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-muted)',
                    borderRadius: 'var(--radius)',
                    boxShadow: 'var(--shadow-dropdown)',
                    zIndex: 70,
                    minWidth: '150px',
                    padding: 'var(--space-1)',
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
                      padding: 'var(--space-1) var(--space-2)',
                      fontSize: 'var(--font-size-xs)',
                      gap: 'var(--space-2)'
                    }}
                  >
                    <Edit2 size={13} />
                    <span>Edit Details</span>
                  </button>

                  <button
                    onClick={handleCopyUrl}
                    className="btn-ghost"
                    style={{
                      justifyContent: 'flex-start',
                      width: '100%',
                      padding: 'var(--space-1) var(--space-2)',
                      fontSize: 'var(--font-size-xs)',
                      gap: 'var(--space-2)'
                    }}
                  >
                    <Copy size={13} />
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
                      padding: 'var(--space-1) var(--space-2)',
                      fontSize: 'var(--font-size-xs)',
                      gap: 'var(--space-2)'
                    }}
                  >
                    {reel.isArchived ? <ArchiveRestore size={13} /> : <Archive size={13} />}
                    <span>{reel.isArchived ? 'Restore' : 'Archive'}</span>
                  </button>

                  <div style={{ height: 1, backgroundColor: 'var(--border-subtle)', margin: '2px 0' }} />

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
                      padding: 'var(--space-1) var(--space-2)',
                      fontSize: 'var(--font-size-xs)',
                      gap: 'var(--space-2)',
                      color: 'var(--color-danger)'
                    }}
                  >
                    <Trash2 size={13} />
                    <span>Delete Record</span>
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

function varLineHeightSnug() {
  return 1.35;
}
