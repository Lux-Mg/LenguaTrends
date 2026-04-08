import React from 'react';
import { useLang } from '../i18n/LangContext';

const Icon = ({ color, children }) => (
  <div className="lt-kpi-icon" style={{ background: `${color}14` }}>
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      {children}
    </svg>
  </div>
);

function StatsCards({ stats, trends }) {
  const { t, getTitle } = useLang();
  if (!stats) return null;

  const totalSent = stats.by_sentiment.positive + stats.by_sentiment.negative + stats.by_sentiment.neutral;
  const topMovie = trends && trends.length > 0 ? trends[0] : null;

  return (
    <div className="lt-kpi-grid">
      <div className="lt-kpi">
        <div>
          <div className="lt-kpi-label">{t.kpiComments}</div>
          <div className="lt-kpi-value">{stats.total_comments?.toLocaleString()}</div>
        </div>
        <Icon color="#3498db">
          <rect x="3" y="4" width="14" height="9" rx="2" stroke="#3498db" strokeWidth="1.5"/>
          <path d="M6 15L10 13L14 15" stroke="#3498db" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
        </Icon>
      </div>
      <div className="lt-kpi">
        <div>
          <div className="lt-kpi-label">{t.kpiMovies}</div>
          <div className="lt-kpi-value">{stats.total_movies}</div>
        </div>
        <Icon color="#e67e22">
          <rect x="3" y="4" width="14" height="12" rx="2" stroke="#e67e22" strokeWidth="1.5"/>
          <line x1="7" y1="4" x2="7" y2="16" stroke="#e67e22" strokeWidth="1.2"/>
          <line x1="13" y1="4" x2="13" y2="16" stroke="#e67e22" strokeWidth="1.2"/>
        </Icon>
      </div>
      <div className="lt-kpi">
        <div>
          <div className="lt-kpi-label">{t.kpiProcessed}</div>
          <div className="lt-kpi-value">{totalSent.toLocaleString()}</div>
        </div>
        <Icon color="#2ecc71">
          <circle cx="10" cy="10" r="6" stroke="#2ecc71" strokeWidth="1.5"/>
          <path d="M7 10L9 12L13 8" stroke="#2ecc71" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </Icon>
      </div>
      <div className="lt-kpi">
        <div>
          <div className="lt-kpi-label">{t.kpiTopMovie}</div>
          {topMovie ? (
            <>
              <div className="lt-kpi-value" style={{ fontSize: 15, color: '#e74c3c', lineHeight: 1.3 }}>
                {(() => { const title = getTitle(topMovie); return title.length > 20 ? title.slice(0, 20) + '…' : title; })()}
              </div>
              <div style={{ fontSize: 12, color: '#95a5a6', marginTop: 3 }}>
                {topMovie.comment_count} {t.kpiMentions}
              </div>
            </>
          ) : <div className="lt-kpi-value">—</div>}
        </div>
        <Icon color="#e74c3c">
          <path d="M10 3C7 3 5 5.5 5 8C5 9.5 5.8 11 7 12L7 16C7 16.5 7.4 17 8 17L12 17C12.6 17 13 16.5 13 16L13 12C14.2 11 15 9.5 15 8C15 5.5 13 3 10 3Z" stroke="#e74c3c" strokeWidth="1.4" fill="none"/>
        </Icon>
      </div>
    </div>
  );
}

export default StatsCards;
