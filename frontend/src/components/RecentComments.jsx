import React, { useState, useEffect } from 'react';
import { getComments } from '../services/api';

const langColors = { en: '#4f8ef7', es: '#f59e0b', ru: '#8b5cf6' };
const langNames = { en: 'English', es: 'Español', ru: 'Русский' };
const sentLabel = { positive: 'Позитив', negative: 'Негатив', neutral: 'Нейтрал' };
const sentCls = { positive: 'b-pos', negative: 'b-neg', neutral: 'b-neu' };

function RecentComments() {
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

  return (
    <div className="lt-card">
      <div className="lt-card-title">Последние комментарии</div>
      {['en', 'es', 'ru'].map(lang => (
        <React.Fragment key={lang}>
          <div className="lang-divider">
            <span className="lang-badge" style={{ background: langColors[lang] }}>{lang.toUpperCase()}</span>
            <span>{langNames[lang]}</span>
          </div>
          {byLang[lang].map((c, i) => (
            <div className="cm-item" key={i}>
              <div className="cm-meta">
                <span className="cm-film">
                  {c.movie ? (c.movie.length > 22 ? c.movie.slice(0, 22) + '…' : c.movie) : '—'}
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
