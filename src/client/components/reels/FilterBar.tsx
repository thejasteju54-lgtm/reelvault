import React, { useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
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
        gap: 'var(--space-3)',
        marginTop: 'var(--space-5)',
        padding: 'var(--space-3) var(--space-4)',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius)'
      }}
    >
      <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Search Input */}
        <div style={{ position: 'relative', flex: '1 1 240px', minWidth: '200px' }}>
          <Search
            size={15}
            style={{
              position: 'absolute',
              left: 'var(--space-3)',
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
            placeholder="Search records by title, notes, tags (Press '/')"
            style={{
              width: '100%',
              padding: 'var(--space-2) 2rem var(--space-2) 2.25rem',
              fontSize: 'var(--font-size-xs)'
            }}
          />
          {filters.q && (
            <button
              onClick={() => onChangeFilters({ q: '' })}
              className="btn-icon"
              style={{
                position: 'absolute',
                right: 'var(--space-2)',
                top: '50%',
                transform: 'translateY(-50%)',
                padding: '2px'
              }}
              aria-label="Clear search"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Watch Status Segmented Filter */}
        <div
          style={{
            display: 'flex',
            backgroundColor: 'var(--bg-app)',
            borderRadius: 'var(--radius)',
            padding: '2px',
            border: '1px solid var(--border-subtle)'
          }}
        >
          {(['all', 'unwatched', 'watched'] as const).map((st) => {
            const isSelected = (filters.status || 'all') === st;
            return (
              <button
                key={st}
                onClick={() => onChangeFilters({ status: st })}
                style={{
                  padding: 'var(--space-1) var(--space-3)',
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: isSelected ? 600 : 500,
                  borderRadius: 'var(--radius)',
                  color: isSelected ? 'var(--text-primary)' : 'var(--text-muted)',
                  backgroundColor: isSelected ? 'var(--bg-surface)' : 'transparent',
                  border: isSelected ? '1px solid var(--border-subtle)' : '1px solid transparent',
                  textTransform: 'capitalize',
                  transition: 'all var(--transition-fast)'
                }}
              >
                {st}
              </button>
            );
          })}
        </div>

        {/* Category Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <select
            value={filters.categoryId || ''}
            onChange={(e) => onChangeFilters({ categoryId: e.target.value || undefined })}
            style={{
              padding: 'var(--space-2) var(--space-3)',
              fontSize: 'var(--font-size-xs)',
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <select
            value={filters.sort || 'newest'}
            onChange={(e) =>
              onChangeFilters({
                sort: e.target.value as 'newest' | 'oldest' | 'updated' | 'alphabetical'
              })
            }
            style={{
              padding: 'var(--space-2) var(--space-3)',
              fontSize: 'var(--font-size-xs)'
            }}
          >
            <option value="newest">Cataloged: Newest</option>
            <option value="oldest">Cataloged: Oldest</option>
            <option value="updated">Recently Updated</option>
            <option value="alphabetical">Title: A to Z</option>
          </select>
        </div>
      </div>

      {/* Active Filter Ledger & Entry Count */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: 'var(--font-size-xs)',
          color: 'var(--text-muted)',
          flexWrap: 'wrap',
          gap: 'var(--space-2)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'var(--font-mono)' }}>
            {totalResults} {totalResults === 1 ? 'record' : 'records'}
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
              style={{ cursor: 'pointer', color: 'var(--color-accent)' }}
            >
              Favorites Only <X size={10} style={{ marginLeft: 3 }} />
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
            style={{
              fontSize: 'var(--font-size-xs)',
              padding: '2px var(--space-2)',
              color: 'var(--color-primary)'
            }}
          >
            Reset Filters
          </button>
        )}
      </div>
    </div>
  );
};
