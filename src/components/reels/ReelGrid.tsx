import { useEffect, useState, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { ReelCard } from './ReelCard';
import { ReelsService } from '../../services/reels';
import type { ReelWithDetails } from '../../types/database';
import { useToast } from '../../contexts/ToastContext';
import { EmptyState } from '../ui/EmptyState';

interface ReelGridProps {
  status?: 'all' | 'unwatched' | 'watched' | 'favorites' | 'archived';
  searchQuery?: string;
  categoryId?: string;
  tag?: string;
  emptyIcon: any;
  emptyTitle: string;
  emptySubtitle: string;
}

export function ReelGrid({ 
  status = 'all', 
  searchQuery = '', 
  categoryId = '', 
  tag = '',
  emptyIcon,
  emptyTitle,
  emptySubtitle
}: ReelGridProps) {
  const [reels, setReels] = useState<ReelWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { error } = useToast();

  const fetchReels = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // We debounce or delay if needed, but for now just fetch directly
      const { data } = await ReelsService.listReels({ 
        limit: 50, 
        page: 1,
        status, 
        search: searchQuery, 
        category_id: categoryId,
        tag,
        sortBy: status === 'favorites' ? 'favorite' : 'newest'
      });
      setReels(data);
    } catch (err: any) {
      error('Failed to load reels', err.message);
    } finally {
      setIsLoading(false);
    }
  }, [status, searchQuery, categoryId, tag, error]);

  // Use a small debounce effect for search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchReels();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchReels]);

  const handleToggleFavorite = async (id: string, isFavorite: boolean) => {
    setReels(current => {
      if (status === 'favorites' && !isFavorite) {
        // Optimistically remove from list if we're on the favorites page
        return current.filter(r => r.id !== id);
      }
      return current.map(r => r.id === id ? { ...r, is_favorite: isFavorite } : r);
    });
    try {
      await ReelsService.updateReel(id, { is_favorite: isFavorite });
    } catch (err: any) {
      error('Update failed', err.message);
      fetchReels(); // revert on failure
    }
  };

  const handleToggleWatched = async (id: string, isWatched: boolean) => {
    setReels(current => current.map(r => r.id === id ? { ...r, is_watched: isWatched } : r));
    try {
      await ReelsService.updateReel(id, { is_watched: isWatched });
    } catch (err: any) {
      error('Update failed', err.message);
      fetchReels();
    }
  };

  const handleToggleArchive = async (id: string, isArchived: boolean) => {
    setReels(current => {
      // If we are archiving and not on the archive page, remove it
      if (isArchived && status !== 'archived') {
        return current.filter(r => r.id !== id);
      }
      // If we are unarchiving and on the archive page, remove it
      if (!isArchived && status === 'archived') {
        return current.filter(r => r.id !== id);
      }
      return current.map(r => r.id === id ? { ...r, is_archived: isArchived } : r);
    });
    
    try {
      await ReelsService.updateReel(id, { is_archived: isArchived });
    } catch (err: any) {
      error('Archive failed', err.message);
      fetchReels();
    }
  };

  if (isLoading && reels.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-12)' }}>
        <Loader2 size={32} className="animate-spin" style={{ color: 'var(--accent-primary)' }} />
      </div>
    );
  }

  if (reels.length === 0) {
    return (
      <EmptyState
        icon={emptyIcon}
        title={emptyTitle}
        subtitle={emptySubtitle}
      />
    );
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
      gap: 'var(--space-6)',
      alignItems: 'stretch'
    }}>
      {reels.map(reel => (
        <div key={reel.id}>
          <ReelCard 
            reel={reel} 
            onToggleFavorite={handleToggleFavorite}
            onToggleWatched={handleToggleWatched}
            onToggleArchive={handleToggleArchive}
          />
        </div>
      ))}
    </div>
  );
}
