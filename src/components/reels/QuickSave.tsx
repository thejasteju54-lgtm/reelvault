import { useState, useRef, useEffect } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { ReelsService } from '../../services/reels';
import { ApiError } from '../../utils/errors';

interface QuickSaveProps {
  onSaveSuccess?: () => void;
}

export function QuickSave({ onSaveSuccess }: QuickSaveProps) {
  const [url, setUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast, success, error } = useToast();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Focus on 'N' key, if not in another input
      if (e.key === 'n' || e.key === 'N') {
        if (
          document.activeElement?.tagName !== 'INPUT' &&
          document.activeElement?.tagName !== 'TEXTAREA'
        ) {
          e.preventDefault();
          inputRef.current?.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setIsSaving(true);
    try {
      await ReelsService.saveReel({ url: url.trim() });
      success('Reel saved!', 'Your reel has been added to the vault.');
      setUrl('');
      onSaveSuccess?.();
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.code === 'DUPLICATE_REEL') {
          toast('Already Saved', 'This reel is already in your vault.', 'info');
        } else {
          error('Save failed', err.message);
        }
      } else {
        error('Unexpected error', 'Something went wrong.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="quick-save-container" style={{ position: 'relative', maxWidth: '600px', width: '100%' }}>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <input
          ref={inputRef}
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste Instagram Reel URL... (Press N to focus)"
          disabled={isSaving}
          required
          style={{
            width: '100%',
            padding: '16px 48px 16px 20px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-subtle)',
            background: 'var(--bg-input)',
            fontSize: 'var(--text-base)',
            boxShadow: 'var(--shadow-sm)',
            transition: 'all var(--transition-fast)',
            outline: 'none',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = 'var(--border-focus)';
            e.target.style.boxShadow = '0 0 0 3px var(--accent-glow)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'var(--border-subtle)';
            e.target.style.boxShadow = 'var(--shadow-sm)';
          }}
        />
        <button
          type="submit"
          disabled={isSaving || !url.trim()}
          style={{
            position: 'absolute',
            right: '8px',
            background: 'var(--accent-primary)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius-full)',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: isSaving || !url.trim() ? 'not-allowed' : 'pointer',
            opacity: isSaving || !url.trim() ? 0.5 : 1,
            transition: 'background var(--transition-fast)',
          }}
        >
          {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Plus size={20} />}
        </button>
      </div>
    </form>
  );
}
