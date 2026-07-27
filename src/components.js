import React from 'react';

export const StatCard = ({ label, amount, color }) => (
  <div style={{ background: 'white', borderRadius: '8px', padding: '16px', border: '1px solid #E0E0E0' }}>
    <p style={{ fontSize: '11px', color: '#666666', marginBottom: '8px' }}>{label}</p>
    <p style={{ fontSize: '24px', fontWeight: '600', color, margin: 0 }}>KES {parseFloat(amount).toLocaleString()}</p>
  </div>
);

export const Card = ({ title, children, style }) => (
  <div style={{ background: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #E0E0E0', ...style }}>
    {title && <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#194342', margin: '0 0 12px' }}>{title}</h3>}
    {children}
  </div>
);

export const ProgressBar = ({ value, max }) => (
  <div style={{ width: '100%', height: '6px', background: '#E0E0E0', borderRadius: '3px', marginTop: '8px', overflow: 'hidden' }}>
    <div style={{ height: '100%', borderRadius: '3px', width: `${Math.min((value / max) * 100, 100)}%`, background: '#1D9E75' }} />
  </div>
);