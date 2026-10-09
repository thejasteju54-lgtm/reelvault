import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Bookmark,
  Star,
  Archive,
  Hash,
  Search
} from 'lucide-react';

import {
  User,
  Reel,
  Category,
  Tag,
  VaultStats,
  ReelQueryFilters
} from '../types/index.js';
import { api, getStoredToken } from './services/api.js';
import { Header } from './components/layout/Header.js';
import { Sidebar, ActiveTab } from './components/layout/Sidebar.js';
import { MobileNav } from './components/layout/MobileNav.js';
import { QuickSaveBar } from './components/reels/QuickSaveBar.js';
import { FilterBar } from './components/reels/FilterBar.js';
import { ReelCard } from './components/reels/ReelCard.js';
import { ReelDetailModal } from './components/reels/ReelDetailModal.js';
import { AuthModal } from './components/modals/AuthModal.js';
import { StatsModal } from './components/modals/StatsModal.js';
import { ShortcutsModal } from './components/modals/ShortcutsModal.js';
import { ExportModal } from './components/modals/ExportModal.js';
import { ReelCardSkeleton } from './components/ui/Skeleton.js';
import { EmptyState } from './components/ui/EmptyState.js';
import { ConfirmDialog } from './components/ui/ConfirmDialog.js';
import { useToast } from './components/ui/Toast.js';

