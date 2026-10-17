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
import { vaultStorage } from './services/vaultStorage.js';
import { analytics } from './services/analytics.js';
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
import { CookieBanner } from './components/ui/CookieBanner.js';
import { PrivacyPolicy } from './components/legal/PrivacyPolicy.js';
import { TermsOfService } from './components/legal/TermsOfService.js';
import { NotFoundPage } from './components/ui/NotFoundPage.js';
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

  // Navigation tab state initialized from URL path
  const [currentTab, setCurrentTab] = useState<ActiveTab>(() => {
    if (typeof window !== 'undefined') {
      const p = window.location.pathname;
      if (p === '/privacy') return 'privacy';
      if (p === '/terms') return 'terms';
      if (p === '/' || p === '') return 'dashboard';
      return 'not-found';
    }
    return 'dashboard';
  });

  // Vault data state with offline-first client storage
  const [reels, setReels] = useState<Reel[]>(() => vaultStorage.loadReels());
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [stats, setStats] = useState<VaultStats | null>(null);
  const [totalReelsCount, setTotalReelsCount] = useState(() => vaultStorage.loadReels().length);
  const [isLoadingReels, setIsLoadingReels] = useState(false);
  const [isEmbedMode, setIsEmbedMode] = useState(false);

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

  // Route Synchronization with Browser History
  useEffect(() => {
    const handlePopState = () => {
      const p = window.location.pathname;
      if (p === '/privacy') {
        setCurrentTab('privacy');
      } else if (p === '/terms') {
        setCurrentTab('terms');
      } else if (p === '/' || p === '') {
        setCurrentTab('dashboard');
      } else {
        setCurrentTab('not-found');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = useCallback((tab: ActiveTab, path?: string) => {
    setCurrentTab(tab);
    const targetPath = path || (tab === 'privacy' ? '/privacy' : tab === 'terms' ? '/terms' : '/');
    if (window.location.pathname !== targetPath) {
      window.history.pushState(null, '', targetPath);
    }
    if (tab !== 'privacy' && tab !== 'terms' && tab !== 'not-found') {
      document.title = 'ReelVault: Personal Instagram Reel Bookmark Vault';
    }
    analytics.pageView(targetPath);
  }, []);

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
        // Only open auth modal on app dashboard, not when viewing legal docs directly
        if (currentTab !== 'privacy' && currentTab !== 'terms') {
          setIsAuthModalOpen(true);
        }
        return;
      }

      try {
        const user = await api.auth.me();
        setCurrentUser(user);
      } catch {
        api.auth.logout();
        if (currentTab !== 'privacy' && currentTab !== 'terms') {
          setIsAuthModalOpen(true);
        }
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
  }, [currentTab, showToast]);

  // Load vault metadata (categories, tags, stats)
  const refreshMetadata = useCallback(async () => {
    if (!currentUser) return;
    try {
      const [cats, tgs, sts] = await Promise.all([
        api.categories.list(),
        api.tags.list(),
        api.stats.get()
      ]);
      setCategories(cats);
      setTags(tgs);
      setStats(sts);
    } catch {
      // Quiet fail on background stats refresh
    }
  }, [currentUser]);

  // Hydrate local cache on user sign in
  useEffect(() => {
    if (currentUser) {
      const cached = vaultStorage.loadReels(currentUser.id);
      if (cached.length > 0) {
        setReels(cached);
        setTotalReelsCount(cached.length);
      }
    }
  }, [currentUser]);

  // Load reels with current filters
  const loadReels = useCallback(async () => {
    if (!currentUser) return;
    setIsLoadingReels(true);

    try {
      const queryParams: ReelQueryFilters = {
        ...filters,
        limit: 50
      };

      if (currentTab === 'favorites') {
        queryParams.favorite = true;
        queryParams.archived = false;
      } else if (currentTab === 'archive') {
        queryParams.archived = true;
      } else if (currentTab === 'saved') {
        queryParams.archived = false;
      } else if (currentTab === 'dashboard') {
        queryParams.archived = false;
      }

      const res = await api.reels.list(queryParams);
      const cached = vaultStorage.loadReels(currentUser.id);
      const isFiltering = Boolean(
        filters.q ||
        filters.tag ||
        filters.categoryId ||
        (filters.status && filters.status !== 'all') ||
        currentTab !== 'dashboard'
      );

      let displayReels: Reel[];
      if (!isFiltering) {
        displayReels = vaultStorage.mergeReels(cached, res.reels);
        vaultStorage.saveReels(currentUser.id, displayReels);

        // If local cache has reels missing from this serverless instance, sync them back
        if (displayReels.length > res.reels.length) {
          api.reels.sync(displayReels).catch((err) => console.warn('[Sync] Serverless hydration:', err));
        }
      } else {
        displayReels = res.reels;
      }

      setReels(displayReels);
      setTotalReelsCount(isFiltering ? res.total : displayReels.length);
    } catch {
      const cached = vaultStorage.loadReels(currentUser?.id);
      if (cached.length > 0) {
        setReels(cached);
        setTotalReelsCount(cached.length);
      } else {
        showToast('Failed to load reels. Please refresh.', 'error');
      }
    } finally {
      setIsLoadingReels(false);
    }
  }, [currentUser, currentTab, filters, showToast]);

  useEffect(() => {
    if (currentUser && currentTab !== 'privacy' && currentTab !== 'terms' && currentTab !== 'not-found') {
      loadReels();
      refreshMetadata();
    }
  }, [currentUser, currentTab, filters, loadReels, refreshMetadata]);

  // Handle Quick Save with immediate local persistence and background server sync
  const handleQuickSave = async (payload: {
    url: string;
    title?: string;
    notes?: string;
    categoryId?: string;
    tags?: string[];
    thumbnailUrl?: string;
    website?: string;
  }) => {
    let saved: Reel | null = null;
    try {
      saved = await api.reels.save(payload);
    } catch (err: unknown) {
      const apiErr = err as Error & { code?: string; existingReelId?: string };
      if (apiErr.code === 'DUPLICATE_REEL') {
        showToast('This Reel is already saved in your vault.', 'info');
        if (apiErr.existingReelId) {
          handleSelectReelById(apiErr.existingReelId);
        }
        return null as unknown as Reel;
      }
      throw err;
    }

    if (saved) {
      // Instantly update local cache and state so reel never disappears
      const updated = vaultStorage.addOrUpdateReel(currentUser?.id, saved);
      setReels(updated);
      setTotalReelsCount(updated.length);

      analytics.trackEvent('reel_saved', { hasTags: Boolean(payload.tags && payload.tags.length > 0) });

      // Background sync to ensure all serverless instances have the full list
      api.reels.sync(updated).catch(() => {});
      refreshMetadata().catch(() => {});
    }
    return saved;
  };

  const handleFilterChange = (newFilters: Partial<ReelQueryFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    if (newFilters.q) {
      analytics.trackEvent('search_performed', { q: newFilters.q });
    }
  };

  const handleToggleFavorite = async (reelId: string) => {
    const currentReel = reels.find((r) => r.id === reelId);
    const newFavorite = currentReel ? !currentReel.isFavorite : true;
    const updatedList = reels.map((r) => (r.id === reelId ? { ...r, isFavorite: newFavorite } : r));
    setReels(updatedList);
    vaultStorage.saveReels(currentUser?.id, updatedList);

    try {
      const updated = await api.reels.toggleFavorite(reelId);
      vaultStorage.addOrUpdateReel(currentUser?.id, updated);
      refreshMetadata();
    } catch {
      showToast('Failed to update favorite', 'error');
      loadReels();
    }
  };

  const handleToggleWatched = async (reelId: string) => {
    const currentReel = reels.find((r) => r.id === reelId);
    const newWatched = currentReel ? !currentReel.isWatched : true;
    const updatedList = reels.map((r) => (r.id === reelId ? { ...r, isWatched: newWatched } : r));
    setReels(updatedList);
    vaultStorage.saveReels(currentUser?.id, updatedList);

    try {
      const updated = await api.reels.toggleWatched(reelId);
      vaultStorage.addOrUpdateReel(currentUser?.id, updated);
      refreshMetadata();
    } catch {
      showToast('Failed to update watched status', 'error');
      loadReels();
    }
  };

  const handleToggleArchive = async (reelId: string) => {
    try {
      const updated = await api.reels.toggleArchive(reelId);
      vaultStorage.addOrUpdateReel(currentUser?.id, updated);
      showToast('Reel archive status updated', 'success');
      loadReels();
      refreshMetadata();
    } catch {
      showToast('Failed to update archive status', 'error');
    }
  };

  const handleUpdateReel = async (
    reelId: string,
    updates: { title?: string; notes?: string; categoryId?: string | null; tags?: string[]; thumbnailUrl?: string | null }
  ) => {
    const updated = await api.reels.update(reelId, updates);
    vaultStorage.addOrUpdateReel(currentUser?.id, updated);
    await Promise.all([loadReels(), refreshMetadata()]);
    if (selectedReel?.id === reelId) {
      setSelectedReel(updated);
    }
  };

  const handleDeleteReel = async () => {
    if (!deletingReelId) return;
    try {
      await api.reels.delete(deletingReelId);
      const remaining = vaultStorage.removeReel(currentUser?.id, deletingReelId);
      setReels(remaining);
      setTotalReelsCount(remaining.length);

      showToast('Reel deleted from vault', 'success');
      setDeletingReelId(null);
      if (selectedReel?.id === deletingReelId) {
        setIsDetailModalOpen(false);
        setSelectedReel(null);
      }
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
          navigateTo('dashboard', '/');
        } else if (keyLower === 's') {
          e.preventDefault();
          navigateTo('saved', '/');
        } else if (keyLower === 'f') {
          e.preventDefault();
          navigateTo('favorites', '/');
        } else if (keyLower === 'a') {
          e.preventDefault();
          navigateTo('archive', '/');
        } else if (keyLower === 't') {
          e.preventDefault();
          navigateTo('tags', '/');
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
  }, [navigateTo]);

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
          navigateTo(tab);
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
        onNavigateToPrivacy={() => navigateTo('privacy', '/privacy')}
        onNavigateToTerms={() => navigateTo('terms', '/terms')}
        onResetCookieConsent={() => analytics.resetConsent()}
      />

      {/* Main Content Area */}
      <main className="app-main">
        <Header
          currentUser={currentUser}
          theme={theme}
          onToggleTheme={toggleTheme}
          onOpenShortcuts={() => setIsShortcutsModalOpen(true)}
        />

        {/* View Router */}
        {currentTab === 'privacy' ? (
          <PrivacyPolicy onBack={() => navigateTo('dashboard', '/')} />
        ) : currentTab === 'terms' ? (
          <TermsOfService onBack={() => navigateTo('dashboard', '/')} />
        ) : currentTab === 'not-found' ? (
          <NotFoundPage onGoHome={() => navigateTo('dashboard', '/')} />
        ) : (
          <div className="content-container">
            {/* Quick Save Bar always accessible (Primary CTA) */}
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

            {/* Saved Reels Section Header */}
            {reels.length > 0 && (
              <div style={{ marginTop: 'var(--space-5)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Your Saved Reels ({totalReelsCount})
                </h3>
              </div>
            )}

            {/* Filter Bar with search, category, sort - shown when vault has records or filters active */}
            {(reels.length > 0 || filters.q || filters.tag || filters.categoryId || (filters.status && filters.status !== 'all')) && (
              <FilterBar
                filters={filters}
                onChangeFilters={handleFilterChange}
                categories={categories}
                availableTags={availableTags}
                totalResults={totalReelsCount}
                isEmbedMode={isEmbedMode}
                onToggleEmbedMode={() => setIsEmbedMode((prev) => !prev)}
              />
            )}

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
                    isEmbedMode={isEmbedMode}
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
        )}

        {/* Mobile Navigation Bar */}
        <MobileNav currentTab={currentTab} onSelectTab={(tab) => navigateTo(tab)} />
      </main>

      {/* Cookie Consent Banner (Items 5 & 19) */}
      <CookieBanner onNavigateToPrivacy={() => navigateTo('privacy', '/privacy')} />

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
        onNavigateToPrivacy={() => navigateTo('privacy', '/privacy')}
        onNavigateToTerms={() => navigateTo('terms', '/terms')}
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
          navigateTo('tags', '/');
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
