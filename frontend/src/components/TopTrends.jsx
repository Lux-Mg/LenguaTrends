import React, { useState, useEffect } from 'react';
import { getSentimentByMovie } from '../services/api';

function TopTrends({ trends, showDynamic }) {
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
  const label = (p) => p > 60 ? 'Позитив' : p < 40 ? 'Негатив' : 'Нейтрал';
  const cls = (p) => p > 60 ? 'b-pos' : p < 40 ? 'b-neg' : 'b-neu';
  const pctCls = (p) => p > 60 ? 'pct-p' : p < 40 ? 'pct-n' : 'pct-m';

  return (
    <div className="lt-card">
      <div className="lt-card-title">
        Топ-{trends.length} трендов
        <span className="lt-card-sub">по числу упоминаний</span>
      </div>
      <table className="lt-tbl">
        <thead>
          <tr>
            <th style={{ width: 32 }}>#</th>
            <th>Название</th>
            <th style={{ width: 150 }}>Упоминаний</th>
            <th style={{ width: 44, textAlign: 'right' }}>Кол.</th>
            <th style={{ width: 50, textAlign: 'right' }}>Поз.%</th>
            {showDynamic && <th style={{ width: 48, textAlign: 'center' }}>Динам.</th>}
            <th style={{ width: 80, textAlign: 'center' }}>Тональность</th>
          </tr>
        </thead>
        <tbody>
          {trends.map((t, i) => {
            const pct = sentData[t.id] || 0;
            const barW = Math.max(5, Math.round(t.comment_count / max * 100));
            return (
              <tr key={t.id} className={i < 3 ? 'top3' : ''}>
                <td>
                  <span style={{ fontWeight: 700, color: i === 0 ? '#f59e0b' : i === 1 ? '#94a3b8' : i === 2 ? '#cd7f32' : '#334155' }}>
                    {i + 1}
                  </span>
                </td>
                <td style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180 }}>
                  {t.title}
                </td>
                <td>
                  <div className="bar-bg">
                    <div className="bar-fill" style={{ width: `${barW}%` }} />
                  </div>
                </td>
                <td style={{ textAlign: 'right', color: '#64748b' }}>{t.comment_count}</td>
                <td style={{ textAlign: 'right' }}>
                  <span className={pctCls(pct)}>{pct}%</span>
                </td>
                {showDynamic && (
                  <td style={{ textAlign: 'center', fontSize: 11, color: i % 3 === 0 ? '#22c55e' : i % 3 === 1 ? '#ef4444' : '#22c55e' }}>
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
