import React from 'react';

export const ReelCardSkeleton: React.FC = () => {
  return (
    <div
      className="reel-card"
      style={{
        opacity: 0.7,
        animation: 'pulse 1.5s infinite ease-in-out'
      }}
    >
      <div
        style={{
          width: '100%',
          height: 180,
          backgroundColor: 'var(--border-subtle)'
        }}
      />
      <div style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <div style={{ height: 16, width: '70%', backgroundColor: 'var(--border-subtle)', borderRadius: 'var(--radius)' }} />
        <div style={{ height: 12, width: '40%', backgroundColor: 'var(--border-subtle)', borderRadius: 'var(--radius)' }} />
        <div style={{ display: 'flex', gap: 'var(--space-1)', marginTop: 'var(--space-2)' }}>
          <div style={{ height: 18, width: 48, backgroundColor: 'var(--border-subtle)', borderRadius: 'var(--radius)' }} />
          <div style={{ height: 18, width: 60, backgroundColor: 'var(--border-subtle)', borderRadius: 'var(--radius)' }} />
        </div>
        <div
          style={{
            height: 28,
            width: '100%',
            backgroundColor: 'var(--border-subtle)',
            borderRadius: 'var(--radius)',
            marginTop: 'var(--space-2)'
          }}
        />
      </div>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 0.25; }
        }
      `}</style>
    </div>
  );
};
