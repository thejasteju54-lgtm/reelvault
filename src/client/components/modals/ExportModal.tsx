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
      showToast(`✓ Exported vault as ${format.toUpperCase()}`, 'success');
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-accent-subtle)',
              color: 'var(--color-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Download size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Export Vault Data</h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Download a complete copy of your saved reels & metadata
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button
            onClick={() => handleExport('json')}
            disabled={isExporting}
            className="btn btn-secondary"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              gap: '1rem',
              padding: '1rem',
              textAlign: 'left'
            }}
          >
            <FileJson size={28} color="var(--color-accent)" />
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>JSON Export</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Complete structured export including notes, tags, categories, and timestamps.
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
              gap: '1rem',
              padding: '1rem',
              textAlign: 'left'
            }}
          >
            <FileSpreadsheet size={28} color="var(--color-success)" />
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>CSV Spreadsheet</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Tabular format ideal for Excel, Google Sheets, or Notion database import.
              </div>
            </div>
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
          <button onClick={onClose} className="btn btn-ghost" disabled={isExporting}>
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
};
