import React from 'react';
import { useLang } from '../i18n/LangContext';

function StatsCards({ stats, trends }) {
  const { t, getTitle } = useLang();
  if (!stats) return null;

  const totalSent = stats.by_sentiment.positive + stats.by_sentiment.negative + stats.by_sentiment.neutral;
  const topMovie = trends && trends.length > 0 ? trends[0] : null;

  return (
    <div className="lt-kpi-grid">
      <div className="lt-kpi">
        <div className="lt-kpi-label">{t.kpiComments}</div>
        <div className="lt-kpi-value">{stats.total_comments?.toLocaleString()}</div>
      </div>
      <div className="lt-kpi">
        <div className="lt-kpi-label">{t.kpiMovies}</div>
        <div className="lt-kpi-value">{stats.total_movies}</div>
      </div>
      <div className="lt-kpi">
        <div className="lt-kpi-label">{t.kpiProcessed}</div>
        <div className="lt-kpi-value">{totalSent.toLocaleString()}</div>
      </div>
      <div className="lt-kpi">
        <div className="lt-kpi-label">{t.kpiTopMovie}</div>
        {topMovie ? (
          <>
            <div className="lt-kpi-value" style={{ fontSize: 19, color: '#e74c3c', lineHeight: 1.25 }}>
              {(() => { const title = getTitle(topMovie); return title.length > 26 ? title.slice(0, 26) + '…' : title; })()}
            </div>
            <div style={{ fontSize: 12, color: '#95a5a6', marginTop: 4 }}>
              {topMovie.comment_count?.toLocaleString()} {t.kpiMentions}
            </div>
          </>
        ) : <div className="lt-kpi-value">—</div>}
      </div>
    </div>
  );
}

export default StatsCards;
