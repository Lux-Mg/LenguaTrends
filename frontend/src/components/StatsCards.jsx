import React from 'react';

const Icon = ({ color, children }) => (
  <div className="lt-kpi-icon" style={{ background: `${color}15` }}>
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      {children}
    </svg>
  </div>
);

function StatsCards({ stats, trends }) {
  if (!stats) return null;

  const totalSent = stats.by_sentiment.positive + stats.by_sentiment.negative + stats.by_sentiment.neutral;
  const topMovie = trends && trends.length > 0 ? trends[0] : null;

  return (
    <div className="lt-kpi-grid">
      <div className="lt-kpi">
        <div>
          <div className="lt-kpi-label">Комментариев</div>
          <div className="lt-kpi-value">{stats.total_comments?.toLocaleString()}</div>
        </div>
        <Icon color="#4f8ef7">
          <rect x="3" y="4" width="14" height="9" rx="2" stroke="#4f8ef7" strokeWidth="1.5"/>
          <path d="M6 15L10 13L14 15" stroke="#4f8ef7" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
        </Icon>
      </div>
      <div className="lt-kpi">
        <div>
          <div className="lt-kpi-label">Фильмов</div>
          <div className="lt-kpi-value">{stats.total_movies}</div>
        </div>
        <Icon color="#f59e0b">
          <rect x="3" y="4" width="14" height="12" rx="2" stroke="#f59e0b" strokeWidth="1.5"/>
          <line x1="7" y1="4" x2="7" y2="16" stroke="#f59e0b" strokeWidth="1.2"/>
          <line x1="13" y1="4" x2="13" y2="16" stroke="#f59e0b" strokeWidth="1.2"/>
        </Icon>
      </div>
      <div className="lt-kpi">
        <div>
          <div className="lt-kpi-label">Обработано</div>
          <div className="lt-kpi-value">{totalSent.toLocaleString()}</div>
        </div>
        <Icon color="#8b5cf6">
          <circle cx="10" cy="10" r="6" stroke="#8b5cf6" strokeWidth="1.5"/>
          <path d="M7 10L9 12L13 8" stroke="#8b5cf6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </Icon>
      </div>
      <div className="lt-kpi">
        <div>
          <div className="lt-kpi-label">Фильм дня</div>
          {topMovie ? (
            <>
              <div className="lt-kpi-value" style={{ fontSize: 15, color: '#f59e0b', lineHeight: 1.3 }}>
                {topMovie.title.length > 20 ? topMovie.title.slice(0, 20) + '…' : topMovie.title}
              </div>
              <div style={{ fontSize: 12, color: '#475569', marginTop: 3 }}>
                {topMovie.comment_count} упом.
              </div>
            </>
          ) : <div className="lt-kpi-value">—</div>}
        </div>
        <Icon color="#f59e0b">
          <path d="M10 3C7 3 5 5.5 5 8C5 9.5 5.8 11 7 12L7 16C7 16.5 7.4 17 8 17L12 17C12.6 17 13 16.5 13 16L13 12C14.2 11 15 9.5 15 8C15 5.5 13 3 10 3Z" stroke="#f59e0b" strokeWidth="1.4" fill="none"/>
        </Icon>
      </div>
    </div>
  );
}

export default StatsCards;
