import React from 'react';
import { useLang, getTitle } from '../i18n/LangContext';

function FilterPanel({ filters, onFilterChange, movies, showSentimentFilter }) {
  const { lang, t } = useLang();
  const pill = (active) => `lt-pill ${active ? 'on' : ''}`;

  return (
    <div className="lt-filter">
      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <span className="lt-filter-label">{t.filterLang}</span>
        {[{ v: null, l: t.filterAll }, { v: 'en', l: 'EN' }, { v: 'es', l: 'ES' }, { v: 'ru', l: 'RU' }].map(o => (
          <button key={o.l} onClick={() => onFilterChange({ ...filters, lang: o.v })}
            className={pill(filters.lang === o.v)}>{o.l}</button>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <span className="lt-filter-label">{t.filterPeriod}</span>
        {[{ v: null, l: t.filterAll }, { v: 7, l: t.days7 }, { v: 30, l: t.days30 }, { v: 90, l: t.days90 }].map(o => (
          <button key={o.l} onClick={() => onFilterChange({ ...filters, period: o.v })}
            className={pill(filters.period === o.v)}>{o.l}</button>
        ))}
      </div>
      {showSentimentFilter && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span className="lt-filter-label">{t.filterSentiment}</span>
          {[{ v: null, l: t.filterAll }, { v: 'positive', l: t.positive }, { v: 'neutral', l: t.neutral }, { v: 'negative', l: t.negative }].map(o => (
            <button key={o.l} onClick={() => onFilterChange({ ...filters, sentiment: o.v })}
              className={pill(filters.sentiment === o.v)}>{o.l}</button>
          ))}
        </div>
      )}
      {movies && movies.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span className="lt-filter-label">{t.filterMovie}</span>
          <select className="lt-select" value={filters.movieId || ''}
            onChange={(e) => onFilterChange({ ...filters, movieId: e.target.value || null })}>
            <option value="">{t.filterAll}</option>
            {movies.map(m => <option key={m.id} value={m.id}>{getTitle(m, lang)}</option>)}
          </select>
        </div>
      )}
    </div>
  );
}

export default FilterPanel;
