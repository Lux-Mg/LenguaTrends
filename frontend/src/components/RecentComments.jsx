import React, { useState, useEffect } from 'react';
import { useLang, getLangName } from '../i18n/LangContext';
import { getComments } from '../services/api';

const langColors = { en: '#2ecc71', es: '#e67e22', ru: '#3498db' };

function RecentComments() {
  const { lang, t } = useLang();
  const sentLabel = { positive: t.positive, negative: t.negative, neutral: t.neutral };
  const sentCls = { positive: 'b-pos', negative: 'b-neg', neutral: 'b-neu' };

  const [byLang, setByLang] = useState({ en: [], es: [], ru: [] });

  useEffect(() => {
    Promise.all([
      getComments({ lang: 'en', limit: 2 }),
      getComments({ lang: 'es', limit: 2 }),
      getComments({ lang: 'ru', limit: 2 }),
    ]).then(([en, es, ru]) => {
      setByLang({ en: en.data.comments, es: es.data.comments, ru: ru.data.comments });
    }).catch(console.error);
  }, []);

  const movieTitle = (c) => {
    if (lang === 'es') return c.movie_es || c.movie || '—';
    if (lang === 'ru') return c.movie_ru || c.movie || '—';
    return c.movie || '—';
  };

  return (
    <div className="lt-card">
      <div className="lt-card-title">{t.recentComments}</div>
      {['en', 'es', 'ru'].map(l => (
        <React.Fragment key={l}>
          <div className="lang-divider">
            <span className="lang-badge" style={{ background: langColors[l] }}>{l.toUpperCase()}</span>
            <span>{getLangName(l, lang)}</span>
          </div>
          {byLang[l].map((c, i) => (
            <div className="cm-item" key={i}>
              <div className="cm-meta">
                <span className="cm-film">
                  {(() => { const title = movieTitle(c); return title.length > 22 ? title.slice(0, 22) + '…' : title; })()}
                </span>
                {c.sentiment && (
                  <span className={`bdg ${sentCls[c.sentiment.label]}`} style={{ fontSize: 10, padding: '1px 7px' }}>
                    {sentLabel[c.sentiment.label]}
                  </span>
                )}
              </div>
              <div className="cm-txt">{c.text}</div>
            </div>
          ))}
        </React.Fragment>
      ))}
    </div>
  );
}

export default RecentComments;
