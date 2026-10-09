import React, { useState, useEffect } from 'react';
import {
  ExternalLink,
  Star,
  CheckCircle,
  Archive,
  ArchiveRestore,
  Trash2,
  Copy,
  Calendar,
  Plus
} from 'lucide-react';
import { InstagramIcon } from '../ui/InstagramIcon.js';
import { Reel, Category } from '../../types/index.js';
import { Modal } from '../ui/Modal.js';
import { useToast } from '../ui/Toast.js';

interface ReelDetailModalProps {
  reel: Reel | null;
  isOpen: boolean;
  categories: Category[];
  onClose: () => void;
  onUpdate: (reelId: string, updates: { title?: string; notes?: string; categoryId?: string | null; tags?: string[] }) => Promise<void>;
  onToggleFavorite: (reelId: string) => void;
  onToggleWatched: (reelId: string) => void;
  onToggleArchive: (reelId: string) => void;
  onDelete: (reelId: string) => void;
}

export const ReelDetailModal: React.FC<ReelDetailModalProps> = ({
  reel,
  isOpen,
  categories,
  onClose,
  onUpdate,
  onToggleFavorite,
  onToggleWatched,
  onToggleArchive,
  onDelete
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const { showToast } = useToast();

  useEffect(() => {
    if (reel) {
      setTitle(reel.title || '');
      setNotes(reel.notes || '');
      setCategoryId(reel.categoryId || '');
      setTags(reel.tags || []);
      setIsEditing(false);
    }
  }, [reel]);

  if (!reel) return null;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(reel.canonicalUrl);
      showToast('✓ Copied canonical link to clipboard', 'info');
    } catch {
      showToast('Failed to copy', 'error');
    }
  };

  const handleAddTag = () => {
    const clean = tagInput.trim().toLowerCase().replace(/^#+/, '');
    if (clean && !tags.includes(clean)) {
      setTags([...tags, clean]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (t: string) => {
    setTags(tags.filter((item) => item !== t));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdate(reel.id, {
        title: title.trim() || undefined,
        notes: notes.trim() || undefined,
        categoryId: categoryId || null,
        tags
      });
      showToast('✓ Reel details updated', 'success');
      setIsEditing(false);
    } catch (err: unknown) {
      const e = err as Error;
      showToast(e.message || 'Failed to update Reel', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="600px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Top Header & Actions Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span
              className="badge"
              style={{ background: 'var(--bg-card-hover)', color: 'var(--text-secondary)' }}
            >
              Shortcode: {reel.instagramShortcode}
            </span>
            {reel.categoryName && (
              <span
                className="badge"
                style={{
                  backgroundColor: reel.categoryColor ? `${reel.categoryColor}22` : undefined,
                  color: reel.categoryColor || undefined
                }}
              >
                {reel.categoryName}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <button
              onClick={() => onToggleFavorite(reel.id)}
              className="btn-icon"
              style={{ color: reel.isFavorite ? '#fbbf24' : 'var(--text-muted)' }}
              title={reel.isFavorite ? 'Favorited' : 'Favorite'}
            >
              <Star size={18} fill={reel.isFavorite ? '#fbbf24' : 'none'} />
            </button>
            <button
              onClick={() => onToggleWatched(reel.id)}
              className="btn-icon"
              style={{ color: reel.isWatched ? 'var(--color-success)' : 'var(--text-muted)' }}
              title={reel.isWatched ? 'Watched' : 'Mark watched'}
            >
              <CheckCircle size={18} />
            </button>
            <button
              onClick={() => onToggleArchive(reel.id)}
              className="btn-icon"
              title={reel.isArchived ? 'Restore' : 'Archive'}
            >
              {reel.isArchived ? <ArchiveRestore size={18} /> : <Archive size={18} />}
            </button>
            <button
              onClick={() => onDelete(reel.id)}
              className="btn-icon"
              style={{ color: 'var(--color-danger)' }}
              title="Delete Reel"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        {/* Content View / Edit mode */}
        {isEditing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title..."
                style={{ width: '100%', padding: '0.625rem 0.75rem' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                style={{ width: '100%', padding: '0.625rem 0.75rem' }}
              >
                <option value="">No Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                Tags
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
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
                  placeholder="Add tag and press Enter"
                  style={{ flex: 1, padding: '0.5rem 0.75rem' }}
                />
                <button type="button" onClick={handleAddTag} className="btn btn-secondary">
                  <Plus size={14} />
                  <span>Add</span>
                </button>
              </div>

              {tags.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="badge badge-tag"
                      onClick={() => handleRemoveTag(t)}
                      title="Click to remove"
                    >
                      #{t} ×
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                Personal Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder="Takeaways, action items, tutorial steps..."
                style={{ width: '100%', padding: '0.625rem 0.75rem' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="btn btn-secondary"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="btn btn-primary"
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                {reel.title || `Instagram Reel (${reel.instagramShortcode})`}
              </h2>
              {reel.creatorUsername && (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  By @{reel.creatorUsername}
                </p>
              )}
            </div>

            {/* Notes Section */}
            <div
              style={{
                background: 'var(--bg-app)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem'
              }}
            >
              <h4 style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                NOTES & TAKEAWAYS
              </h4>
              <p
                style={{
                  fontSize: '0.9375rem',
                  lineHeight: 1.6,
                  color: reel.notes ? 'var(--text-primary)' : 'var(--text-muted)',
                  whiteSpace: 'pre-wrap'
                }}
              >
                {reel.notes || 'No notes added yet. Click edit to add your insights.'}
              </p>
            </div>

            {/* Tags */}
            {reel.tags.length > 0 && (
              <div>
                <h4 style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  TAGS
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {reel.tags.map((t) => (
                    <span key={t} className="badge badge-tag">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Timestamps & Info */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '0.75rem',
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                paddingTop: '0.75rem',
                borderTop: '1px solid var(--border-subtle)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Calendar size={14} />
                <span>Saved: {new Date(reel.createdAt).toLocaleString()}</span>
              </div>
              {reel.watchedAt && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-success)' }}>
                  <CheckCircle size={14} />
                  <span>Watched: {new Date(reel.watchedAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.75rem',
                paddingTop: '1rem',
                borderTop: '1px solid var(--border-subtle)'
              }}
            >
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => setIsEditing(true)} className="btn btn-secondary">
                  Edit Details
                </button>
                <button onClick={handleCopyLink} className="btn btn-ghost">
                  <Copy size={14} />
                  <span>Copy Link</span>
                </button>
              </div>

              <a
                href={reel.canonicalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <InstagramIcon size={16} />
                <span>Open on Instagram</span>
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
