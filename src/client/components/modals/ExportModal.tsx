import React, { useState } from 'react';
import { Download, FileJson, FileSpreadsheet } from 'lucide-react';
import { Modal } from '../ui/Modal.js';
import { api } from '../../services/api.js';
import { useToast } from '../ui/Toast.js';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const [isExporting, setIsExporting] = useState(false);
  const { showToast } = useToast();

  const handleExport = async (format: 'json' | 'csv') => {
    setIsExporting(true);
    try {
      await api.export.download(format);
      showToast(`Exported vault as ${format.toUpperCase()}`, 'success');
      onClose();
    } catch (err: unknown) {
      const e = err as Error;
      showToast(e.message || 'Export failed. Please try again.', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="440px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--radius)',
              backgroundColor: 'var(--bg-surface-active)',
              color: 'var(--color-primary)',
              border: '1px solid var(--border-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Download size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600 }}>Export Vault Data</h3>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
              Download a complete archive copy of saved reels and metadata
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <button
            onClick={() => handleExport('json')}
            disabled={isExporting}
            className="btn btn-secondary"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              gap: 'var(--space-3)',
              padding: 'var(--space-3)',
              textAlign: 'left'
            }}
          >
            <FileJson size={24} color="var(--color-primary)" />
            <div>
              <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>JSON Archive</div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                Structured JSON file containing notes, tags, categories, and ISO timestamps.
              </div>
            </div>
          </button>

          <button
            onClick={() => handleExport('csv')}
            disabled={isExporting}
            className="btn btn-secondary"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              gap: 'var(--space-3)',
              padding: 'var(--space-3)',
              textAlign: 'left'
            }}
          >
            <FileSpreadsheet size={24} color="var(--color-success)" />
            <div>
              <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>CSV Table</div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                Tabular format compatible with Excel, Google Sheets, or database import tools.
              </div>
            </div>
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-2)' }}>
          <button onClick={onClose} className="btn btn-ghost" disabled={isExporting}>
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
};
