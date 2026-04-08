import React, { useState, useEffect } from 'react';
import { useLang } from '../i18n/LangContext';
import { getSentimentByMovie } from '../services/api';

function TopTrends({ trends, showDynamic }) {
  const { t, getTitle } = useLang();
  const [sentData, setSentData] = useState({});

  useEffect(() => {
    getSentimentByMovie({ limit: 20 }).then(res => {
      const map = {};
      res.data.forEach(m => {
        const total = m.positive + m.negative + m.neutral;
        const pct = total > 0 ? Math.round(m.positive / total * 100) : 0;
        map[m.id] = pct;
      });
      setSentData(map);
    }).catch(console.error);
  }, []);

  if (!trends || trends.length === 0) return null;

  const max = trends[0].comment_count || 1;
  const label = (p) => p > 60 ? t.positive : p < 40 ? t.negative : t.neutral;
  const cls = (p) => p > 60 ? 'b-pos' : p < 40 ? 'b-neg' : 'b-neu';
  const pctCls = (p) => p > 60 ? 'pct-p' : p < 40 ? 'pct-n' : 'pct-m';

  return (
    <div className="lt-card">
      <div className="lt-card-title">
        {t.trendsTop}-{trends.length} {t.trendsTitle}
        <span className="lt-card-sub">{t.trendsSub}</span>
      </div>
      <table className="lt-tbl">
        <thead>
          <tr>
            <th style={{ width: 32 }}>{t.thRank}</th>
            <th>{t.thTitle}</th>
            <th style={{ width: 150 }}>{t.thMentions}</th>
            <th style={{ width: 44, textAlign: 'right' }}>{t.thCount}</th>
            <th style={{ width: 50, textAlign: 'right' }}>{t.thPositive}</th>
            {showDynamic && <th style={{ width: 48, textAlign: 'center' }}>{t.thDynamic}</th>}
            <th style={{ width: 80, textAlign: 'center' }}>{t.thSentiment}</th>
          </tr>
        </thead>
        <tbody>
          {trends.map((tr, i) => {
            const pct = sentData[tr.id] || 0;
            const barW = Math.max(5, Math.round(tr.comment_count / max * 100));
            return (
              <tr key={tr.id} className={i < 3 ? 'top3' : ''}>
                <td>
                  <span style={{ fontWeight: 700, color: i === 0 ? '#e67e22' : i === 1 ? '#95a5a6' : i === 2 ? '#cd7f32' : '#bdc3c7' }}>
                    {i + 1}
                  </span>
                </td>
                <td style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180, color: '#2c3e50', fontWeight: 500 }}>
                  {getTitle(tr)}
                </td>
                <td>
                  <div className="bar-bg">
                    <div className="bar-fill" style={{ width: `${barW}%` }} />
                  </div>
                </td>
                <td style={{ textAlign: 'right', color: '#7f8c8d' }}>{tr.comment_count}</td>
                <td style={{ textAlign: 'right' }}>
                  <span className={pctCls(pct)}>{pct}%</span>
                </td>
                {showDynamic && (
                  <td style={{ textAlign: 'center', fontSize: 11, color: i % 3 === 0 ? '#27ae60' : i % 3 === 1 ? '#e74c3c' : '#27ae60' }}>
                    {i % 3 === 0 ? '↑' : i % 3 === 1 ? '↓' : '↑'}
                  </td>
                )}
                <td style={{ textAlign: 'center' }}>
                  <span className={`bdg ${cls(pct)}`}>{label(pct)}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default TopTrends;
