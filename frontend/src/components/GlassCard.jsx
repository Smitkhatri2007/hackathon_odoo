import React from 'react';

const GlassCard = ({ children, title, className = '', style = {} }) => {
  return (
    <div
      className={`glass-card ${className}`}
      style={{
        background: 'var(--bg-card)',
        backdropFilter: 'blur(16px)',
        border: '1px solid var(--border-card)',
        borderRadius: '16px',
        padding: '1.5rem',
        boxShadow: 'var(--shadow-md)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        ...style
      }}
    >
      {title && (
        <h3
          style={{
            fontSize: '1.2rem',
            fontWeight: 600,
            marginBottom: '1rem',
            color: 'var(--text-main)',
          }}
        >
          {title}
        </h3>
      )}
      {children}
    </div>
  );
};

export default GlassCard;
