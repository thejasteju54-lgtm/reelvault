import { useEffect, useState, useCallback } from 'react';
import { LayoutDashboard, Loader2 } from 'lucide-react';
import { EmptyState } from '../components/ui/EmptyState';
import { QuickSave } from '../components/reels/QuickSave';
import { ReelCard } from '../components/reels/ReelCard';
import { ReelsService } from '../services/reels';
import type { ReelWithDetails } from '../types/database';
import { useToast } from '../contexts/ToastContext';

export function Dashboard() {
  const [reels, setReels] = useState<ReelWithDetails[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { error } = useToast();

  const fetchReelsAndStats = useCallback(async () => {
    try {
      setIsLoading(true);
      const [reelsData, statsData] = await Promise.all([
        ReelsService.listReels({ limit: 12, sortBy: 'newest' }),
        import('../services/taxonomy').then(m => m.TaxonomyService.getStats())
      ]);
      setReels(reelsData.data);
      setStats(statsData);
    } catch (err: any) {
      error('Failed to load dashboard data', err.message);
    } finally {
      setIsLoading(false);
    }
  }, [error]);

  useEffect(() => {
    fetchReelsAndStats();
  }, [fetchReelsAndStats]);

  const handleToggleFavorite = async (id: string, isFavorite: boolean) => {
    // Optimistic update
    setReels(current => current.map(r => r.id === id ? { ...r, is_favorite: isFavorite } : r));
    try {
      await ReelsService.updateReel(id, { is_favorite: isFavorite });
    } catch (err: any) {
      error('Failed to update favorite', err.message);
      // Revert on failure
      setReels(current => current.map(r => r.id === id ? { ...r, is_favorite: !isFavorite } : r));
    }
  };

  const handleToggleWatched = async (id: string, isWatched: boolean) => {
    // Optimistic update
    setReels(current => current.map(r => r.id === id ? { ...r, is_watched: isWatched } : r));
    try {
      await ReelsService.updateReel(id, { is_watched: isWatched });
    } catch (err: any) {
      error('Failed to update watched status', err.message);
      // Revert on failure
      setReels(current => current.map(r => r.id === id ? { ...r, is_watched: !isWatched } : r));
    }
  };

  return (
    <div>
      <header className="page-header" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Your command center for saved reels.</p>
        </div>
        
        {stats && (
          <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
            <div style={{ flex: '1', minWidth: '120px', background: 'var(--bg-card)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-card)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Total Saved</div>
              <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--text-primary)' }}>{stats.total}</div>
            </div>
            <div style={{ flex: '1', minWidth: '120px', background: 'var(--bg-card)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-card)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Unwatched</div>
              <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--accent-amber)' }}>{stats.unwatched}</div>
            </div>
            <div style={{ flex: '1', minWidth: '120px', background: 'var(--bg-card)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-card)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Favorites</div>
              <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--accent-primary)' }}>{stats.favorites}</div>
            </div>
          </div>
        )}

        <QuickSave onSaveSuccess={fetchReelsAndStats} />
      </header>

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-12)' }}>
          <Loader2 size={32} className="animate-spin" style={{ color: 'var(--accent-primary)' }} />
        </div>
      ) : reels.length === 0 ? (
        <EmptyState
          icon={LayoutDashboard}
          title="Welcome to ReelVault"
          subtitle="Start by pasting an Instagram Reel URL in the search bar above or use the Quick Save shortcut (N)."
        />
      ) : (
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
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
