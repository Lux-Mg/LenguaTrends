import React from 'react';

const langs = [
  { key: 'ru', label: 'Русский', color: '#8b5cf6' },
  { key: 'en', label: 'English', color: '#4f8ef7' },
  { key: 'es', label: 'Español', color: '#f59e0b' },
];

function LanguageBar({ stats }) {
  if (!stats?.by_language) return null;

  const total = langs.reduce((s, l) => s + (stats.by_language[l.key] || 0), 0);
  const unsupported = stats.total_comments - total;

  return (
    <div className="lt-card">
      <div className="lt-card-title">Распределение по языкам</div>
      {langs.map(l => {
        const count = stats.by_language[l.key] || 0;
        const pct = total > 0 ? Math.round(count / total * 100) : 0;
        return (
          <div className="lbar-row" key={l.key}>
            <div className="lbar-top">
              <span style={{ color: '#94a3b8' }}>{l.label}</span>
              <span style={{ color: l.color }}>{pct}%</span>
            </div>
            <div className="lbar-bg">
              <div className="lbar-fill" style={{ width: `${pct}%`, background: l.color }} />
            </div>
          </div>
        );
      })}
      <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontSize: 11, color: '#334155' }}>Всего проанализировано</div>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0', marginTop: 2 }}>{total.toLocaleString()}</div>
      </div>
    </div>
  );
}

export default LanguageBar;
