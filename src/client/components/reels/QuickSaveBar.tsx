import React, { useState, useRef, useEffect } from 'react';
import { BookmarkPlus, Plus, Clipboard, Tag, ChevronDown, ChevronUp, AlertCircle, ExternalLink } from 'lucide-react';
import { Category, Reel } from '../../types/index.js';
import { useToast } from '../ui/Toast.js';

interface QuickSaveBarProps {
  categories: Category[];
  onSave: (payload: {
    url: string;
    title?: string;
    notes?: string;
    categoryId?: string;
    tags?: string[];
  }) => Promise<Reel>;
  onSelectReel: (reelId: string) => void;
}

export const QuickSaveBar: React.FC<QuickSaveBarProps> = ({
  categories,
  onSave,
  onSelectReel
}) => {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [duplicateReelId, setDuplicateReelId] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  // 'N' key global shortcut to focus Save input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if already inside an input or textarea
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target?.tagName)) return;

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleAddTag = () => {
    const clean = tagInput.trim().toLowerCase().replace(/^#+/, '');
    if (clean && !tags.includes(clean)) {
      setTags([...tags, clean]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text);
        setDuplicateReelId(null);
        showToast('Pasted from clipboard', 'info', 1500);
      }
    } catch {
      showToast('Clipboard access denied. Please paste manually.', 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setIsSubmitting(true);
    setDuplicateReelId(null);

    try {
      await onSave({
        url: url.trim(),
        title: title.trim() || undefined,
        notes: notes.trim() || undefined,
        categoryId: categoryId || undefined,
        tags: tags.length > 0 ? tags : undefined
      });

      showToast('✓ Reel saved to your vault', 'success');
      // Reset form fields
      setUrl('');
      setTitle('');
      setNotes('');
      setCategoryId('');
      setTags([]);
      setIsExpanded(false);

      // Keep focus in input for rapid batch saving
      setTimeout(() => inputRef.current?.focus(), 50);
    } catch (err: unknown) {
      const apiErr = err as Error & { code?: string; existingReelId?: string };
      if (apiErr.code === 'DUPLICATE_REEL') {
        setDuplicateReelId(apiErr.existingReelId || null);
        showToast('✕ This Reel is already saved in your vault.', 'error');
      } else {
        showToast(apiErr.message || 'Unable to save Reel. Check the URL.', 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-xl)',
        padding: '1.25rem',
        boxShadow: 'var(--shadow-md)',
        position: 'relative'
      }}
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {/* Main URL input row */}
        <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
            <input
              ref={inputRef}
              type="text"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setDuplicateReelId(null);
              }}
              placeholder="Paste Instagram Reel URL... (Press 'N' to focus)"
              style={{
                width: '100%',
                padding: '0.75rem 2.5rem 0.75rem 1rem',
                fontSize: '0.9375rem'
              }}
              disabled={isSubmitting}
            />

            {/* Paste button icon inside input */}
            <button
              type="button"
              onClick={handlePasteFromClipboard}
              className="btn-icon"
              style={{
                position: 'absolute',
                right: '0.5rem',
                padding: '0.35rem',
                color: 'var(--text-muted)'
              }}
              title="Paste from clipboard"
              aria-label="Paste from clipboard"
            >
              <Clipboard size={16} />
            </button>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !url.trim()}
            className="btn btn-primary"
            style={{ padding: '0.75rem 1.25rem', minWidth: '120px' }}
          >
            <BookmarkPlus size={16} />
            <span>{isSubmitting ? 'Saving...' : 'Save Reel'}</span>
          </button>
        </div>

        {/* Duplicate Reel notification banner */}
        {duplicateReelId && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.625rem 0.875rem',
              background: 'var(--color-warning-bg)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              color: 'var(--text-primary)',
              fontSize: '0.8125rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={16} color="var(--color-warning)" />
              <span>This Reel is already in your vault.</span>
            </div>
            <button
              type="button"
              onClick={() => onSelectReel(duplicateReelId)}
              className="btn btn-ghost"
              style={{
                padding: '0.2rem 0.5rem',
                fontSize: '0.75rem',
                color: 'var(--color-warning)',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}
            >
              <span>View Saved Reel</span>
              <ExternalLink size={12} />
            </button>
          </div>
        )}

        {/* Optional Context Accordion Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="btn-ghost"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              padding: '0.25rem 0.5rem'
            }}
          >
            <span>{isExpanded ? 'Hide optional details' : 'Add details (title, tags, category, notes)'}</span>
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

        {/* Expanded Metadata Section */}
        {isExpanded && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '0.75rem',
              paddingTop: '0.5rem',
              borderTop: '1px solid var(--border-subtle)',
              animation: 'fadeIn 150ms ease'
            }}
          >
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Custom title (optional)"
              style={{ padding: '0.5rem 0.75rem' }}
            />

            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              style={{ padding: '0.5rem 0.75rem' }}
            >
              <option value="">Select category (optional)</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Add tags (press Enter)..."
                style={{ flex: 1, padding: '0.5rem 0.75rem' }}
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="btn btn-secondary"
                style={{ padding: '0.5rem 0.75rem' }}
              >
                <Plus size={14} />
                <span>Add Tag</span>
              </button>
            </div>

            {tags.length > 0 && (
              <div style={{ gridColumn: '1 / -1', display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="badge badge-tag"
                    onClick={() => handleRemoveTag(tag)}
                    title="Click to remove"
                  >
                    #{tag} ×
                  </span>
                ))}
              </div>
            )}

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Personal notes & takeaways (optional)..."
              rows={2}
              style={{ gridColumn: '1 / -1', padding: '0.5rem 0.75rem', resize: 'vertical' }}
            />
          </div>
        )}
      </form>
    </div>
  );
};