export const App: React.FC = () => {
  // Theme state
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('reelvault_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return 'dark';
  });

  // Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isInitializingAuth, setIsInitializingAuth] = useState(true);

  // Navigation tab state
  const [currentTab, setCurrentTab] = useState<ActiveTab>('dashboard');

  // Vault data state
  const [reels, setReels] = useState<Reel[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [stats, setStats] = useState<VaultStats | null>(null);
  const [totalReelsCount, setTotalReelsCount] = useState(0);
  const [isLoadingReels, setIsLoadingReels] = useState(false);

  // Filter state
  const [filters, setFilters] = useState<ReelQueryFilters>({
    status: 'all',
    sort: 'newest'
  });

  // Modal states
  const [selectedReel, setSelectedReel] = useState<Reel | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [deletingReelId, setDeletingReelId] = useState<string | null>(null);

  const { showToast } = useToast();

  // Apply theme to documentElement
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('reelvault_theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  // Check auth on boot
  useEffect(() => {
    const checkAuth = async () => {
      const token = getStoredToken();
      if (!token) {
        setIsInitializingAuth(false);
        setIsAuthModalOpen(true);
        return;
      }

      try {
        const user = await api.auth.me();
        setCurrentUser(user);
      } catch {
        api.auth.logout();
        setIsAuthModalOpen(true);
      } finally {
        setIsInitializingAuth(false);
      }
    };

    checkAuth();

    const handleUnauthorized = () => {
      setCurrentUser(null);
      setIsAuthModalOpen(true);
      showToast('Session expired. Please sign in again.', 'info');
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [showToast]);

  // Load vault metadata (categories, tags, stats)
  const refreshMetadata = useCallback(async () => {
    if (!currentUser) return;
    try {
      const [catsData, tagsData, statsData] = await Promise.all([
        api.categories.list(),
        api.tags.list(),
        api.stats.get()
      ]);
      setCategories(catsData);
      setTags(tagsData);
      setStats(statsData);
    } catch (err) {
      console.error('Failed to refresh metadata', err);
    }
  }, [currentUser]);

  // Load reels with current filters + active tab overrides
  const loadReels = useCallback(async () => {
    if (!currentUser) return;
    setIsLoadingReels(true);

    try {
      const query: ReelQueryFilters = { ...filters };

      // Tab specific constraints
      if (currentTab === 'favorites') {
        query.favorite = true;
        query.archived = false;
      } else if (currentTab === 'archive') {
        query.archived = true;
      } else if (currentTab === 'unwatched') {
        query.status = 'unwatched';
        query.archived = false;
      } else {
        // dashboard, saved, tags
        query.archived = false;
      }

      const res = await api.reels.list(query);
      setReels(res.reels);
      setTotalReelsCount(res.total);
    } catch (err: unknown) {
      const e = err as Error;
      showToast(e.message || 'Error loading Reels', 'error');
    } finally {
      setIsLoadingReels(false);
    }
  }, [currentUser, currentTab, filters, showToast]);

  useEffect(() => {
    if (currentUser) {
      refreshMetadata();
    }
  }, [currentUser, refreshMetadata]);

  useEffect(() => {
    if (currentUser) {
      loadReels();
    }
  }, [currentUser, loadReels]);

  // Filter change helper
  const handleFilterChange = (partial: Partial<ReelQueryFilters>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
  };

  // Quick save handler
  const handleQuickSave = async (payload: {
    url: string;
    title?: string;
    notes?: string;
    categoryId?: string;
    tags?: string[];
  }): Promise<Reel> => {
    const newReel = await api.reels.save(payload);
    await Promise.all([loadReels(), refreshMetadata()]);
    return newReel;
  };

  // Toggle handlers with optimistic updates
  const handleToggleFavorite = async (reelId: string) => {
    setReels((prev) =>
      prev.map((r) => (r.id === reelId ? { ...r, isFavorite: !r.isFavorite } : r))
    );
    try {
      await api.reels.toggleFavorite(reelId);
      refreshMetadata();
    } catch {
      showToast('Failed to update favorite', 'error');
      loadReels();
    }
  };

  const handleToggleWatched = async (reelId: string) => {
    setReels((prev) =>
      prev.map((r) => (r.id === reelId ? { ...r, isWatched: !r.isWatched } : r))
    );
    try {
      await api.reels.toggleWatched(reelId);
      refreshMetadata();
    } catch {
      showToast('Failed to update watched status', 'error');
      loadReels();
    }
  };

  const handleToggleArchive = async (reelId: string) => {
    try {
      await api.reels.toggleArchive(reelId);
      showToast('✓ Reel archive status updated', 'success');
      loadReels();
      refreshMetadata();
    } catch {
      showToast('Failed to update archive status', 'error');
    }
  };

  const handleUpdateReel = async (
    reelId: string,
    updates: { title?: string; notes?: string; categoryId?: string | null; tags?: string[] }
  ) => {
    await api.reels.update(reelId, updates);
    await Promise.all([loadReels(), refreshMetadata()]);
    if (selectedReel?.id === reelId) {
      const updated = await api.reels.get(reelId);
      setSelectedReel(updated);
    }
  };

  const handleDeleteReel = async () => {
    if (!deletingReelId) return;
    try {
      await api.reels.delete(deletingReelId);
      showToast('✓ Reel deleted from vault', 'success');
      setDeletingReelId(null);
      if (selectedReel?.id === deletingReelId) {
        setIsDetailModalOpen(false);
        setSelectedReel(null);
      }
      loadReels();
      refreshMetadata();
    } catch {
      showToast('Failed to delete Reel', 'error');
    }
  };

  const handleOpenDetailModal = (reel: Reel) => {
    setSelectedReel(reel);
    setIsDetailModalOpen(true);
  };

  const handleSelectReelById = async (reelId: string) => {
    try {
      const found = await api.reels.get(reelId);
      setSelectedReel(found);
      setIsDetailModalOpen(true);
    } catch {
      showToast('Could not load existing Reel details', 'error');
    }
  };

  const handleLogout = () => {
    api.auth.logout();
    setCurrentUser(null);
    setReels([]);
    setStats(null);
    setIsAuthModalOpen(true);
    showToast('Signed out of ReelVault', 'info');
  };

  // Keyboard navigation shortcuts (G then D, S, F, A, T) & ? for shortcuts
  useEffect(() => {
    let lastKey = '';
    let timer: NodeJS.Timeout | null = null;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target?.tagName)) return;

      if (e.key === '?') {
        e.preventDefault();
        setIsShortcutsModalOpen((prev) => !prev);
        return;
      }

      if (lastKey === 'g' || lastKey === 'G') {
        const keyLower = e.key.toLowerCase();
        if (keyLower === 'd') {
          e.preventDefault();
          setCurrentTab('dashboard');
        } else if (keyLower === 's') {
          e.preventDefault();
          setCurrentTab('saved');
        } else if (keyLower === 'f') {
          e.preventDefault();
          setCurrentTab('favorites');
        } else if (keyLower === 'a') {
          e.preventDefault();
          setCurrentTab('archive');
        } else if (keyLower === 't') {
          e.preventDefault();
          setCurrentTab('tags');
        }
        lastKey = '';
        return;
      }

      if (e.key.toLowerCase() === 'g') {
        lastKey = 'g';
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
          lastKey = '';
        }, 800);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (timer) clearTimeout(timer);
    };
  }, []);

  // Filter tags helper
  const availableTags = useMemo(() => {
    return tags.map((t) => ({ name: t.name, count: t.count }));
  }, [tags]);

  return (
    <div className="app-layout">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          // clear tag filter when explicitly clicking tabs
          if (tab !== 'tags') {
            setFilters((prev) => ({ ...prev, tag: undefined }));
          }
        }}
        stats={stats}
        currentUser={currentUser}
        onOpenStats={() => setIsStatsModalOpen(true)}
        onExport={() => setIsExportModalOpen(true)}
        onOpenShortcuts={() => setIsShortcutsModalOpen(true)}
        onLogout={handleLogout}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Content Area */}
      <main className="app-main">
        <Header
          currentUser={currentUser}
          theme={theme}
          onToggleTheme={toggleTheme}
          onOpenShortcuts={() => setIsShortcutsModalOpen(true)}
        />

        <div className="content-container">
          {/* Quick Save Bar always accessible */}
          <QuickSaveBar
            categories={categories}
            onSave={handleQuickSave}
            onSelectReel={handleSelectReelById}
          />

          {/* Tags view specific header */}
          {currentTab === 'tags' && (
            <div
              style={{
                marginTop: 'var(--space-5)',
                backgroundColor: 'var(--bg-surface)',
                padding: 'var(--space-4)',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
                <Hash size={18} color="var(--color-primary)" />
                <span>Browse by Index Tags</span>
              </h3>
              {tags.length === 0 ? (
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                  No tags cataloged yet. Add index tags when saving Reels (e.g. #typography, #lighting, #motion).
                </p>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-1)' }}>
                  {tags.map((t) => {
                    const isSelected = filters.tag === t.name;
                    return (
                      <button
                        key={t.id}
                        onClick={() => handleFilterChange({ tag: isSelected ? undefined : t.name })}
                        className="badge badge-tag"
                        style={{
                          padding: 'var(--space-1) var(--space-3)',
                          fontSize: 'var(--font-size-xs)',
                          backgroundColor: isSelected ? 'var(--color-primary)' : undefined,
                          color: isSelected ? '#ffffff' : undefined,
                          borderColor: isSelected ? 'var(--color-primary)' : undefined
                        }}
                      >
                        #{t.name} ({t.count ?? 0})
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Filter Bar with search, category, sort */}
          <FilterBar
            filters={filters}
            onChangeFilters={handleFilterChange}
            categories={categories}
            availableTags={availableTags}
            totalResults={totalReelsCount}
          />

          {/* Reels Content Grid */}
          {isLoadingReels ? (
            <div className="reels-grid">
              {Array.from({ length: 6 }).map((_, idx) => (
                <ReelCardSkeleton key={idx} />
              ))}
            </div>
          ) : reels.length === 0 ? (
            <EmptyState
              icon={
                currentTab === 'favorites'
                  ? Star
                  : currentTab === 'archive'
                  ? Archive
                  : currentTab === 'tags'
                  ? Hash
                  : filters.q
                  ? Search
                  : Bookmark
              }
              title={
                filters.q
                  ? `No Reels found for "${filters.q}"`
                  : currentTab === 'favorites'
                  ? 'No favorite Reels yet'
                  : currentTab === 'archive'
                  ? 'Archive is empty'
                  : currentTab === 'unwatched'
                  ? 'Queue completed: zero unwatched Reels'
                  : currentTab === 'tags' && filters.tag
                  ? `No Reels tagged #${filters.tag}`
                  : 'Your vault ledger is empty'
              }
              description={
                filters.q
                  ? 'Try refining your search keyword or clearing active filters.'
                  : currentTab === 'favorites'
                  ? 'Star any Reel to keep your most valuable reference study items right here.'
                  : currentTab === 'archive'
                  ? 'Archived reels remain searchable while keeping your primary workstation ledger focused.'
                  : currentTab === 'unwatched'
                  ? 'Save additional reels above to build your study queue.'
                  : 'Paste an Instagram Reel URL in the field above and select Save Reel to begin your collection.'
              }
              actionLabel={filters.q || filters.tag ? 'Reset Filters' : undefined}
              onAction={
                filters.q || filters.tag
                  ? () => handleFilterChange({ q: '', tag: undefined })
                  : undefined
              }
            />
          ) : (
            <div className="reels-grid">
              {reels.map((reel) => (
                <ReelCard
                  key={reel.id}
                  reel={reel}
                  onOpenDetails={handleOpenDetailModal}
                  onToggleFavorite={handleToggleFavorite}
                  onToggleWatched={handleToggleWatched}
                  onToggleArchive={handleToggleArchive}
                  onDelete={(id) => setDeletingReelId(id)}
                  onSelectTag={(t) => handleFilterChange({ tag: t })}
                />
              ))}
            </div>
          )}
        </div>

        {/* Mobile Navigation Bar */}
        <MobileNav currentTab={currentTab} onSelectTab={setCurrentTab} />
      </main>

      {/* Modals & Dialogs */}
      <AuthModal
        isOpen={isAuthModalOpen && !isInitializingAuth}
        onSuccess={(user) => {
          setCurrentUser(user);
          setIsAuthModalOpen(false);
          refreshMetadata();
        }}
        onClose={() => {
          if (currentUser) setIsAuthModalOpen(false);
        }}
      />

      <ReelDetailModal
        reel={selectedReel}
        isOpen={isDetailModalOpen}
        categories={categories}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedReel(null);
        }}
        onUpdate={handleUpdateReel}
        onToggleFavorite={handleToggleFavorite}
        onToggleWatched={handleToggleWatched}
        onToggleArchive={handleToggleArchive}
        onDelete={(id) => {
          setIsDetailModalOpen(false);
          setDeletingReelId(id);
        }}
      />

      <StatsModal
        isOpen={isStatsModalOpen}
        stats={stats}
        onClose={() => setIsStatsModalOpen(false)}
        onSelectTag={(tag) => {
          setCurrentTab('tags');
          handleFilterChange({ tag });
        }}
      />

      <ShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />

      <ConfirmDialog
        isOpen={!!deletingReelId}
        title="Delete Saved Reel?"
        message="Are you sure you want to delete this Reel from your vault? This action cannot be undone."
        confirmLabel="Delete Reel"
        isDanger={true}
        onConfirm={handleDeleteReel}
        onCancel={() => setDeletingReelId(null)}
      />
    </div>
  );
};
