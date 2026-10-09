import { Star, CheckCircle, ExternalLink, Archive as ArchiveIcon } from 'lucide-react';
import type { ReelWithDetails } from '../../types/database';

interface ReelCardProps {
  reel: ReelWithDetails;
  onToggleFavorite?: (id: string, isFavorite: boolean) => void;
  onToggleWatched?: (id: string, isWatched: boolean) => void;
  onToggleArchive?: (id: string, isArchived: boolean) => void;
  onClick?: (id: string) => void;
}

export function ReelCard({ reel, onToggleFavorite, onToggleWatched, onToggleArchive, onClick }: ReelCardProps) {
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite?.(reel.id, !reel.is_favorite);
  };

  const handleWatchedClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleWatched?.(reel.id, !reel.is_watched);
  };

  const handleExternalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(reel.instagram_url, '_blank', 'noopener,noreferrer');
  };

  const handleArchiveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleArchive?.(reel.id, !reel.is_archived);
  };

  // Graceful fallback for thumbnail
  const thumbnailUrl = reel.thumbnail_url || 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-elevated) 100%)';
  const hasThumbnail = !!reel.thumbnail_url;

  return (
    <div 
      className="reel-card animate-fade-in"
      onClick={() => onClick?.(reel.id)}
      style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-card)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'all var(--transition-fast)',
        boxShadow: 'var(--shadow-sm)',
        height: '100%',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
        e.currentTarget.style.borderColor = 'var(--border-focus)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
        e.currentTarget.style.borderColor = 'var(--border-card)';
      }}
    >
      {/* Media Header (9:16 aspect ratio roughly = 56.25% padding bottom, wait 16:9 is 56.25%, 9:16 is 177.77%) */}
      {/* Wait, standard thumbnail might be a bit shorter in preview, let's just give it a fixed height or aspect ratio */}
      <div 
        style={{
          width: '100%',
          paddingBottom: '133%', // 4:3ish / 16:9ish mix to fit well in grid
          background: hasThumbnail ? `url(${thumbnailUrl}) center/cover no-repeat` : thumbnailUrl,
          position: 'relative'
        }}
      >
        {/* Top Badges */}
        <div style={{ position: 'absolute', top: '8px', left: '8px', display: 'flex', gap: '4px' }}>
          {reel.is_watched ? (
            <span style={{ 
              background: 'var(--bg-glass)', backdropFilter: 'blur(4px)',
              padding: '2px 6px', borderRadius: 'var(--radius-sm)', fontSize: '10px', fontWeight: 600, color: 'var(--accent-emerald)'
            }}>Watched</span>
          ) : (
            <span style={{ 
              background: 'var(--bg-glass)', backdropFilter: 'blur(4px)',
              padding: '2px 6px', borderRadius: 'var(--radius-sm)', fontSize: '10px', fontWeight: 600, color: 'white'
            }}>New</span>
          )}
          
          {reel.category && (
            <span style={{ 
              background: 'var(--bg-glass)', backdropFilter: 'blur(4px)',
              padding: '2px 6px', borderRadius: 'var(--radius-sm)', fontSize: '10px', fontWeight: 600, color: 'white'
            }}>{reel.category.name}</span>
          )}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h4 style={{ 
          margin: '0 0 4px 0', 
          fontSize: 'var(--text-sm)', 
          fontWeight: 600,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          lineHeight: 1.4
        }} title={reel.title || reel.notes || 'Untitled Reel'}>
          {reel.title || reel.notes || 'Untitled Reel'}
        </h4>
        
        {reel.creator_username && (
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            @{reel.creator_username}
          </div>
        )}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: 'auto', marginBottom: '12px' }}>
          {reel.tags?.map(tag => (
            <span key={tag.id} style={{ 
              fontSize: '10px', 
              color: 'var(--accent-primary)', 
              background: 'var(--accent-glow)', 
              padding: '2px 6px', 
              borderRadius: 'var(--radius-sm)',
              fontWeight: 500
            }}>
              #{tag.name}
            </span>
          ))}
        </div>

        {/* Footer Action Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px', marginTop: 'auto' }}>
          <div style={{ display: 'flex', gap: '8px', color: 'var(--text-muted)' }}>
            <button onClick={handleFavoriteClick} style={{ color: reel.is_favorite ? 'var(--accent-amber)' : 'inherit' }}>
              <Star size={16} fill={reel.is_favorite ? 'currentColor' : 'none'} />
            </button>
            <button onClick={handleWatchedClick} style={{ color: reel.is_watched ? 'var(--accent-emerald)' : 'inherit' }}>
              <CheckCircle size={16} />
            </button>
          </div>
          <div style={{ display: 'flex', gap: '8px', color: 'var(--text-muted)' }}>
            <button onClick={handleExternalClick} title="Open on Instagram">
              <ExternalLink size={16} />
            </button>
            <button onClick={handleArchiveClick} title={reel.is_archived ? 'Unarchive' : 'Archive'} style={{ color: reel.is_archived ? 'var(--accent-primary)' : 'inherit' }}>
              <ArchiveIcon size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
