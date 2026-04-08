import React from 'react';
import { useLang, getLangName } from '../i18n/LangContext';

const langColors = { ru: '#3498db', en: '#2ecc71', es: '#e67e22' };

function LanguageBar({ stats }) {
  const { lang, t } = useLang();
  if (!stats?.by_language) return null;

  const langs = [
    { key: 'ru', color: langColors.ru },
    { key: 'en', color: langColors.en },
    { key: 'es', color: langColors.es },
  ];

  const total = langs.reduce((s, l) => s + (stats.by_language[l.key] || 0), 0);

  return (
    <div className="lt-card">
      <div className="lt-card-title">{t.langDistribution}</div>
      {langs.map(l => {
        const count = stats.by_language[l.key] || 0;
        const pct = total > 0 ? Math.round(count / total * 100) : 0;
        return (
          <div className="lbar-row" key={l.key}>
            <div className="lbar-top">
              <span style={{ color: '#2c3e50' }}>{getLangName(l.key, lang)}</span>
              <span style={{ color: l.color }}>{pct}%</span>
            </div>
            <div className="lbar-bg">
              <div className="lbar-fill" style={{ width: `${pct}%`, background: l.color }} />
            </div>
          </div>
        );
      })}
      <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #eef0f2' }}>
        <div style={{ fontSize: 11, color: '#95a5a6' }}>{t.totalAnalyzed}</div>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#2c3e50', marginTop: 2 }}>{total.toLocaleString()}</div>
      </div>
    </div>
  );
}

export default LanguageBar;
