import React, { useState, useRef, useEffect } from 'react';
import { BookmarkPlus, Plus, Clipboard, ChevronDown, ChevronUp, AlertCircle, ArrowUpRight } from 'lucide-react';
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

  const [honeypot, setHoneypot] = useState('');
  const [urlError, setUrlError] = useState<string | null>(null);

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
        setUrlError(null);
        setDuplicateReelId(null);
        showToast('Pasted URL from clipboard', 'info', 1500);
      }
    } catch {
      showToast('Clipboard access denied. Please paste manually.', 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUrlError(null);
    if (!url.trim()) return;

    // Client-side URL validation
    if (!url.includes('instagram.com') && !url.startsWith('http')) {
      setUrlError('Please enter a valid Instagram Reel URL (e.g., https://www.instagram.com/reel/...).');
      return;
    }

    setIsSubmitting(true);
    setDuplicateReelId(null);

    try {
      await onSave({
        url: url.trim(),
        title: title.trim() || undefined,
        notes: notes.trim() || undefined,
        categoryId: categoryId || undefined,
        tags: tags.length > 0 ? tags : undefined,
        website: honeypot || undefined
      });

      showToast('Reel cataloged in vault', 'success');
      // Reset form
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
        showToast('This Reel is already cataloged in your vault.', 'error');
      } else {
        const msg = apiErr.message || 'Unable to save Reel. Verify the URL format.';
        setUrlError(msg);
        showToast(msg, 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius)',
        padding: 'var(--space-4)',
        position: 'relative'
      }}
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {/* Anti-bot honeypot field */}
        <input
          type="text"
          name="website"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
          style={{ display: 'none', position: 'absolute', left: '-9999px' }}
          aria-hidden="true"
        />

        {/* Main URL input row */}
        <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
            <input
              ref={inputRef}
              type="text"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setUrlError(null);
                setDuplicateReelId(null);
              }}
              placeholder="Paste Instagram Reel URL (Press 'N' to focus)"
              style={{
                width: '100%',
                padding: 'var(--space-3) 2.5rem var(--space-3) var(--space-3)',
                fontSize: 'var(--font-size-sm)',
                borderColor: urlError ? 'var(--color-danger)' : undefined
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
                right: 'var(--space-2)',
                padding: 'var(--space-1)',
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
            style={{ padding: 'var(--space-3) var(--space-4)', minWidth: '124px' }}
          >
            <BookmarkPlus size={16} />
            <span>{isSubmitting ? 'Cataloging...' : 'Save Reel'}</span>
          </button>
        </div>

        {urlError && (
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-danger)', marginTop: '-4px' }}>
            {urlError}
          </div>
        )}

        {/* Duplicate Reel notification ledger row */}
        {duplicateReelId && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 'var(--space-2) var(--space-3)',
              backgroundColor: 'var(--bg-surface-active)',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border-muted)',
              color: 'var(--text-primary)',
              fontSize: 'var(--font-size-xs)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <AlertCircle size={15} color="var(--color-primary)" />
              <span>This Reel is already cataloged in your vault.</span>
            </div>
            <button
              type="button"
              onClick={() => onSelectReel(duplicateReelId)}
              className="btn btn-secondary"
              style={{
                padding: '2px var(--space-2)',
                fontSize: 'var(--font-size-xs)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-1)'
              }}
            >
              <span>Inspect Saved Reel</span>
              <ArrowUpRight size={12} />
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
              gap: 'var(--space-1)',
              fontSize: 'var(--font-size-xs)',
              color: 'var(--text-muted)',
              padding: 'var(--space-1) var(--space-2)'
            }}
          >
            <span>{isExpanded ? 'Hide archive fields' : 'Add metadata (title, category, tags, notes)'}</span>
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

        {/* Expanded Metadata Section */}
        {isExpanded && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: 'var(--space-3)',
              paddingTop: 'var(--space-3)',
              borderTop: '1px solid var(--border-subtle)',
              animation: 'modalFadeIn var(--transition-fast)'
            }}
          >
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Descriptive title"
              style={{ padding: 'var(--space-2) var(--space-3)' }}
            />

            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              style={{ padding: 'var(--space-2) var(--space-3)' }}
            >
              <option value="">Assign category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
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
                placeholder="Add index tag (press Enter)"
                style={{ flex: 1, padding: 'var(--space-2) var(--space-3)' }}
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="btn btn-secondary"
                style={{ padding: 'var(--space-2) var(--space-3)' }}
              >
                <Plus size={14} />
                <span>Add Tag</span>
              </button>
            </div>

            {tags.length > 0 && (
              <div style={{ gridColumn: '1 / -1', display: 'flex', flexWrap: 'wrap', gap: 'var(--space-1)' }}>
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="badge badge-tag"
                    onClick={() => handleRemoveTag(tag)}
                    title="Click to remove tag"
                  >
                    #{tag} ×
                  </span>
                ))}
              </div>
            )}

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Curator notes, key techniques, timestamp cues..."
              rows={2}
              style={{ gridColumn: '1 / -1', padding: 'var(--space-2) var(--space-3)', resize: 'vertical' }}
            />
          </div>
        )}
      </form>
    </div>
  );
};
