import { useState, useEffect } from 'react';
import { Hash, Loader2 } from 'lucide-react';
import { TaxonomyService } from '../services/taxonomy';
import type { Tag } from '../types/database';
import { EmptyState } from '../components/ui/EmptyState';
import { useToast } from '../contexts/ToastContext';
import { useNavigate } from 'react-router-dom';

export function Tags() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { error } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    TaxonomyService.getTags()
      .then(setTags)
      .catch(err => error('Failed to load tags', err.message))
      .finally(() => setIsLoading(false));
  }, [error]);

  const handleTagClick = (tagName: string) => {
    // Navigate to saved reels with the tag filter (needs URL param support)
    // For now, we can just navigate to saved and ideally pass state or a query param.
    navigate(`/saved?tag=${encodeURIComponent(tagName)}`);
  };

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">Tags</h1>
        <p className="page-subtitle">Organize your collection with tags.</p>
      </header>

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-12)' }}>
          <Loader2 size={32} className="animate-spin" style={{ color: 'var(--accent-primary)' }} />
        </div>
      ) : tags.length === 0 ? (
        <EmptyState
          icon={Hash}
          title="No tags yet"
          subtitle="Add tags to your reels to organize them."
        />
      ) : (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 'var(--space-3)'
        }}>
          {tags.map(tag => (
            <button
              key={tag.id}
              onClick={() => handleTagClick(tag.name)}
              className="animate-fade-in"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                padding: 'var(--space-3) var(--space-4)',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-card)',
                borderRadius: 'var(--radius-full)',
                color: 'var(--text-primary)',
                fontSize: 'var(--text-sm)',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                boxShadow: 'var(--shadow-sm)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent-primary)';
                e.currentTarget.style.color = 'var(--accent-primary)';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-card)';
                e.currentTarget.style.color = 'var(--text-primary)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
              }}
            >
              <Hash size={16} />
              {tag.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
