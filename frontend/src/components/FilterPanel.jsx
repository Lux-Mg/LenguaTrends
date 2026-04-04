import React from 'react';

function FilterPanel({ filters, onFilterChange, movies, showSentimentFilter }) {
  const pill = (active) => `lt-pill ${active ? 'on' : ''}`;

  return (
    <div className="lt-filter">
      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <span className="lt-filter-label">Язык:</span>
        {[{ v: null, l: 'Все' }, { v: 'en', l: 'EN' }, { v: 'es', l: 'ES' }, { v: 'ru', l: 'RU' }].map(o => (
          <button key={o.l} onClick={() => onFilterChange({ ...filters, lang: o.v })}
            className={pill(filters.lang === o.v)}>{o.l}</button>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <span className="lt-filter-label">Период:</span>
        {[{ v: null, l: 'Все' }, { v: 7, l: '7д' }, { v: 30, l: '30д' }, { v: 90, l: '90д' }].map(o => (
          <button key={o.l} onClick={() => onFilterChange({ ...filters, period: o.v })}
            className={pill(filters.period === o.v)}>{o.l}</button>
        ))}
      </div>
      {showSentimentFilter && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span className="lt-filter-label">Тональность:</span>
          {[{ v: null, l: 'Все' }, { v: 'positive', l: 'Позитив' }, { v: 'neutral', l: 'Нейтрал' }, { v: 'negative', l: 'Негатив' }].map(o => (
            <button key={o.l} onClick={() => onFilterChange({ ...filters, sentiment: o.v })}
              className={pill(filters.sentiment === o.v)}>{o.l}</button>
          ))}
        </div>
      )}
      {movies && movies.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span className="lt-filter-label">Фильм:</span>
          <select className="lt-select" value={filters.movieId || ''}
            onChange={(e) => onFilterChange({ ...filters, movieId: e.target.value || null })}>
            <option value="">Все</option>
            {movies.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
          </select>
        </div>
      )}
    </div>
  );
}

export default FilterPanel;
