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
          background: 'var(--border-subtle)'
        }}
      />
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ height: 16, width: '70%', background: 'var(--border-subtle)', borderRadius: 4 }} />
        <div style={{ height: 12, width: '40%', background: 'var(--border-subtle)', borderRadius: 4 }} />
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
          <div style={{ height: 20, width: 50, background: 'var(--border-subtle)', borderRadius: 10 }} />
          <div style={{ height: 20, width: 60, background: 'var(--border-subtle)', borderRadius: 10 }} />
        </div>
        <div
          style={{
            height: 32,
            width: '100%',
            background: 'var(--border-subtle)',
            borderRadius: 6,
            marginTop: '0.75rem'
          }}
        />
      </div>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
};
