import React, { useRef, useEffect } from 'react';
import { Search, X, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { Category, ReelQueryFilters } from '../../types/index.js';

interface FilterBarProps {
  filters: ReelQueryFilters;
  onChangeFilters: (filters: Partial<ReelQueryFilters>) => void;
  categories: Category[];
  availableTags?: { name: string; count?: number }[];
  totalResults: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onChangeFilters,
  categories,
  totalResults
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);

  // '/' key shortcut to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target?.tagName)) return;

      if (e.key === '/') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        marginTop: '1.5rem',
        padding: '0.875rem 1.25rem',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)'
      }}
    >
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Search Input */}
        <div style={{ position: 'relative', flex: '1 1 240px', minWidth: '200px' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)'
            }}
          />
          <input
            ref={searchInputRef}
            type="text"
            value={filters.q || ''}
            onChange={(e) => onChangeFilters({ q: e.target.value })}
            placeholder="Search titles, notes, tags... (Press '/' to search)"
            style={{
              width: '100%',
              padding: '0.55rem 2rem 0.55rem 2.25rem',
              fontSize: '0.875rem'
            }}
          />
          {filters.q && (
            <button
              onClick={() => onChangeFilters({ q: '' })}
              className="btn-icon"
              style={{
                position: 'absolute',
                right: '0.4rem',
                top: '50%',
                transform: 'translateY(-50%)',
                padding: '2px'
              }}
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Watch Status Selector */}
        <div style={{ display: 'flex', background: 'var(--bg-app)', borderRadius: 'var(--radius-md)', padding: '2px' }}>
          {(['all', 'unwatched', 'watched'] as const).map((st) => {
            const isSelected = (filters.status || 'all') === st;
            return (
              <button
                key={st}
                onClick={() => onChangeFilters({ status: st })}
                style={{
                  padding: '0.4rem 0.75rem',
                  fontSize: '0.75rem',
                  fontWeight: isSelected ? 600 : 500,
                  borderRadius: 'var(--radius-sm)',
                  color: isSelected ? 'var(--text-primary)' : 'var(--text-muted)',
                  background: isSelected ? 'var(--bg-card)' : 'transparent',
                  boxShadow: isSelected ? 'var(--shadow-sm)' : 'none',
                  textTransform: 'capitalize'
                }}
              >
                {st}
              </button>
            );
          })}
        </div>

        {/* Category Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <select
            value={filters.categoryId || ''}
            onChange={(e) => onChangeFilters({ categoryId: e.target.value || undefined })}
            style={{
              padding: '0.45rem 0.75rem',
              fontSize: '0.8125rem',
              minWidth: '130px'
            }}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <select
            value={filters.sort || 'newest'}
            onChange={(e) =>
              onChangeFilters({
                sort: e.target.value as 'newest' | 'oldest' | 'updated' | 'alphabetical'
              })
            }
            style={{
              padding: '0.45rem 0.75rem',
              fontSize: '0.8125rem'
            }}
          >
            <option value="newest">Newest Saved</option>
            <option value="oldest">Oldest Saved</option>
            <option value="updated">Recently Updated</option>
            <option value="alphabetical">Alphabetical</option>
          </select>
        </div>
      </div>

      {/* Active Filter Chips & Result Count */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span>
            {totalResults} {totalResults === 1 ? 'Reel' : 'Reels'} found
          </span>

          {filters.tag && (
            <span
              className="badge badge-tag"
              onClick={() => onChangeFilters({ tag: undefined })}
              title="Remove tag filter"
            >
              Tag: #{filters.tag} <X size={10} style={{ marginLeft: 3 }} />
            </span>
          )}

          {filters.categoryId && (
            <span
              className="badge"
              onClick={() => onChangeFilters({ categoryId: undefined })}
              style={{ cursor: 'pointer' }}
              title="Remove category filter"
            >
              Category: {categories.find((c) => c.id === filters.categoryId)?.name}{' '}
              <X size={10} style={{ marginLeft: 3 }} />
            </span>
          )}

          {filters.favorite && (
            <span
              className="badge"
              onClick={() => onChangeFilters({ favorite: undefined })}
              style={{ cursor: 'pointer', color: '#fbbf24' }}
            >
              ★ Favorites Only <X size={10} style={{ marginLeft: 3 }} />
            </span>
          )}
        </div>

        {(filters.q || filters.tag || filters.categoryId || filters.status !== 'all') && (
          <button
            onClick={() =>
              onChangeFilters({
                q: '',
                tag: undefined,
                categoryId: undefined,
                status: 'all'
              })
            }
            className="btn-ghost"
            style={{ fontSize: '0.75rem', padding: '0.2rem 0.4rem', color: 'var(--color-accent)' }}
          >
            Reset Filters
          </button>
        )}
      </div>
    </div>
  );
};
